const { Agent, run, tool } = require('@openai/agents');
const { z } = require('zod');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const historyFunFact = tool({
  name: 'history_fun_fact',
  description: 'Give a fun fact about a historical event',
  parameters: z.object({
    context: z.string().nullable().describe('Conversation context to understand what the user is asking for'),
    messageHistory: z.array(z.object({
      role: z.string(),
      content: z.string()
    })).nullable().describe('Full conversation history for context')
  }),
  execute: async ({ context, messageHistory }) => {
    try {
      console.log('🔍 Generating fun fact with model:', process.env.OPENAI_MODEL || "gpt-4o");
      console.log('📝 Context:', context);
      console.log('📚 Message history length:', messageHistory ? messageHistory.length : 0);
      
      // Build messages array with conversation history
      const messages = [
        {
          role: "system",
          content: "You are a history expert. Generate ONE specific, verifiable historical fact or answer the user's historical question. Focus on concrete events, dates, people, or discoveries from history. Examples: 'The shortest war in history lasted only 38 minutes between Britain and Zanzibar in 1896' or 'The ancient Romans used urine to whiten their teeth'. Do NOT give advice, life lessons, or philosophical statements. Only provide factual historical information."
        }
      ];
      
      // Add conversation history to messages
      if (Array.isArray(messageHistory) && messageHistory.length > 0) {
        // Add recent history (last 6 messages to stay within limits)
        const recentHistory = messageHistory.slice(-6);
        messages.push(...recentHistory);
      }
      
      // Add current request as the last user message
      if (context) {
        messages.push({ role: "user", content: context });
      }
      
      // Use OpenAI to generate a response
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: messages,
        max_tokens: 100,
        temperature: 0.8
      });
      
      const fact = response.choices[0].message.content;
      console.log('✅ Generated fact:', fact);
      return fact;
    } catch (error) {
      console.error('❌ Error generating fun fact:', error.message);
      // Return a different fallback fact
      return 'The ancient Romans used urine to whiten their teeth.';
    }
  },
});

const noodleAgent = new Agent({
  name: 'Noodle',
  instructions:
    'You are Noodle, a friendly history tutor. You provide assistance with historical queries. Explain important events and context clearly and concisely. Always respond in the form of a haiku (three lines: 5, 7, 5 syllables). Do not break character.',
  tools: [historyFunFact],
});

async function askNoodle(message, messageHistory = []) {
  // Create context with conversation history
  let context = message;
  
  if (messageHistory.length > 0) {
    // Add recent conversation history to provide context
    const recentHistory = messageHistory.slice(-4); // Last 4 messages for context
    const historyText = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    context = `Previous conversation:\n${historyText}\n\nCurrent message: ${message}`;
  }
  
  // Update agent instructions to include context for tool calls
  const agentWithContext = new Agent({
    name: 'Noodle',
    instructions:
      `You are Noodle, a friendly history tutor. You provide assistance with historical queries. Explain important events and context clearly and concisely. Always respond in the form of a haiku (three lines: 5, 7, 5 syllables). Do not break character.

IMPORTANT: Always read and understand the conversation context provided. If the user asks a follow-up question like "year?" or "another?", use the conversation history to understand what they're referring to. For example:
- If they asked about "battle of panipat" and then say "year?", tell them the year of the battle
- If they asked for a fun fact and then say "another?", give them another fun fact
- If they ask "another one?", provide another example of what they were asking about

When using the history_fun_fact tool, ALWAYS pass both the conversation context AND the full messageHistory array to help the tool understand the complete conversation.

Available messageHistory: ${JSON.stringify(messageHistory)}`,
    tools: [historyFunFact],
  });
  
  const result = await run(agentWithContext, context);
  return result.finalOutput;
}

module.exports = {
  noodleAgent,
  askNoodle,
}; 