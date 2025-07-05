const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testPdfUpload() {
    console.log('📁 Testing PDF file upload...');
    try {
        // Create a simple test PDF content
        const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';

        // Create form data
        const form = new FormData();
        form.append('file', Buffer.from(testPdfContent), {
            filename: 'test-document.pdf',
            contentType: 'application/pdf'
        });

        console.log('🔍 Debug: Form data created:');
        console.log('  - Filename: test-document.pdf');
        console.log('  - Content-Type: application/pdf');
        console.log('  - Buffer size:', Buffer.from(testPdfContent).length);
        console.log('  - Buffer first 100 bytes:', Buffer.from(testPdfContent).slice(0, 100).toString('hex'));

        // Make the request with axios
        const response = await axios.post('http://localhost:3000/api/upload', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log('\n📊 Response:');
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Response body:', response.data);

        if (response.status === 200 && response.data.success) {
            console.log('\n✅ File upload successful!');
            console.log('File ID:', response.data.fileId);
            console.log('Filename:', response.data.filename);
            console.log('Processing:', response.data.processing);
        } else {
            console.log('\n❌ File upload failed!');
            console.log('Error:', response.data);
        }
    } catch (error) {
        if (error.response) {
            console.error('\n❌ Upload failed!');
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Response body:', error.response.data);
        } else {
            console.error('❌ Test failed:', error.message);
            if (error.stack) console.error(error.stack);
        }
    }
}

testPdfUpload(); 