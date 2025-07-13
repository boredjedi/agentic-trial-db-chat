const axios = require('axios');

async function testNoodleAPI() {
    try {
        console.log('🧪 Testing Noodle Agent via API...');
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            prompt: 'When did sharks first appear?',
            agent: 'noodle'
        });
        
        console.log('✅ Response:', response.data);
        console.log('Agent used:', response.data.agent);
        console.log('Response:', response.data.response);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testNoodleAPI(); 