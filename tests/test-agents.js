require('dotenv').config();
const { chatWithMainAgent } = require('../agents/main-agent');
const { runWebSearchAgent } = require('../agents/web-search-agent');

async function testAgents() {
    console.log('🧪 Testing OpenAI Agents SDK Implementation\n');
    
    try {
        // Test 1: Basic conversation with main agent
        console.log('1️⃣ Testing Main Agent - Basic conversation');
        const response1 = await chatWithMainAgent("Hello! What time is it?");
        console.log('Response:', response1.response);
        console.log('Agent used:', response1.agent);
        console.log('---\n');
        
        // Test 2: Weather query
        console.log('2️⃣ Testing Main Agent - Weather query');
        const response2 = await chatWithMainAgent("What's the weather like in London?");
        console.log('Response:', response2.response);
        console.log('Agent used:', response2.agent);
        console.log('---\n');
        
        // Test 3: Web search through main agent
        console.log('3️⃣ Testing Main Agent - Web search delegation');
        const response3 = await chatWithMainAgent("What are the latest developments in AI?");
        console.log('Response:', response3.response);
        console.log('Agent used:', response3.agent);
        console.log('---\n');
        
        // Test 4: Direct web search agent
        console.log('4️⃣ Testing Web Search Agent directly');
        const webSearchResult = await runWebSearchAgent("OpenAI latest news");
        console.log('Web Search Result:', webSearchResult.result);
        console.log('Model used:', webSearchResult.model);
        console.log('---\n');
        
        // Test 5: File search (if files are uploaded)
        console.log('5️⃣ Testing Main Agent - File search');
        const response5 = await chatWithMainAgent("Search for any uploaded documents");
        console.log('Response:', response5.response);
        console.log('Agent used:', response5.agent);
        console.log('---\n');
        
        console.log('✅ All agent tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Agent test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the tests
testAgents(); 