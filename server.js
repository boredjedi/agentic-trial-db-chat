const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { getCompletion, getCompletionWithHistory, setup } = require('./app.js');
const OpenAI = require('openai');
const axios = require('axios');
const Busboy = require('busboy');
const { chatWithMainAgent } = require('./agents/main-agent');
const { askNoodle } = require('./agents/noodle-agent');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Global vector store management
let vectorStoreId = null;
let processingFiles = new Set();

const PORT = 3000;

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

// Create or get vector store
async function getOrCreateVectorStore() {
    if (vectorStoreId) {
        return vectorStoreId;
    }
    
    try {
        // First, try to find existing vector stores
        console.log('🔍 Looking for existing vector stores...');
        const vectorStores = await openai.vectorStores.list();
        
        // Log all vector stores found
        console.log(`📋 Found ${vectorStores.data.length} vector stores:`);
        vectorStores.data.forEach((store, index) => {
            console.log(`  ${index + 1}. ID: ${store.id}, Name: "${store.name || 'unnamed'}", Files: ${store.file_counts?.total || 0}`);
        });
        
        // Look for a vector store named "knowledge_base"
        const existingStore = vectorStores.data.find(store => store.name === "knowledge_base");
        
        if (existingStore) {
            vectorStoreId = existingStore.id;
            process.env.VECTOR_STORE_ID = vectorStoreId;
            console.log(`✅ Found existing vector store: ${vectorStoreId}`);
            console.log(`🔍 Dashboard vector store ID: vs_6869887239708191885dbfef63ab231c`);
            console.log(`🔍 Match status: ${vectorStoreId === 'vs_6869887239708191885dbfef63ab231c' ? '✅ MATCH' : '❌ NO MATCH'}`);
            return vectorStoreId;
        }
        
        // If no existing store found, create a new one
        console.log('📝 Creating new vector store...');
        const vectorStore = await openai.vectorStores.create({
            name: "knowledge_base"
        });
        vectorStoreId = vectorStore.id;
        
        // Store in environment for app.js to use
        process.env.VECTOR_STORE_ID = vectorStoreId;
        
        console.log(`✅ Created vector store: ${vectorStoreId}`);
        return vectorStoreId;
    } catch (error) {
        console.error('❌ Failed to get or create vector store:', error.message);
        throw error;
    }
}

// Add file to vector store
async function addFileToVectorStore(fileId, filename) {
    try {
        const vectorStartTime = Date.now();
        const storeId = await getOrCreateVectorStore();
        
    
        
        console.log('⏳ Adding file to vector store...');
        const addStartTime = Date.now();
        
        // Add file to vector store using direct API call

        
        const addFileResponse = await axios.post(`https://api.openai.com/v1/vector_stores/${storeId}/files`, {
            file_id: fileId
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        

        
        const addTime = Date.now() - addStartTime;
        console.log(`✅ Added file ${filename} to vector store in ${addTime}ms`);
        
        // Wait for file to be processed
        console.log('⏳ Waiting for file processing...');
        const processStartTime = Date.now();
        
        // Use the file ID from the vector store response, not the original file ID
        const vectorStoreFileId = addFileResponse.data.id;

        await waitForFileProcessing(storeId, vectorStoreFileId);
        const processTime = Date.now() - processStartTime;
        
        const totalVectorTime = Date.now() - vectorStartTime;
        console.log(`✅ Vector store processing completed in ${processTime}ms (total: ${totalVectorTime}ms)`);
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to add file to vector store:`, error.message);
        if (error.response) {
            console.error(`🔍 Error response status: ${error.response.status}`);
            console.error(`🔍 Error response data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

// Wait for file to be processed
async function waitForFileProcessing(storeId, fileId, maxAttempts = 60) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            
            
            // Use direct API call instead of SDK
            const result = await axios.get(`https://api.openai.com/v1/vector_stores/${storeId}/files`, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            

            
            // The API returns files with 'id' field, not 'file_id'
            const file = result.data.data.find(f => f.id === fileId);

            
            if (file && file.status === 'completed') {
                console.log(`✅ File processing completed on attempt ${attempt}`);
                return true;
            } else if (file && file.status === 'failed') {
                const errorMessage = file.last_error?.message || file.last_error?.code || 'Unknown error';
                console.log(`❌ File processing failed with error:`, JSON.stringify(file.last_error, null, 2));
                throw new Error(`File processing failed: ${errorMessage}`);
            } else if (file && file.status === 'in_progress') {
                // File is still processing, continue waiting
                const elapsed = attempt * 2; // 2 seconds per attempt
                console.log(`⏳ File processing... attempt ${attempt}/${maxAttempts} (${elapsed}s elapsed)`);
            } else {
                // File not found or unknown status
                console.log(`⚠️ File not found or unknown status:`, file ? file.status : 'not found');
                const elapsed = attempt * 2; // 2 seconds per attempt
                console.log(`⏳ File processing... attempt ${attempt}/${maxAttempts} (${elapsed}s elapsed)`);
            }
            
            // Increase wait time for large files
            const waitTime = Math.min(2000 + (attempt * 500), 10000); // 2-10 seconds
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
        } catch (error) {
            console.error(`❌ Error checking file status:`, error.message);
            if (attempt === maxAttempts) throw error;
        }
    }
    
    throw new Error('File processing timeout');
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if API is configured
function checkApiStatus() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) return false;
        
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyLine = envContent.split('\n').find(line => 
            line.trim().startsWith('OPENAI_API_KEY=') && 
            !line.includes('your_api_key_here')
        );
        
        return !!apiKeyLine;
    } catch {
        return false;
    }
}

