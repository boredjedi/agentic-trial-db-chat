const { Agent } = require('@openai/agents');

console.log('Agent class methods:', Object.getOwnPropertyNames(Agent.prototype));

const testAgent = new Agent({
    name: 'test',
    model: 'gpt-4o-mini',
    systemPrompt: 'You are a test agent.'
});

console.log('Agent instance methods:', Object.getOwnPropertyNames(testAgent));
console.log('Agent instance properties:', Object.keys(testAgent));

// Try to find the correct method
const methods = ['run', 'chat', 'process', 'execute', 'call', 'invoke', 'send', 'message'];
methods.forEach(method => {
    console.log(`${method}:`, typeof testAgent[method]);
}); 