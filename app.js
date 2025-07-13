const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { AVAILABLE_TOOLS, executeToolFunction } = require('./tools/tools');

// Configuration
const ENV_FILE = path.join(process.cwd(), '.env');

// Setup function to create .env file
function setup() {
    const envContent = `# OpenAI Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_api_key_here

# Optional: Model configuration
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=50000
OPENAI_TEMPERATURE=0.7
`;

    try {
        if (fs.existsSync(ENV_FILE)) {
            console.log('⚠️  .env file already exists');
            console.log('   Edit it manually to update your API key');
            return;
        }

        fs.writeFileSync(ENV_FILE, envContent);
        console.log('✅ Created .env file');
        console.log('   Please edit it and add your OpenAI API key');
        console.log('   Get your key from: https://platform.openai.com/api-keys');
    } catch (error) {
        console.error('❌ Failed to create .env file:', error.message);
    }
}

// Load environment variables
function loadEnv() {
    try {
        if (!fs.existsSync(ENV_FILE)) {
            throw new Error('.env file not found. Run: node app.js setup');
        }

        const envContent = fs.readFileSync(ENV_FILE, 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key] = valueParts.join('=');
                }
            }
        }

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
            throw new Error('OPENAI_API_KEY not configured in .env file');
        }

    } catch (error) {
        throw new Error(`Configuration error: ${error.message}`);
    }
}

// Make OpenAI API request using SDK
async function makeOpenAIRequest(messages, tools = null, fileIds = []) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4';
    
    // Validate and parse numeric environment variables
    const maxTokens = Math.max(1, Math.min(100000, parseInt(process.env.OPENAI_MAX_TOKENS) || 2000));
    const temperature = Math.max(0, Math.min(2, parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7));

    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: apiKey
    });

    const requestOptions = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature
    };

    if (tools && tools.length > 0) {
        requestOptions.tools = tools;
        requestOptions.tool_choice = 'auto';
    }

    // Add file attachments if provided
    if (fileIds && fileIds.length > 0) {
        requestOptions.file_ids = fileIds;
    }
    
    // Add vector store if available (for knowledge base)
    if (process.env.VECTOR_STORE_ID) {
        requestOptions.vector_store_id = process.env.VECTOR_STORE_ID;
    }

    try {
        const completion = await openai.chat.completions.create(requestOptions);
        return completion;
    } catch (error) {
        throw new Error(`OpenAI API error: ${error.message}`);
    }
}

