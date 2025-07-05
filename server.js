const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { getCompletion, getCompletionWithHistory, setup } = require('./app.js');

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
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { prompt, messageHistory = [], debugMode = false } = JSON.parse(body);
                
                // The frontend now sends the complete history including the current user message
                // So we don't need to add it again here
                const result = await getCompletionWithHistory(messageHistory, true, debugMode);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
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
    filePath = path.join(__dirname, filePath);

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