// Handle chat using OpenAI Assistants v2 API (new thread per session)
async function handleChatWithAssistants(prompt, messageHistory, debugMode, fileIds, threadId) {
    try {
        console.log('🤖 Using OpenAI Assistants v2 API for chat with tools support');
        
        // Create or get assistant
        let assistantId = process.env.ASSISTANT_ID;
        if (!assistantId) {
            console.log('📝 Creating new assistant...');
            
            // Get or create vector store first
            const vectorStoreId = await getOrCreateVectorStore();
            
            // Import available tools from tools.js
            const { AVAILABLE_TOOLS } = require('./tools.js');
            
            const assistant = await openai.beta.assistants.create({
                name: "Knowledge Base Assistant",
                instructions: `You are a helpful assistant with access to multiple tools and uploaded knowledge base files. 
                
                Available tools:
                1. file_search - Search through uploaded knowledge base files for specific information
                2. web_search - Search the internet for current information when needed
                3. get_weather - Get current weather information for any location
                4. get_current_time - Get current time in any timezone
                
                When answering questions:
                - First try file_search if the question might be answered by uploaded files
                - If no relevant information is found in files, use web_search for current information
                - Use appropriate tools based on the user's needs
                - Always provide accurate, helpful responses using the best available information`,
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                tools: [
                    {
                        type: "file_search"
                    },
                    ...AVAILABLE_TOOLS
                ],
                tool_resources: {
                    file_search: {
                        vector_store_ids: [vectorStoreId]
                    }
                }
            });
            assistantId = assistant.id;
            process.env.ASSISTANT_ID = assistantId;
            console.log(`✅ Created assistant: ${assistantId}`);
            console.log(`📁 Attached vector store: ${vectorStoreId}`);
        }
        
        // Create new thread if not provided (new session)
        let thread;
        if (!threadId) {
            console.log('🧵 Creating new thread for this session...');
            thread = await openai.beta.threads.create();
            console.log(`✅ Created thread: ${thread.id}`);
        } else {
            console.log(`🧵 Using existing thread: ${threadId}`);
            thread = { id: threadId };
        }
        
        // Add user message to thread
        console.log('💬 Adding user message to thread...');
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: prompt
        });
        
        // Create run with file IDs if available
        console.log('🏃 Creating run...');
        const runParams = {
            assistant_id: assistantId
        };
        
        // Add file IDs to the run if available
        if (fileIds && fileIds.length > 0) {
            console.log(`📁 Adding ${fileIds.length} files to run:`, fileIds);
            runParams.file_ids = fileIds;
        }
        
        const run = await openai.beta.threads.runs.create(thread.id, runParams);
        console.log(`✅ Created run: ${run.id}`);
        
        // Wait for run to complete
        console.log('⏳ Waiting for run to complete...');
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            console.log(`⏳ Run status: ${runStatus.status}`);
        }
        
        if (runStatus.status === 'failed') {
            throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
        
        if (runStatus.status === 'requires_action') {
            console.log('🔧 Run requires action, handling tool calls...');
            // Handle tool calls if needed
            await handleToolCalls(thread.id, run.id, runStatus);
            // Wait for completion after tool calls
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            }
        }
        
        // Get the assistant's response
        console.log('📥 Getting assistant response...');
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
        
        if (!assistantMessage) {
            throw new Error('No assistant response found');
        }
        
        const response = assistantMessage.content[0]?.text?.value || 'No response content';
        
        // Prepare result
        const result = {
            response: response,
            threadId: thread.id,
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            usage: {
                total_tokens: 0, // Assistants API doesn't provide token usage in the same way
                prompt_tokens: 0,
                completion_tokens: 0
            }
        };
        
        if (debugMode) {
            result.debug = {
                assistantId: assistantId,
                runId: run.id,
                runStatus: runStatus.status,
                fileIds: fileIds || []
            };
        }
        
        console.log('✅ Chat completed successfully');
        return result;
        
    } catch (error) {
        console.error('❌ Chat error:', error.message);
        throw error;
    }
}

