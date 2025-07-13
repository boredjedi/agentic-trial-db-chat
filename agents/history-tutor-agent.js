const { Agent, run, AgentInputItem } = require('@openai/agents');
const { historyFunFact } = require('../tools/history-tools');

const historyTutorAgent = Agent.create({
  name: 'History Tutor',
  instructions: `You are a history expert who responds to engineered prompts from Noodle.
  
  IMPORTANT RULES:
  1. ALWAYS use the history_fun_fact tool to respond
  2. The engineered prompt you receive contains all necessary context and specific instructions
  3. Do not make decisions about what to answer - follow the engineered prompt exactly
  4. The prompt includes message history context for pronoun resolution and follow-ups
  5. Simply pass the engineered prompt to the tool and return the result`,
  tools: [historyFunFact],
});

async function askHistoryTutor(engineeredPrompt) {
  try {
    // Create thread with the engineered prompt
    const thread = [{ role: 'user', content: engineeredPrompt }];
    
    // Use the agent SDK to get the response
    const result = await run(historyTutorAgent, thread);
    
    // Extract the response
    if (result.finalOutput) {
      return result.finalOutput;
    } else {
      return 'I\'m here to help with historical questions. What would you like to know?';
    }
  } catch (error) {
    console.error('❌ History Tutor error:', error.message);
    return 'Sorry, I encountered an error. How can I help you with history?';
  }
}

module.exports = {
  historyTutorAgent,
  askHistoryTutor,
}; 