// Get completion with automatic tool usage
async function getCompletion(prompt, enableTools = true, debugMode = false) {
    try {
        loadEnv();

        const messages = [
            {
                role: 'system',
                content: 'You are a helpful teacher. Guide the user through the solution step by step. When a user asks for weather information, always use the get_weather tool with the specified location. If they mention a location in response to a weather query, call the get_weather tool with that location. When users ask questions that might be answered by content in uploaded knowledge base files, use the file_search tool to find relevant information before responding. Always prioritize searching the knowledge base when the question relates to specific documents or files that have been uploaded.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        console.log('🤖 Sending request to OpenAI...');
        
        // Include tools if enabled
        const tools = enableTools ? AVAILABLE_TOOLS : null;
        const response = await makeOpenAIRequest(messages, tools);
        
        if (debugMode) {
            console.log('🔍 Initial AI Response (before tool execution):');
            console.log(JSON.stringify(response.choices[0].message, null, 2));
            console.log('');
        }
        
        const result = {
            response: response.choices[0].message.content,
            usage: response.usage,
            model: response.model,
            tools_used: [],
            tool_outputs: []
        };

        // Handle tool calls if present
        const message = response.choices[0].message;
        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log(`🔧 AI wants to use ${message.tool_calls.length} tool(s)`);
            
            if (debugMode) {
                console.log('📋 Tool Request Details:');
                console.log(JSON.stringify(message.tool_calls, null, 2));
                console.log('');
            }
            
            // Execute each tool call
            const toolMessages = [...messages, message]; // Add assistant message with tool calls
            
            for (const toolCall of message.tool_calls) {
                try {
                    console.log(`🔧 Executing tool: ${toolCall.function.name}`);
                    
                    if (debugMode) {
                        console.log(`📥 Tool Input: ${JSON.stringify(JSON.parse(toolCall.function.arguments), null, 2)}`);
                    }
                    
                    const toolOutput = await executeToolFunction(toolCall);
                    
                    if (debugMode) {
                        console.log(`📤 Tool Output: ${JSON.stringify(toolOutput, null, 2)}`);
                        console.log('');
                    }
                    
                    // Store tool usage info
                    result.tools_used.push({
                        name: toolCall.function.name,
                        arguments: JSON.parse(toolCall.function.arguments),
                        output: toolOutput
                    });
                    
                    result.tool_outputs.push(toolOutput);
                    
                    // Add tool result to conversation
                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolOutput)
                    });
                    
                    console.log(`✅ Tool ${toolCall.function.name} executed successfully`);
                    
                } catch (error) {
                    console.error(`❌ Tool execution failed:`, error.message);
                    
                    // Add error to conversation
                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: `Error: ${error.message}`
                    });
                }
            }
            
            console.log('🤖 Getting final response with tool results...');
            
            if (debugMode) {
                console.log('📋 Complete toolMessages array being sent to AI:');
                console.log(JSON.stringify(toolMessages, null, 2));
                console.log('');
            }
            
            const finalResponse = await makeOpenAIRequest(toolMessages, tools);
            
            if (debugMode) {
                console.log('🎯 Final AI Response:');
                console.log(JSON.stringify(finalResponse.choices[0].message, null, 2));
                console.log('');
            }
            
            // Update result with final response
            result.response = finalResponse.choices[0].message.content;
            result.usage.total_tokens += finalResponse.usage.total_tokens;
            result.usage.prompt_tokens += finalResponse.usage.prompt_tokens;
            result.usage.completion_tokens += finalResponse.usage.completion_tokens;
        }

        return result;

    } catch (error) {
        return {
            error: error.message,
            response: null,
            usage: null,
            model: null,
            tools_used: [],
            tool_outputs: []
        };
    }
}

// Get completion with conversation history for web interface
async function getCompletionWithHistory(messageHistory, enableTools = true, debugMode = false, fileIds = []) {
    try {
        loadEnv();

        // Add system message if not present
        const messages = [...messageHistory];
        if (messages.length === 0 || messages[0].role !== 'system') {
            messages.unshift({
                role: 'system',
                content: 'You are a helpful teacher. Guide the user through the solution step by step. When a user asks for weather information, always use the get_weather tool with the specified location. If they mention a location in response to a weather query, call the get_weather tool with that location. When users ask questions that might be answered by content in uploaded knowledge base files, use the file_search tool to find relevant information before responding. Always prioritize searching the knowledge base when the question relates to specific documents or files that have been uploaded.'
            });
        }

        console.log('🤖 Sending request to OpenAI with conversation history...');
        
        // Include tools if enabled
        const tools = enableTools ? AVAILABLE_TOOLS : null;
        const response = await makeOpenAIRequest(messages, tools, fileIds);
        
        if (debugMode) {
            console.log('🔍 Initial AI Response (before tool execution):');
            console.log(JSON.stringify(response.choices[0].message, null, 2));
            console.log('');
        }
        
        const result = {
            response: response.choices[0].message.content,
            usage: response.usage,
            model: response.model,
            tools_used: [],
            tool_outputs: [],
            updated_messages: [...messages] // Include the conversation history
        };

        // Handle tool calls if present
        const message = response.choices[0].message;
        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log(`🔧 AI wants to use ${message.tool_calls.length} tool(s)`);
            
            // Execute each tool call
            const toolMessages = [...messages, message]; // Add assistant message with tool calls
            
            for (const toolCall of message.tool_calls) {
                try {
                    console.log(`🔧 Executing tool: ${toolCall.function.name}`);
                    
                    if (debugMode) {
                        console.log(`📥 Tool Input: ${JSON.stringify(JSON.parse(toolCall.function.arguments), null, 2)}`);
                    }
                    
                    const toolOutput = await executeToolFunction(toolCall);
                    
                    if (debugMode) {
                        console.log(`📤 Tool Output: ${JSON.stringify(toolOutput, null, 2)}`);
                        console.log('');
                    }
                    
                    // Store tool usage info
                    result.tools_used.push({
                        name: toolCall.function.name,
                        arguments: JSON.parse(toolCall.function.arguments),
                        output: toolOutput
                    });
                    
                    result.tool_outputs.push(toolOutput);
                    
                    // Add tool result to conversation
                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolOutput)
                    });
                    
                    console.log(`✅ Tool ${toolCall.function.name} executed successfully`);
                    
                } catch (error) {
                    console.error(`❌ Tool execution failed:`, error.message);
                    
                    // Add error to conversation
                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: `Error: ${error.message}`
                    });
                }
            }
            
            console.log('🤖 Getting final response with tool results...');
            
            if (debugMode) {
                console.log('📋 Complete toolMessages array being sent to AI:');
                console.log(JSON.stringify(toolMessages, null, 2));
                console.log('');
            }
            
            const finalResponse = await makeOpenAIRequest(toolMessages, tools);
            
            if (debugMode) {
                console.log('🎯 Final AI Response:');
                console.log(JSON.stringify(finalResponse.choices[0].message, null, 2));
                console.log('');
            }
            
            // Update result with final response
            result.response = finalResponse.choices[0].message.content;
            result.usage.total_tokens += finalResponse.usage.total_tokens;
            result.usage.prompt_tokens += finalResponse.usage.prompt_tokens;
            result.usage.completion_tokens += finalResponse.usage.completion_tokens;
            
            // Update conversation history with final assistant message
            result.updated_messages = [...toolMessages, finalResponse.choices[0].message];
        } else {
            // No tools used, just add the assistant response to history
            result.updated_messages = [...messages, response.choices[0].message];
        }

        return result;

    } catch (error) {
        return {
            error: error.message,
            response: null,
            usage: null,
            model: null,
            tools_used: [],
            tool_outputs: [],
            updated_messages: messageHistory // Return original history on error
        };
    }
}

