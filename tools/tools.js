// tools.js - Tool functions and definitions
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client for web search
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to get or find vector store
async function getVectorStoreId() {
    // Check if already in environment
    let vectorStoreId = process.env.VECTOR_STORE_ID;
    
    if (!vectorStoreId) {
        console.log('🔍 Looking for existing vector stores...');
        const vectorStores = await client.vectorStores.list();
        
        // Log all vector stores found
        console.log(`📋 Found ${vectorStores.data.length} vector stores:`);
        vectorStores.data.forEach((store, index) => {
            console.log(`  ${index + 1}. ID: ${store.id}, Name: "${store.name || 'unnamed'}", Files: ${store.file_counts?.total || 0}`);
        });
        
        const knowledgeBase = vectorStores.data.find(store => store.name === "knowledge_base");
        
        if (knowledgeBase) {
            vectorStoreId = knowledgeBase.id;
            process.env.VECTOR_STORE_ID = vectorStoreId;
            console.log(`✅ Found vector store: ${vectorStoreId}`);
            console.log(`🔍 Dashboard vector store ID: vs_6869887239708191885dbfef63ab231c`);
            console.log(`🔍 Match status: ${vectorStoreId === 'vs_6869887239708191885dbfef63ab231c' ? '✅ MATCH' : '❌ NO MATCH'}`);
        }
    }
    
    return vectorStoreId;
}

// Tool functions
function getCurrentTime(timezone = 'UTC') {
    const now = new Date();
    const options = {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    
    return {
        current_time: now.toLocaleString('en-US', options),
        timestamp: now.toISOString(),
        timezone: timezone
    };
}

async function getWeather(location, units = 'metric') {
    // Validate location parameter
    if (!location || typeof location !== 'string') {
        throw new Error('Location must be a non-empty string');
    }
    
    // Mock weather function - in production, you'd call a real weather API
    // For now, returning simulated data
    const weatherData = {
        location: location,
        temperature: Math.floor(Math.random() * 35) + 5, // Random temp between 5-40°C
        condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 100),
        wind_speed: Math.floor(Math.random() * 20) + 5,
        units: units,
        timestamp: new Date().toISOString()
    };
    
    // Add some realistic variations based on location
    const locationLower = location.toLowerCase();
    if (locationLower.includes('london')) {
        weatherData.condition = 'rainy';
        weatherData.temperature = Math.floor(Math.random() * 15) + 10;
    } else if (locationLower.includes('dubai')) {
        weatherData.condition = 'sunny';
        weatherData.temperature = Math.floor(Math.random() * 20) + 25;
    } else if (locationLower.includes('new york')) {
        weatherData.temperature = Math.floor(Math.random() * 25) + 5;
    }
    
    return weatherData;
}

