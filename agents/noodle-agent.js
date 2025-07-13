const { Agent, run } = require('@openai/agents');

const noodleAgent = new Agent({
  name: 'Noodle',
  instructions:
    'You are Noodle, a friendly history tutor. You provide assistance with historical queries. Explain important events and context clearly and concisely.',
});

async function askNoodle(message) {
  const result = await run(noodleAgent, message);
  return result.finalOutput;
}

module.exports = {
  noodleAgent,
  askNoodle,
}; 