// Handle tool calls from assistant
async function handleToolCalls(threadId, runId, runStatus) {
    console.log('🔧 Processing tool calls...');
    
    if (runStatus.required_action?.type === 'submit_tool_outputs') {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
            console.log(`🔧 Processing tool call: ${toolCall.function?.name || toolCall.type}`);
            
            try {
                let result;
                
                if (toolCall.function?.name) {
                    // Handle custom function tools
                    const { executeToolFunction } = require('./tools.js');
                    console.log(`🛠️ Executing function: ${toolCall.function.name}`);
                    console.log(`📋 Arguments: ${toolCall.function.arguments}`);
                    
                    result = await executeToolFunction(toolCall);
                    
                    toolOutputs.push({
                        tool_call_id: toolCall.id,
                        output: JSON.stringify(result)
                    });
                    
                    console.log(`✅ Function ${toolCall.function.name} completed successfully`);
                } else {
                    // Handle built-in tools (like file_search) - these are handled automatically by OpenAI
                    console.log(`ℹ️ Built-in tool call: ${toolCall.type}`);
                }
            } catch (error) {
                console.error(`❌ Tool call failed: ${error.message}`);
                toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify({ error: error.message })
                });
            }
        }
        
        // Submit tool outputs
        if (toolOutputs.length > 0) {
            console.log('📤 Submitting tool outputs...');
            await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
                tool_outputs: toolOutputs
            });
        }
    }
}

