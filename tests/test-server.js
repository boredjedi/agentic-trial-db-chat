// Simple test to validate the server
const { getCompletionWithHistory } = require('./app.js');

async function test() {
    console.log('Testing getCompletionWithHistory...');
    
    // Test with mock messages
    const mockHistory = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'What time is it?' }
    ];
    
    try {
        const result = await getCompletionWithHistory(mockHistory, true, false);
        console.log('Result structure:');
        console.log('- response:', result.response ? 'Present' : 'Missing');
        console.log('- updated_messages:', result.updated_messages ? result.updated_messages.length + ' messages' : 'Missing');
        console.log('- tools_used:', result.tools_used ? result.tools_used.length + ' tools' : 'Missing');
        console.log('- usage:', result.usage ? 'Present' : 'Missing');
        
        if (result.updated_messages) {
            console.log('\nConversation history preview:');
            result.updated_messages.forEach((msg, i) => {
                console.log(`${i + 1}. ${msg.role}: ${msg.content ? msg.content.substring(0, 50) + '...' : 'No content'}`);
            });
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

test();
