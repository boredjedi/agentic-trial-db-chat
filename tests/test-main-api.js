const axios = require('axios');

async function testMainAPI() {
    try {
        console.log('🧪 Testing Main Agent via API...');
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            prompt: 'What time is it?',
            agent: 'main'
        });
        
        console.log('✅ Response:', response.data);
        console.log('Agent used:', response.data.agent);
        console.log('Response:', response.data.response);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testMainAPI(); 