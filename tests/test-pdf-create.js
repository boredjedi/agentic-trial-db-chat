const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple PDF file programmatically
function createSimplePDF() {
    // This is a minimal PDF file structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World!) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000361 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

    return Buffer.from(pdfContent, 'utf8');
}

async function testPDFUpload() {
    try {
        console.log('🚀 Testing PDF Upload...\n');
        
        // Create a simple PDF file
        const pdfBuffer = createSimplePDF();
        const testFilePath = path.join(__dirname, 'test-simple.pdf');
        fs.writeFileSync(testFilePath, pdfBuffer);
        
        console.log('📁 Created test PDF:', testFilePath);
        console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
        console.log('📦 PDF first 100 bytes:', pdfBuffer.slice(0, 100).toString('hex'));
        
        // Create form data
        const form = new FormData();
        form.append('files', fs.createReadStream(testFilePath));
        
        console.log('📤 Uploading PDF file...');
        
        const response = await axios.post('http://localhost:3000/api/upload', form, {
            headers: form.getHeaders(),
            timeout: 30000
        });
        
        console.log('✅ Upload response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('\n🎉 SUCCESS! PDF upload is working correctly!');
            console.log('✅ Filename preserved:', response.data.filename);
            console.log('✅ File ID generated:', response.data.fileId);
            console.log('✅ Processing started:', response.data.processing);
            
            // Wait a bit and check processing status
            console.log('\n⏳ Checking processing status...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await axios.get(`http://localhost:3000/api/upload/status/${response.data.fileId}`);
            console.log('📊 Processing status:', statusResponse.data);
            
            if (!statusResponse.data.processing) {
                console.log('✅ PDF processing completed successfully!');
            } else {
                console.log('⏳ PDF still processing...');
            }
        } else {
            console.log('❌ Upload failed:', response.data.error);
        }
        
        // Clean up
        fs.unlinkSync(testFilePath);
        console.log('\n🧹 Cleaned up test file');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('📋 Error response:', error.response.data);
        }
    }
}

testPDFUpload(); 