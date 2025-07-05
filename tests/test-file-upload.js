const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testFileUpload() {
    console.log('📁 Testing file upload functionality...\n');
    // Create a simple test file
    const testContent = 'This is a test file for upload functionality.';
    fs.writeFileSync('test-upload.txt', testContent);
    // Read the file
    const fileBuffer = fs.readFileSync('test-upload.txt');
    // Create form data
    const form = new FormData();
    form.append('file', fileBuffer, {
        filename: 'test-upload.txt',
        contentType: 'text/plain'
    });
    try {
        const response = await axios.post('http://localhost:3000/api/upload', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Response body:', response.data);
        if (response.status === 200 && response.data.success) {
            console.log('✅ File upload successful!');
            console.log('File ID:', response.data.fileId);
            console.log('Filename:', response.data.filename);
        } else {
            console.log('❌ File upload failed:', response.data);
        }
    } catch (error) {
        if (error.response) {
            console.error('\n❌ Upload failed!');
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Response body:', error.response.data);
        } else {
            console.error('❌ Request failed:', error.message);
            if (error.stack) console.error(error.stack);
        }
    } finally {
        // Clean up test file
        if (fs.existsSync('test-upload.txt')) {
            fs.unlinkSync('test-upload.txt');
        }
    }
}

testFileUpload(); 