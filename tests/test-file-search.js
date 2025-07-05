const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function testFileSearch() {
    try {
        console.log('🧪 Testing File Search Functionality\n');
        
        // Check if vector store ID is available
        const vectorStoreId = process.env.VECTOR_STORE_ID;
        if (!vectorStoreId) {
            console.log('❌ No vector store ID found. Please upload some files first.');
            return;
        }
        
        console.log(`📁 Using vector store: ${vectorStoreId}\n`);
        
        // Test queries
        const testQueries = [
            "What is the main topic of the uploaded documents?",
            "Can you summarize the key points from the knowledge base?",
            "What are the main features described in the files?"
        ];
        
        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`Test ${i + 1}: "${query}"`);
            
            try {
                const response = await openai.responses.create({
                    model: "gpt-4o-mini",
                    input: query,
                    tools: [{
                        type: "file_search",
                        vector_store_ids: [vectorStoreId],
                    }],
                    max_tokens: 1000
                });
                
                console.log('✅ Response:');
                console.log(response.choices[0].message.content);
                console.log('');
                
            } catch (error) {
                console.log(`❌ Error: ${error.message}\n`);
            }
        }
        
        console.log('🎉 File search test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFileSearch(); 