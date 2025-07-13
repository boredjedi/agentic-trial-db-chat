const { Agent, tool } = require('@openai/agents');
const { z } = require('zod');
const { run } = require('@openai/agents');

// Import the web search agent
const { webSearchAgent } = require('./web-search-agent');

// Tool for getting current time (always UTC)
const getCurrentTimeTool = tool({
  name: 'get_current_time',
  description: 'Get the current time in UTC',
  parameters: z.object({}),
  async execute() {
    const now = new Date();
    const options = {
      timeZone: 'UTC',
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
      timezone: 'UTC'
    };
  },
});

// Tool for getting weather (always metric)
const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather information for any location (metric units)',
  parameters: z.object({
    location: z.string()
  }),
  async execute({ location }) {
    const units = 'metric';
    // Mock weather function - in production, you'd call a real weather API
    const weatherData = {
      location: location,
      temperature: Math.floor(Math.random() * 35) + 5,
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
  },
});

// Tool for file search
const fileSearchTool = tool({
  name: 'file_search',
  description: 'Search through uploaded knowledge base files for specific information',
  parameters: z.object({
    query: z.string()
  }),
  async execute({ query }) {
    const OpenAI = require('openai');
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    try {
      console.log(`📁 Searching knowledge base files for: "${query}"`);
      // Get vector store ID
      let vectorStoreId = process.env.VECTOR_STORE_ID;
      if (!vectorStoreId) {
        const vectorStores = await client.vectorStores.list();
        const knowledgeBase = vectorStores.data.find(store => store.name === "knowledge_base");
        if (knowledgeBase) {
          vectorStoreId = knowledgeBase.id;
          process.env.VECTOR_STORE_ID = vectorStoreId;
        }
      }
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
        max_tokens: 2000
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
      return {
        query: query,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        result: `I apologize, but I'm unable to search the knowledge base files at the moment due to an error: ${error.message}. Please try again later or rephrase your query.`,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
});

// Tool for web search that delegates to the web search agent
const webSearchTool = tool({
  name: 'web_search',
  description: 'Search the internet for current information when needed',
  parameters: z.object({
    query: z.string()
  }),
  async execute({ query }) {
    try {
      console.log(`🔍 Delegating web search to web search agent for: "${query}"`);
      // Run the web search agent
      const result = await run(webSearchAgent, query, {
        context: {}
      });
      return {
        query: query,
        result: result.textOutput,
        timestamp: new Date().toISOString(),
        agent_used: 'web_search_agent'
      };
    } catch (error) {
      console.error('Web search agent error:', error.message);
      return {
        query: query,
        result: `I apologize, but I'm unable to perform web searches at the moment due to an error: ${error.message}. Please try again later or rephrase your query.`,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
});

// Main agent with handoffs to web search agent
const mainAgent = Agent.create({
  name: 'Main Assistant',
  instructions: `You are a helpful assistant with access to multiple tools and uploaded knowledge base files. 
  
  Available tools:
  1. file_search - Search through uploaded knowledge base files for specific information
  2. web_search - Search the internet for current information when needed (delegates to web search agent)
  3. get_weather - Get current weather information for any location (always metric units)
  4. get_current_time - Get current time in UTC
  
  When answering questions:
  - Use file_search if the question might be answered by uploaded files
  - Use web_search for current information from the internet
  - Use get_weather for weather questions (always metric units)
  - Use get_current_time for time questions (always UTC)
  - Always provide accurate, helpful responses using the best available information
  - Be conversational and friendly in your responses`,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  tools: [fileSearchTool, webSearchTool, getWeatherTool, getCurrentTimeTool],
  handoffs: [webSearchAgent]
});

// Function to chat with the main agent
async function chatWithMainAgent(message, messageHistory = []) {
  try {
    console.log('🤖 Using OpenAI Agents SDK - Main Agent');
    // Create context with message history
    const context = {
      messageHistory: messageHistory,
      timestamp: new Date().toISOString()
    };
    // Run the agent
    const result = await run(mainAgent, message, { context });
    return {
      response: result.textOutput,
      usage: result.usage,
      agent: 'main_agent'
    };
  } catch (error) {
    console.error('Main agent error:', error);
    return {
      response: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
      error: error.message,
      agent: 'main_agent'
    };
  }
}

module.exports = {
  mainAgent,
  chatWithMainAgent
}; 