const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function testVectorStore() {
    try {
        console.log('🧪 Testing Vector Store Functionality\n');
        
        // 1. Create vector store
        console.log('1. Creating vector store...');
        const vectorStore = await openai.vectorStores.create({
            name: "test_knowledge_base"
        });
        console.log(`✅ Vector store created: ${vectorStore.id}\n`);
        
        // 2. List vector stores
        console.log('2. Listing vector stores...');
        const stores = await openai.vectorStores.list();
        console.log(`✅ Found ${stores.data.length} vector store(s)`);
        stores.data.forEach(store => {
            console.log(`   - ${store.name} (${store.id})`);
        });
        console.log('');
        
        // 3. Create a test file
        console.log('3. Creating test file...');
        const testContent = Buffer.from('This is a test document for vector store functionality.');
        const file = await openai.files.create({
            file: testContent,
            purpose: 'assistants'
        });
        console.log(`✅ Test file created: ${file.id}\n`);
        
        // 4. Add file to vector store
        console.log('4. Adding file to vector store...');
        await openai.vectorStores.files.create(vectorStore.id, {
            file_id: file.id
        });
        console.log(`✅ File added to vector store\n`);
        
        // 5. Check file status
        console.log('5. Checking file processing status...');
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const result = await openai.vectorStores.files.list({
                vector_store_id: vectorStore.id
            });
            
            const fileStatus = result.data.find(f => f.file_id === file.id);
            if (fileStatus) {
                console.log(`   Status: ${fileStatus.status}`);
                if (fileStatus.status === 'completed') {
                    console.log('✅ File processing completed!');
                    break;
                } else if (fileStatus.status === 'failed') {
                    console.log('❌ File processing failed');
                    break;
                }
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`   Waiting... (${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        if (attempts >= maxAttempts) {
            console.log('⚠️ File processing timeout');
        }
        
        console.log('\n🎉 Vector store test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testVectorStore(); 