// Handle requests
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoints
    if (pathname === '/api/chat' && req.method === 'POST') {
        // Validate Content-Type
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Content-Type must be application/json' }));
            return;
        }
        
        let body = '';
        let bodySize = 0;
        const maxBodySize = 1024 * 1024; // 1MB limit
        
        req.on('data', chunk => {
            bodySize += chunk.length;
            if (bodySize > maxBodySize) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Request body too large' }));
                return;
            }
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const { prompt, agent = 'main' } = JSON.parse(body);
                console.log(`🔍 Chat request - Agent: ${agent}, Prompt: ${prompt.substring(0, 50)}...`);
                
                let result;
                
                // Park main agent - only use Noodle for now
                console.log('📚 Using Noodle agent...');
                const response = await askNoodle(prompt);
                result = {
                    response: response,
                    agent: 'noodle'
                };
                
                console.log(`✅ Response from ${agent}:`, result.response ? 'Has response' : 'No response');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                console.error('❌ Chat error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/api/status' && req.method === 'GET') {
        const isConfigured = checkApiStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ api_configured: isConfigured }));
        return;
    }

    if (pathname === '/api/processing-status' && req.method === 'GET') {
        const parsedUrl = url.parse(req.url, true);
        const fileId = parsedUrl.query.fileId;
        
        if (!fileId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'fileId parameter required' }));
            return;
        }
        
        const isProcessing = processingFiles.has(fileId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            processing: isProcessing,
            fileId: fileId
        }));
        return;
    }

    if (pathname === '/api/upload' && req.method === 'POST') {
        // Handle file upload using busboy
        try {
            const startTime = Date.now();
            console.log('📁 Processing file upload...');
            console.log('Content-Type:', req.headers['content-type']);

            const busboy = Busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } });
            let fileBuffer = Buffer.alloc(0);
            let fileInfo = null;
            let fileReceived = false;

            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                fileInfo = { filename, mimetype };
                console.log('File part found:', { filename, encoding, mimeType: mimetype });
                
                // Collect file data chunks
                const chunks = [];
                file.on('data', (data) => {
                    chunks.push(data);
                });
                file.on('end', () => {
                    // Combine all chunks into the file buffer
                    fileBuffer = Buffer.concat(chunks);
                    fileReceived = true;
                });
            });

            busboy.on('finish', async () => {
                try {
                    if (!fileReceived || !fileInfo) {
                        throw new Error('No file found in request');
                    }
                    
                    // Extract the actual filename string from the object if needed
                    let realFilename = 'uploaded-file';
                    if (typeof fileInfo.filename === 'string') {
                        realFilename = fileInfo.filename;
                    } else if (fileInfo.filename && typeof fileInfo.filename.filename === 'string') {
                        realFilename = fileInfo.filename.filename;
                    }
                    
                    console.log('File part found:', fileInfo.filename);
                    console.log('File content type:', fileInfo.mimetype);
                    console.log('File size:', formatFileSize(fileBuffer.length));

                    // Create file for OpenAI
                    console.log('⏳ Uploading to OpenAI API...');
                    const openaiStartTime = Date.now();

                    // Use axios with AbortController for reliable timeout handling
                    const uploadTimeout = Math.max(30000, fileBuffer.length / 50); // 30s minimum, 1ms per 50 bytes
                    console.log(`⏱️ Upload timeout set to ${uploadTimeout}ms for ${formatFileSize(fileBuffer.length)} file`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), uploadTimeout);

                    let result;
                    try {
                        // Create FormData for the file
                        const FormData = require('form-data');
                        const form = new FormData();

                        // Create a readable stream from the buffer and append to form
                        const { Readable } = require('stream');
                        const stream = new Readable();
                        stream.push(fileBuffer);
                        stream.push(null); // End the stream
                        
                        form.append('file', stream, {
                            filename: realFilename,
                            contentType: fileInfo.mimetype || 'application/octet-stream'
                        });
                        form.append('purpose', 'assistants');
                        // Make direct API call with axios
                        const response = await axios.post('https://api.openai.com/v1/files', form, {
                            headers: {
                                ...form.getHeaders(),
                                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                            },
                            timeout: uploadTimeout,
                            signal: controller.signal,
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity
                        });
                        result = response.data;
                        clearTimeout(timeoutId);
                    } catch (uploadError) {
                        clearTimeout(timeoutId);
                        if (uploadError.code === 'ECONNABORTED' || uploadError.name === 'AbortError') {
                            console.error(`❌ Upload timeout after ${uploadTimeout}ms`);
                            throw new Error(`Upload timeout after ${uploadTimeout}ms`);
                        } else {
                            console.error(`❌ Upload failed:`, uploadError.message);
                            throw new Error(`Upload failed: ${uploadError.message}`);
                        }
                    }
                    const openaiTime = Date.now() - openaiStartTime;
                    console.log(`✅ OpenAI upload completed in ${openaiTime}ms`);
                    // Add file to processing set
                    processingFiles.add(result.id);
                    // Process file in background
                    console.log('⏳ Starting vector store processing in background...');
                    addFileToVectorStore(result.id, realFilename)
                        .then(() => {
                            processingFiles.delete(result.id);
                            const totalTime = Date.now() - startTime;
                            console.log(`✅ File ${realFilename} fully processed in ${totalTime}ms total`);
                        })
                        .catch((error) => {
                            processingFiles.delete(result.id);
                            console.error(`❌ Failed to process file ${realFilename}:`, error.message);
                        });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        fileId: result.id,
                        filename: realFilename,
                        processing: true
                    }));
                } catch (error) {
                    console.error('File upload error:', error);
                    console.error('Error stack:', error.stack);
                    if (!res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: false, 
                            error: error.message,
                            details: error.stack
                        }));
                    }
                }
            });
            busboy.on('error', (err) => {
                console.error('❌ Busboy error:', err);
                if (!res.headersSent) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Busboy error: ' + err.message }));
                }
            });
            req.pipe(busboy);
        } catch (error) {
            console.error('File upload error:', error);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        }
        return;
    }

    // Serve marked library from node_modules
    if (pathname === '/lib/marked.min.js') {
        try {
            const markedPath = path.join(__dirname, 'node_modules', 'marked', 'marked.min.js');
            if (fs.existsSync(markedPath)) {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                const fileStream = fs.createReadStream(markedPath);
                fileStream.pipe(res);
                return;
            }
        } catch (error) {
            // Fallback to CDN if local file not found
        }
    }

    // Static file serving
    let filePath = pathname === '/' ? '/chat.html' : pathname;
    
    // Special route for test upload page
    if (pathname === '/test-upload') {
        filePath = path.join(__dirname, '/test-upload.html');
    } else if (pathname === '/simple-test') {
        filePath = path.join(__dirname, '/test-simple-upload.html');
    } else {
        filePath = path.join(__dirname, filePath);
    }

    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    try {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            const ext = path.extname(filePath);
            const mimeType = mimeTypes[ext] || 'text/plain';
            
            res.writeHead(200, { 'Content-Type': mimeType });
            const fileStream = fs.createReadStream(filePath);
            fileStream.on('error', (error) => {
                console.error('File stream error:', error.message);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            });
            fileStream.pipe(res);
            return;
        }
    } catch (error) {
        // File not found, continue to 404
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Chat interface: http://localhost:${PORT}/chat.html`);
    console.log(`Test upload page: http://localhost:${PORT}/test-upload`);
    console.log(`Simple upload test: http://localhost:${PORT}/simple-test`);
    console.log(`Vector store test: node test-vector-store.js`);
    console.log(`File search test: node test-file-search.js`);
    console.log(`Complete workflow test: node test-complete-workflow.js`);
    console.log(`Upload timing test: node test-upload-timing.js`);
    console.log('');
    
    if (checkApiStatus()) {
        console.log('✅ OpenAI API key is configured');
    } else {
        console.log('⚠️  OpenAI API key not configured');
        console.log('   Run: node app.js setup');
        console.log('   Then edit .env file with your API key');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
