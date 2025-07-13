// jarvis-agent.js - Jarvis AI Agent with access to all tools
const OpenAI = require('openai');
require('dotenv').config();

// Import all tools from both tool files
const { 
    getCurrentTime, 
    getWeather, 
    fileSearch, 
    webSearch,
    AVAILABLE_TOOLS,
    executeToolFunction 
} = require('./tools');

const { 
    mcp,
    mcpListTools,
    mcpCall,
    mcpApprovalRequest,
    mcpApprovalResponse,
    udf,
    MCP_TOOLS,
    executeMcpToolWithValidation 
} = require('./tools-mcp');

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Combine all available tools
const ALL_TOOLS = [
    ...AVAILABLE_TOOLS,
    ...MCP_TOOLS
];

// Create tool execution function that handles both regular and MCP tools
async function executeAllTools(toolCall) {
    const { name, arguments: args } = toolCall.function;
    
    console.log(`🤖 Jarvis executing tool: ${name}`);
    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));
    
    try {
        let result;
        
        // Check if it's an MCP tool
        const mcpToolNames = MCP_TOOLS.map(tool => tool.function.name);
        if (mcpToolNames.includes(name)) {
            result = await executeMcpToolWithValidation(toolCall);
        } else {
            // Regular tool execution
            result = await executeToolFunction(toolCall);
        }
        
        console.log(`✅ Jarvis tool execution successful: ${name}`);
        return result;
        
    } catch (error) {
        console.error(`❌ Jarvis tool execution failed: ${name}`, error);
        return {
            error: error.message,
            tool: name,
            timestamp: new Date().toISOString()
        };
    }
}

// Create Jarvis agent using OpenAI API directly (since @openai/agents is experimental)
class JarvisAgent {
    constructor() {
        this.name = "Jarvis";
        this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
        this.systemPrompt = `You are Jarvis, an advanced AI assistant with access to a comprehensive set of tools. You can:

1. Get current time and weather information
2. Search through knowledge base files
3. Perform web searches
4. Execute MCP (Model Context Protocol) operations
5. Handle file operations, database queries, and system commands
6. Request approvals for sensitive operations
7. Execute user-defined functions

You are helpful, efficient, and always try to use the most appropriate tool for the task at hand. When multiple tools could be useful, choose the one that best fits the user's needs.

Always explain what you're doing and why you're using specific tools. Be conversational but professional.`;
        
        this.tools = ALL_TOOLS;
        this.messages = [
            {
                role: 'system',
                content: this.systemPrompt
            }
        ];
    }

    async run(message, options = {}) {
        try {
            // Add user message
            this.messages.push({
                role: 'user',
                content: message
            });

            console.log(`🤖 Jarvis processing: ${message}`);

            // Make initial request
            const response = await client.chat.completions.create({
                model: this.model,
                messages: this.messages,
                tools: this.tools,
                tool_choice: 'auto',
                temperature: 0.7,
                max_tokens: 4000
            });

            const assistantMessage = response.choices[0].message;
            this.messages.push(assistantMessage);

            // Handle tool calls if present
            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                console.log(`🔧 Jarvis using ${assistantMessage.tool_calls.length} tool(s)`);
                
                for (const toolCall of assistantMessage.tool_calls) {
                    const toolResult = await executeAllTools(toolCall);
                    
                    // Add tool result to conversation
                    this.messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }

                // Get final response after tool execution
                const finalResponse = await client.chat.completions.create({
                    model: this.model,
                    messages: this.messages,
                    temperature: 0.7,
                    max_tokens: 4000
                });

                const finalMessage = finalResponse.choices[0].message;
                this.messages.push(finalMessage);

                return {
                    content: finalMessage.content,
                    toolCalls: assistantMessage.tool_calls,
                    usage: finalResponse.usage
                };
            }

            return {
                content: assistantMessage.content,
                toolCalls: [],
                usage: response.usage
            };

        } catch (error) {
            console.error(`❌ Jarvis error:`, error);
            throw error;
        }
    }

    reset() {
        this.messages = [
            {
                role: 'system',
                content: this.systemPrompt
            }
        ];
    }
}

// Create Jarvis instance
const jarvis = new JarvisAgent();

// Helper function to start a conversation with Jarvis
async function chatWithJarvis(message, options = {}) {
    try {
        console.log(`🤖 Jarvis: Starting conversation...`);
        console.log(`💬 User: ${message}`);
        
        const response = await jarvis.run(message, options);
        
        console.log(`🤖 Jarvis: ${response.content}`);
        
        return {
            agent: "Jarvis",
            response: response.content,
            toolCalls: response.toolCalls || [],
            usage: response.usage,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`❌ Jarvis conversation error:`, error);
        return {
            agent: "Jarvis",
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Helper function to get Jarvis agent info
function getJarvisInfo() {
    return {
        name: "Jarvis",
        description: "Advanced AI assistant with comprehensive tool access",
        availableTools: ALL_TOOLS.length,
        toolCategories: {
            basic: AVAILABLE_TOOLS.length,
            mcp: MCP_TOOLS.length
        },
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        version: "1.0.0"
    };
}

// Export the agent and helper functions
module.exports = {
    jarvis,
    chatWithJarvis,
    getJarvisInfo,
    ALL_TOOLS,
    executeAllTools
};

// Example usage (uncomment to test)
/*
async function testJarvis() {
    console.log("🧪 Testing Jarvis Agent...");
    
    // Test basic conversation
    const response1 = await chatWithJarvis("Hello Jarvis, what time is it?");
    console.log("Response 1:", response1);
    
    // Test tool usage
    const response2 = await chatWithJarvis("What's the weather like in London?");
    console.log("Response 2:", response2);
    
    // Test MCP tools
    const response3 = await chatWithJarvis("List all available MCP tools");
    console.log("Response 3:", response3);
}

// Run test if this file is executed directly
if (require.main === module) {
    testJarvis().catch(console.error);
}
*/ 