// CLI interface
async function runCLI() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help') {
        console.log('OpenAI Chat CLI');
        console.log('');
        console.log('Usage:');
        console.log('  node app.js setup           # Create .env file');
        console.log('  node app.js <prompt>        # Chat with AI');
        console.log('  node app.js debug <prompt>  # Chat with AI (debug mode)');
        console.log('  node app.js help            # Show this help');
        console.log('');
        console.log('Examples:');
        console.log('  node app.js "Hello, how are you?"');
        console.log('  node app.js "What time is it?"');
        console.log('  node app.js "What\'s the weather in London?"');
        console.log('  node app.js debug "Get time in Tokyo and weather in Dubai"');
        return;
    }

    if (args[0] === 'setup') {
        setup();
        return;
    }

    // Check for debug mode
    const debugMode = args[0] === 'debug';
    const prompt = debugMode ? args.slice(1).join(' ') : args.join(' ');
    
    // Validate prompt
    if (!prompt || prompt.trim() === '') {
        console.log('❌ Error: Please provide a prompt');
        console.log('   Usage: node app.js "Your prompt here"');
        console.log('   Example: node app.js "Hello, how are you?"');
        return;
    }
    
    console.log(`💬 You: ${prompt}`);
    console.log('');

    const result = await getCompletion(prompt, true, debugMode);
    
    if (result.error) {
        console.log(`❌ Error: ${result.error}`);
        if (result.error.includes('not configured')) {
            console.log('   Run: node app.js setup');
            console.log('   Then edit .env file with your API key');
        }
    } else {
        console.log(`🤖 AI: ${result.response}`);
        console.log('');
        
        if (result.tools_used && result.tools_used.length > 0) {
            console.log('🔧 Tools used:');
            result.tools_used.forEach((tool, index) => {
                console.log(`   ${index + 1}. ${tool.name}:`);
                console.log(`      Arguments: ${JSON.stringify(tool.arguments)}`);
                console.log(`      Output: ${JSON.stringify(tool.output, null, 2)}`);
            });
            console.log('');
        }
        
        if (result.usage) {
            console.log(`📊 Usage: ${result.usage.total_tokens} tokens (${result.usage.prompt_tokens} prompt, ${result.usage.completion_tokens} completion)`);
        }
    }
}

// Export functions for server use
module.exports = {
    getCompletion,
    getCompletionWithHistory,
    setup,
    loadEnv
};

// CLI execution
if (require.main === module) {
    runCLI().catch(console.error);
}
