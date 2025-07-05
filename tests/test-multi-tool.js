const axios = require('axios');

async function testMultiToolSearch() {
    try {
        console.log('🔍 Testing multi-tool search for gold rates...');
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            prompt: 'What is the current gold rate? Please search both uploaded files and the web for the most current information.',
            debugMode: true
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Chat response received:');
        console.log('Response:', response.data.response);
        console.log('\n🔍 Debug info:');
        console.log(JSON.stringify(response.data.debug, null, 2));
        
        // Check if tools were used
        if (response.data.tools_used && response.data.tools_used.length > 0) {
            console.log('\n🛠️ Tools used:');
            response.data.tools_used.forEach((tool, index) => {
                console.log(`${index + 1}. ${tool.name}: ${tool.arguments}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testMultiToolSearch(); 