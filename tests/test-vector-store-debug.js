const axios = require('axios');

async function testVectorStoreDebug() {
    try {
        console.log('🔍 Testing vector store lookup...');
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            prompt: 'What information do you have in your knowledge base?',
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

testVectorStoreDebug(); 