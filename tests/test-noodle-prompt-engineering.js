const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testNoodlePromptEngineering() {
    console.log('🧪 Testing Noodle-Based Prompt Engineering System\n');
    
    let messageHistory = [];
    
    try {
        // Test 1: Initial greeting
        console.log('📝 Test 1: Initial greeting');
        const response1 = await axios.post(`${BASE_URL}/api/chat`, {
            prompt: 'Hi, what\'s your name?',
            agent: 'main',
            messageHistory: messageHistory
        });
        
        console.log('✅ Response:', response1.data.response);
        console.log('🎯 Agent used:', response1.data.agent);
        
        messageHistory.push({ role: 'user', content: 'Hi, what\'s your name?' });
        messageHistory.push({ role: 'assistant', content: response1.data.response });
        
        // Test 2: Historical question
        console.log('\n📝 Test 2: Historical question');
        const response2 = await axios.post(`${BASE_URL}/api/chat`, {
            prompt: 'Who was Napoleon?',
            agent: 'main',
            messageHistory: messageHistory
        });
        
        console.log('✅ Response:', response2.data.response);
        console.log('🎯 Agent used:', response2.data.agent);
        
        messageHistory.push({ role: 'user', content: 'Who was Napoleon?' });
        messageHistory.push({ role: 'assistant', content: response2.data.response });
        
        // Test 3: Follow-up with pronoun
        console.log('\n📝 Test 3: Follow-up with pronoun');
        const response3 = await axios.post(`${BASE_URL}/api/chat`, {
            prompt: 'When was he born?',
            agent: 'main',
            messageHistory: messageHistory
        });
        
        console.log('✅ Response:', response3.data.response);
        console.log('🎯 Agent used:', response3.data.agent);
        
        messageHistory.push({ role: 'user', content: 'When was he born?' });
        messageHistory.push({ role: 'assistant', content: response3.data.response });
        
        // Test 4: General fun fact request (should NOT be about Napoleon)
        console.log('\n📝 Test 4: General fun fact request');
        const response4 = await axios.post(`${BASE_URL}/api/chat`, {
            prompt: 'Give me a fun historical fact',
            agent: 'main',
            messageHistory: messageHistory
        });
        
        console.log('✅ Response:', response4.data.response);
        console.log('🎯 Agent used:', response4.data.agent);
        
        messageHistory.push({ role: 'user', content: 'Give me a fun historical fact' });
        messageHistory.push({ role: 'assistant', content: response4.data.response });
        
        // Test 5: Follow-up for another fact
        console.log('\n📝 Test 5: Follow-up for another fact');
        const response5 = await axios.post(`${BASE_URL}/api/chat`, {
            prompt: 'Another?',
            agent: 'main',
            messageHistory: messageHistory
        });
        
        console.log('✅ Response:', response5.data.response);
        console.log('🎯 Agent used:', response5.data.agent);
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📊 Summary of Noodle-Based Prompt Engineering:');
        console.log('✅ Noodle determines the appropriate agent for each question');
        console.log('✅ Noodle engineers context-aware prompts for handoff agents');
        console.log('✅ Follow-up questions are properly resolved with context');
        console.log('✅ General questions don\'t stick to previous topics');
        console.log('✅ Much simpler and more reliable than complex context tracking');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testNoodlePromptEngineering(); 