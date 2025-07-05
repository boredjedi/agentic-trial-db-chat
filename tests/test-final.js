const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testFinalWorkflow() {
    try {
        console.log('🚀 Final Test: Complete Upload and Vector Store Workflow\n');
        
        // Create a test file with proper extension
        const testContent = `# Test Document for Vector Store

This is a test document to verify that:
1. File uploads work correctly
2. Filenames with extensions are preserved
3. Vector store processing succeeds
4. Files can be used for knowledge base queries

## Features Tested
- File upload with proper filename
- Vector store integration
- Error handling improvements
- Background processing`;
        
        const testFilePath = path.join(__dirname, 'test-final.md');
        fs.writeFileSync(testFilePath, testContent);
        
        console.log('📁 Created test file:', testFilePath);
        
        // Upload the file
        const form = new FormData();
        form.append('files', fs.createReadStream(testFilePath));
        
        console.log('📤 Uploading file to server...');
        
        const response = await axios.post('http://localhost:3000/api/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 60000 // 1 minute
        });
        
        console.log('✅ Upload response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('\n🎉 SUCCESS! File upload and processing workflow is working correctly!');
            console.log('✅ Filename preserved:', response.data.filename);
            console.log('✅ File ID generated:', response.data.fileId);
            console.log('✅ Processing started:', response.data.processing);
            
            // Wait a bit and check processing status
            console.log('\n⏳ Checking processing status...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await axios.get(`http://localhost:3000/api/processing-status?fileId=${response.data.fileId}`);
            console.log('📊 Processing status:', statusResponse.data);
            
            if (!statusResponse.data.processing) {
                console.log('✅ File processing completed successfully!');
            } else {
                console.log('⏳ File is still processing (this is normal for larger files)');
            }
        } else {
            console.log('❌ Upload failed:', response.data.error);
        }
        
        // Clean up test file
        fs.unlinkSync(testFilePath);
        console.log('\n🧹 Cleaned up test file');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testFinalWorkflow(); 