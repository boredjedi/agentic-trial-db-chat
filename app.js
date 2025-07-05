const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Configuration
const ENV_FILE = path.join(process.cwd(), '.env');

// Setup function to create .env file
function setup() {
    const envContent = `# OpenAI Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_api_key_here

# Optional: Model configuration
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
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
async function makeOpenAIRequest(messages, tools = null) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4';
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 2000;
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;

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

    try {
        const completion = await openai.chat.completions.create(requestOptions);
        return completion;
    } catch (error) {
        throw new Error(`OpenAI API error: ${error.message}`);
    }
}

// Get completion with automatic tool usage
async function getCompletion(prompt, tools = null) {
    try {
        loadEnv();

        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        console.log('🤖 Sending request to OpenAI...');
        
        const response = await makeOpenAIRequest(messages, tools);
        const result = {
            response: response.choices[0].message.content,
            usage: response.usage,
            model: response.model,
            tools_used: []
        };

        // Handle tool calls if present
        const message = response.choices[0].message;
        if (message.tool_calls && message.tool_calls.length > 0) {
            result.tools_used = message.tool_calls.map(call => ({
                name: call.function.name,
                arguments: JSON.parse(call.function.arguments)
            }));
        }

        return result;

    } catch (error) {
        return {
            error: error.message,
            response: null,
            usage: null,
            model: null,
            tools_used: []
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
        console.log('  node app.js help            # Show this help');
        console.log('');
        console.log('Examples:');
        console.log('  node app.js "Hello, how are you?"');
        console.log('  node app.js "What is the weather like?"');
        return;
    }

    if (args[0] === 'setup') {
        setup();
        return;
    }

    const prompt = args.join(' ');
    console.log(`💬 You: ${prompt}`);
    console.log('');

    const result = await getCompletion(prompt);
    
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
            result.tools_used.forEach(tool => {
                console.log(`   - ${tool.name}: ${JSON.stringify(tool.arguments)}`);
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
    setup,
    loadEnv
};

// CLI execution
if (require.main === module) {
    runCLI().catch(console.error);
}
