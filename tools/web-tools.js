const { tool } = require('@openai/agents');
const { z } = require('zod');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const webSearchTool = tool({
  name: 'web_search_tool',
  description: 'Search the internet for current information, news, weather, prices, and other real-time data',
  parameters: z.object({
    query: z.string().describe('The search query to perform'),
    context: z.string().nullable().describe('Additional context from conversation history')
  }),
  execute: async ({ query, context }) => {
    try {
      // Use OpenAI's search model via completions API
      const searchModel = process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-search-preview';
      
      const response = await openai.chat.completions.create({
        model: searchModel,
        messages: [
          {
            role: "system",
            content: "You are a web search assistant. Search for the requested information and provide accurate, up-to-date results. Include relevant sources when possible."
          },
          {
            role: "user",
            content: context ? `${context}\n\nSearch for: ${query}` : `Search for: ${query}`
          }
        ],
        max_tokens: 500
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error in web search tool:', error.message);
      return 'Sorry, I encountered an error with the web search. Please try again later.';
    }
  },
});

module.exports = {
  webSearchTool
}; 