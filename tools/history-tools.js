const { tool } = require('@openai/agents');
const { z } = require('zod');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const historyFunFact = tool({
  name: 'history_fun_fact',
  description: 'Answer historical questions or provide historical facts based on the engineered prompt',
  parameters: z.object({
    prompt: z.string().describe('The engineered prompt from Noodle with full context and specific instructions')
  }),
  execute: async ({ prompt }) => {
    try {
      // Use OpenAI to generate a response
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a history expert. Respond to the engineered prompt exactly as requested. The prompt contains all necessary context and specific instructions for your response. Answer naturally and conversationally."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });
      
      const responseText = response.choices[0].message.content;
      return responseText;
    } catch (error) {
      console.error('❌ Error generating historical response:', error.message);
      return 'I\'m here to help with historical questions. What would you like to know?';
    }
  },
});

module.exports = {
  historyFunFact
}; 