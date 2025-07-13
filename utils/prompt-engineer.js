const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Use Noodle (LLM) to process the user question against chat history
 * and engineer the appropriate prompt for the handoff agent
 */
async function engineerPromptForAgent(userQuestion, messageHistory, targetAgent) {
    try {
        const systemPrompt = `You are Noodle, an intelligent assistant that processes user questions and prepares them for other specialized agents.

Your job is to:
1. CAREFULLY analyze the user's question against the FULL conversation history
2. Identify if this is a follow-up question that references previous context (pronouns, "another?", etc.)
3. Engineer a comprehensive, self-contained prompt for the ${targetAgent} agent

IMPORTANT RULES:
- ALWAYS include relevant conversation history to provide full context
- For follow-up questions with pronouns (like "when was he born?"), explicitly identify what "he" refers to
- For follow-ups like "another?", specify what type of information they want more of
- For general questions (like "give me a fun historical fact"), don't assume it's about previous topics
- Make the prompt so complete that the ${targetAgent} agent has ALL the information needed
- Include specific instructions about what type of response is expected
- The ${targetAgent} agent will receive ONLY this prompt, so it must be self-contained

CRITICAL: If the user's question is incomplete or unclear (like "know the weather?" without specifying location), DO NOT create a prompt asking the agent to ask for clarification. Instead, create a prompt that assumes a reasonable default or provides a helpful response.

Examples:
- "when was he born?" → "The user previously asked about Napoleon Bonaparte. Now they want to know when Napoleon was born. Please provide Napoleon's birth date."
- "another?" → "The user previously received a fun historical fact about Cleopatra. They now want another fun historical fact, but make sure it's different from the Cleopatra fact."
- "give me a fun historical fact" → "The user wants a fun historical fact. This is a new request, not related to previous topics. Please provide an interesting and entertaining historical fact from any period."
- "know the weather?" → "The user is asking about weather but didn't specify a location. Please provide current weather information for a major city like New York, or ask them to specify which location they're interested in."

Respond with ONLY the engineered prompt, nothing else.`;

        const conversationContext = messageHistory.length > 0 
            ? `Previous conversation:\n${messageHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
            : '';

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `${conversationContext}User question: ${userQuestion}\n\nEngineer a comprehensive prompt for the ${targetAgent} agent:`
                }
            ],
            max_tokens: 300,
            temperature: 0.1
        });

        const engineeredPrompt = response.choices[0].message.content.trim();
        
        return engineeredPrompt;
    } catch (error) {
        console.error('❌ Error engineering prompt:', error.message);
        return userQuestion; // Fallback to original question
    }
}

/**
 * Determine which agent should handle the user's question
 */
async function determineTargetAgent(userQuestion, messageHistory) {
    try {
        const systemPrompt = `You are Noodle, an intelligent assistant that routes user questions to the appropriate specialized agent.

Available agents:
- history: For historical questions, facts about historical figures, events, and general history
- web: For current information, weather, news, prices, stock market, real-time data
- noodle: For general conversation, greetings, introductions, and general questions

IMPORTANT RULES:
- Use the FULL conversation history to understand context and determine the best agent
- If the user's question is incomplete or unclear (like "know the weather?" without location), route to "noodle" so it can ask for clarification
- Only route to specialized agents when the question is complete and clear enough to answer

Respond with ONLY the agent name (history, web, or noodle), nothing else.`;

        const conversationContext = messageHistory.length > 0 
            ? `Previous conversation:\n${messageHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
            : '';

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `${conversationContext}User question: ${userQuestion}\n\nWhich agent should handle this?`
                }
            ],
            max_tokens: 50,
            temperature: 0.1
        });

        const targetAgent = response.choices[0].message.content.trim().toLowerCase();
        
        return targetAgent;
    } catch (error) {
        console.error('❌ Error determining target agent:', error.message);
        return 'noodle'; // Default to noodle
    }
}

module.exports = {
    engineerPromptForAgent,
    determineTargetAgent
}; 