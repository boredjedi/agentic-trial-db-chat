const { Agent, run, AgentInputItem } = require('@openai/agents');
const { webSearchTool } = require('../tools/web-tools');

// Web search agent specialized for internet searches
const webSearchAgent = Agent.create({
  name: 'Web Search Agent',
  instructions: `You are a web search agent who responds to engineered prompts from Noodle.
  
  IMPORTANT RULES:
  1. ALWAYS use the web_search_tool to respond
  2. The engineered prompt you receive contains all necessary context and specific instructions
  3. Do not make decisions about what to search - follow the engineered prompt exactly
  4. The prompt includes message history context for pronoun resolution and follow-ups
  5. Simply pass the engineered prompt to the tool and return the result`,
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  tools: [webSearchTool]
});

// Function to run web search agent
async function runWebSearchAgent(engineeredPrompt) {
  try {
    // Create thread with the engineered prompt
    const thread = [{ role: 'user', content: engineeredPrompt }];
    
    // Use the agent SDK to get the response
    const result = await run(webSearchAgent, thread);
    
    // Extract the response
    if (result.finalOutput) {
      return result.finalOutput;
    } else {
      return 'I can help you search for information. Please try again or rephrase your query.';
    }
  } catch (error) {
    console.error('Web search agent error:', error.message);
    return 'Sorry, I encountered an error with the web search. Please try again later.';
  }
}

module.exports = {
  webSearchAgent,
  runWebSearchAgent
}; 