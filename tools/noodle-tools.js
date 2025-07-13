const { tool } = require('@openai/agents');
const { z } = require('zod');

// Noodle agent tools (if any are needed in the future)
// Currently, Noodle primarily handles conversation and routing

const generalChatTool = tool({
  name: 'general_chat_tool',
  description: 'Handle general conversation and greetings when no specialized agent is needed',
  parameters: z.object({
    message: z.string().describe('The user message to respond to')
  }),
  execute: async ({ message }) => {
    try {
      console.log('📚 Noodle general chat tool called with message:', message);
      
      // This tool handles general conversation when no specialized agent is needed
      return `I received your message: "${message}". I'm here to help with general conversation and can route you to specialized agents when needed.`;
    } catch (error) {
      console.error('❌ Error in general chat tool:', error.message);
      return 'Sorry, I encountered an error. How can I help you?';
    }
  },
});

module.exports = {
  generalChatTool
}; 