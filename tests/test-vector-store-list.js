const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function listVectorStores() {
    try {
        console.log('🔍 Fetching all vector stores from OpenAI...');
        
        const vectorStores = await openai.vectorStores.list();
        
        console.log(`📋 Found ${vectorStores.data.length} vector stores:`);
        
        const dashboardId = 'vs_6869887239708191885dbfef63ab231c';
        console.log(`🎯 Dashboard vector store ID: ${dashboardId}`);
        console.log('');
        
        let matchFound = false;
        
        vectorStores.data.forEach((store, index) => {
            const isMatch = store.id === dashboardId;
            if (isMatch) matchFound = true;
            
            console.log(`${index + 1}. ${isMatch ? '✅ MATCH' : '  '} ID: ${store.id}`);
            console.log(`   Name: "${store.name || 'unnamed'}"`);
            console.log(`   Files: ${store.file_counts?.total || 0}`);
            console.log(`   Created: ${new Date(store.created_at * 1000).toLocaleString()}`);
            console.log('');
        });
        
        if (!matchFound) {
            console.log('❌ Dashboard vector store ID not found in the list!');
            console.log('   This could mean:');
            console.log('   1. The vector store was created in a different OpenAI account');
            console.log('   2. The vector store was deleted');
            console.log('   3. There\'s an API key mismatch');
        } else {
            console.log('✅ Dashboard vector store found in the list!');
        }
        
    } catch (error) {
        console.error('❌ Error fetching vector stores:', error.message);
    }
}

listVectorStores(); 