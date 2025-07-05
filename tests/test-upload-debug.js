const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        console.log('🚀 Starting upload test...');
        
        // Create a simple test file
        const testContent = 'This is a test document for vector store debugging.';
        const testFilePath = path.join(__dirname, 'test-debug.txt');
        fs.writeFileSync(testFilePath, testContent);
        
        console.log('📁 Created test file:', testFilePath);
        
        // Create form data
        const form = new FormData();
        form.append('files', fs.createReadStream(testFilePath));
        
        console.log('📤 Uploading file...');
        
        const response = await axios.post('http://localhost:3000/api/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 120000 // 2 minutes
        });
        
        console.log('✅ Upload response:', response.data);
        
        // Clean up test file
        fs.unlinkSync(testFilePath);
        console.log('🧹 Cleaned up test file');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testUpload(); 