const { Agent, run, AgentInputItem } = require('@openai/agents');
const { generalChatTool } = require('../tools/noodle-tools');

const noodleAgent = Agent.create({
  name: 'Noodle',
  instructions: `You are Noodle, a friendly and helpful assistant.

  IMPORTANT RULES:
  1. Respond naturally and conversationally
  2. For your introduction, tell the user about yourself
  3. For general conversation, respond naturally
  4. If the user asks an incomplete question (like "know the weather?" without specifying location), ask for clarification
  5. Help users complete their requests by asking specific questions
  6. You can use the general_chat_tool if needed for specific conversation handling
  
  You are the main conversational agent. Specialized tasks are handled by other agents through the server routing system.`,
  tools: [generalChatTool],
});

async function askNoodle(engineeredPrompt) {
  try {
    console.log('🍜 Noodle called with engineered prompt:', engineeredPrompt);
    
    // Create thread with the engineered prompt
    const thread = [{ role: 'user', content: engineeredPrompt }];
    
    // Use the agent SDK to get the response
    const result = await run(noodleAgent, thread);
    
    // Extract the response
    if (result.finalOutput) {
      return result.finalOutput;
    } else {
      return 'Hello! I\'m Noodle, your friendly assistant. How can I help you today?';
    }
  } catch (error) {
    console.error('❌ Noodle error:', error.message);
    return 'Sorry, I encountered an error. How can I help you?';
  }
}

module.exports = {
  noodleAgent,
  askNoodle,
}; 