async function fileSearch(query, options = {}) {
    // Validate query parameter
    if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
    }
    
    try {
        console.log(`📁 Searching knowledge base files for: "${query}"`);
        
        // Get vector store ID dynamically
        const vectorStoreId = await getVectorStoreId();
        if (!vectorStoreId) {
            throw new Error('No vector store available. Please upload some files first.');
        }
        
        // Use OpenAI responses API for file search
        const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            input: query,
            tools: [{
                type: "file_search",
                vector_store_ids: [vectorStoreId],
            }],
            max_tokens: options.max_tokens || 2000
        });
        
        return {
            query: query,
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            result: response.choices[0].message.content,
            vector_store_id: vectorStoreId,
            timestamp: new Date().toISOString(),
            usage: response.usage
        };
        
    } catch (error) {
        console.error('File search error:', error.message);
        
        // Return a fallback response if the search fails
        return {
            query: query,
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            result: `I apologize, but I'm unable to search the knowledge base files at the moment due to an error: ${error.message}. Please try again later or rephrase your query.`,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

async function webSearch(query, options = {}) {
    // Validate query parameter
    if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
    }
    
    try {
        console.log(`🔍 Performing web search for: "${query}"`);
        
        // Check if search model is available
        const searchModel = process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-search-preview';
        
        const completion = await client.chat.completions.create({
            model: searchModel,
            web_search_options: {
                ...(options.max_results && { max_results: options.max_results }),
                ...(options.search_depth && { search_depth: options.search_depth }),
                ...(options.include_domains && { include_domains: options.include_domains }),
                ...(options.exclude_domains && { exclude_domains: options.exclude_domains })
            },
            messages: [{
                role: "user",
                content: `Search for: ${query}`
            }],
            max_tokens: options.max_tokens || 2000
            // Note: temperature is not compatible with search models
        });
        
        const searchResult = completion.choices[0].message.content;
        
        return {
            query: query,
            model: process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-search-preview',
            result: searchResult,
            timestamp: new Date().toISOString(),
            usage: completion.usage
        };
        
    } catch (error) {
        console.error('Web search error:', error.message);
        
        // Return a fallback response if the search model fails
        return {
            query: query,
            model: process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-search-preview',
            result: `I apologize, but I'm unable to perform web searches at the moment due to an error: ${error.message}. Please try again later or rephrase your query.`,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Tool definitions
const AVAILABLE_TOOLS = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Get the current time in a specified timezone",
            parameters: {
                type: "object",
                properties: {
                    timezone: {
                        type: "string",
                        description: "The timezone to get the time for (e.g., 'UTC', 'America/New_York', 'Europe/London')",
                        default: "UTC"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Get current weather information for a specified location",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The location to get weather for (e.g., 'London', 'New York', 'Dubai')"
                    },
                    units: {
                        type: "string",
                        description: "Temperature units - 'metric' for Celsius, 'imperial' for Fahrenheit",
                        enum: ["metric", "imperial"],
                        default: "metric"
                    }
                },
                required: ["location"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "file_search",
            description: "Search through uploaded knowledge base files to find relevant information. Use this tool when the user asks questions that might be answered by content in the uploaded files, or when you need specific information that could be found in the knowledge base.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to find relevant information in the knowledge base files"
                    },
                    max_results: {
                        type: "integer",
                        description: "Maximum number of search results to return",
                        default: 5
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "web_search",
            description: "Perform a web search if any information is not available in current memory, using the specified query and options",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query string"
                    },
                    max_results: {
                        type: "integer",
                        description: "Maximum number of search results to return",
                        default: 10
                    },
                    search_depth: {
                        type: "integer",
                        description: "Depth of search (e.g., 1 for quick answers, 2 for more in-depth results)",
                        default: 1
                    },
                    include_domains: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of domains to include in the search results"
                    },
                    exclude_domains: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of domains to exclude from the search results"
                    },
                    max_tokens: {
                        type: "integer",
                        description: "Maximum number of tokens in the response",
                        default: 2000
                    }
                },
                required: ["query"]
            }
        }
    }
];

// Execute tool function
async function executeToolFunction(toolCall) {
    const { name, arguments: argsString } = toolCall.function;
    
    // Validate tool call structure
    if (!name || !argsString) {
        throw new Error('Invalid tool call: missing name or arguments');
    }
    
    // Parse the arguments JSON string
    let args;
    try {
        args = JSON.parse(argsString);
    } catch (error) {
        throw new Error(`Invalid arguments for tool ${name}: ${error.message}`);
    }
    
    switch (name) {
        case 'get_current_time':
            const timezone = args.timezone || 'UTC';
            return getCurrentTime(timezone);
            
        case 'get_weather':
            const location = args.location;
            const units = args.units || 'metric';
            
            if (!location) {
                throw new Error('Location parameter is required for get_weather tool');
            }
            
            return await getWeather(location, units);
            
        case 'file_search':
            const searchQuery = args.query;
            const searchOptions = {
                max_results: args.max_results,
                max_tokens: args.max_tokens
            };
            
            return await fileSearch(searchQuery, searchOptions);
            
        case 'web_search':
            const query = args.query;
            const options = {
                max_results: args.max_results,
                search_depth: args.search_depth,
                include_domains: args.include_domains,
                exclude_domains: args.exclude_domains,
                max_tokens: args.max_tokens,
                temperature: args.temperature
            };
            
            return await webSearch(query, options);
            
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

// Export all tools functionality
module.exports = {
    AVAILABLE_TOOLS,
    executeToolFunction,
    getCurrentTime,
    getWeather,
    fileSearch,
    webSearch,
    getVectorStoreId
};
