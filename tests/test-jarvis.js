// test-jarvis.js - Test script for Jarvis agent
const { chatWithJarvis, getJarvisInfo } = require('../tools/jarvis-agent');

async function testJarvis() {
    console.log("🧪 Testing Jarvis Agent...\n");
    
    // Get agent info
    const info = getJarvisInfo();
    console.log("📋 Jarvis Agent Info:");
    console.log(JSON.stringify(info, null, 2));
    console.log("\n" + "=".repeat(50) + "\n");
    
    // Test 1: Basic conversation
    console.log("🧪 Test 1: Basic conversation");
    const response1 = await chatWithJarvis("Hello Jarvis, what time is it?");
    console.log("✅ Response:", response1.response);
    console.log("\n" + "-".repeat(30) + "\n");
    
    // Test 2: Weather tool
    console.log("🧪 Test 2: Weather information");
    const response2 = await chatWithJarvis("What's the weather like in London?");
    console.log("✅ Response:", response2.response);
    console.log("\n" + "-".repeat(30) + "\n");
    
    // Test 3: MCP tools
    console.log("🧪 Test 3: MCP tools");
    const response3 = await chatWithJarvis("List all available MCP tools");
    console.log("✅ Response:", response3.response);
    console.log("\n" + "-".repeat(30) + "\n");
    
    // Test 4: Complex query
    console.log("🧪 Test 4: Complex query");
    const response4 = await chatWithJarvis("What time is it in New York and what's the weather like there?");
    console.log("✅ Response:", response4.response);
    console.log("\n" + "-".repeat(30) + "\n");
    
    // Test 5: Tool usage summary
    console.log("🧪 Test 5: Tool usage summary");
    const response5 = await chatWithJarvis("What tools do you have access to?");
    console.log("✅ Response:", response5.response);
    
    console.log("\n🎉 Jarvis Agent testing completed!");
}

// Run the test
if (require.main === module) {
    testJarvis().catch(error => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
}

module.exports = { testJarvis }; 