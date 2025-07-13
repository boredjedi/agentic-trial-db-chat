const { Agent } = require('@openai/agents');
const OpenAI = require('openai');

// Web search agent specialized for internet searches
const webSearchAgent = new Agent({
  name: 'Web Search Agent',
  instructions: `You are a specialized web search agent. Your job is to:
  
  1. Perform web searches using the OpenAI search model
  2. Provide accurate, up-to-date information from the internet
  3. Format your responses clearly and concisely
  4. Include relevant sources when possible
  5. Focus on current and factual information
  
  Always use the web_search_tool to perform searches. Never make up information.`,
  model: process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-search-preview',
  tools: [{
    type: "web_search"
  }]
});

// Function to run web search agent
async function runWebSearchAgent(query, options = {}) {
  try {
    console.log(`🔍 Web Search Agent searching for: "${query}"`);
    
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Use the search model directly for web searches
    const searchModel = process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-search-preview';
    
    const completion = await client.chat.completions.create({
      model: searchModel,
      web_search_options: {
        // Only use supported options
      },
      messages: [{
        role: "user",
        content: `Search for: ${query}`
      }],
      max_tokens: options.max_tokens || 2000
    });
    
    const searchResult = completion.choices[0].message.content;
    
    return {
      query: query,
      model: searchModel,
      result: searchResult,
      timestamp: new Date().toISOString(),
      usage: completion.usage
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
}

module.exports = {
  webSearchAgent,
  runWebSearchAgent
}; 