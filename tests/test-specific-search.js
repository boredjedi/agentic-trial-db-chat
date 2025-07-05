const axios = require('axios');

async function testSpecificSearch() {
    try {
        console.log('🔍 Testing specific search that should trigger file_search tool...');
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            prompt: 'Can you search through the uploaded files and tell me what specific information they contain? Please use the file search tool to find this information.',
            debugMode: true
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Chat response received:');
        console.log('Response:', response.data.response);
        console.log('Debug info:', response.data.debug);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testSpecificSearch(); 