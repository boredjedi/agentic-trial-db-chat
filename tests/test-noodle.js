require('dotenv').config();
const { askNoodle } = require('../agents/noodle-agent');

(async () => {
  const question = 'When did sharks first appear?';
  const answer = await askNoodle(question);
  console.log('Q:', question);
  console.log('A:', answer);
})(); 