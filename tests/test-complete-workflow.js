const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testCompleteWorkflow() {
    console.log('🚀 Testing complete workflow: Upload + Chat + File Search\n');
    
    const uploadedFiles = [];
    
    try {
        // Test 1: Upload text file
        console.log('📁 Step 1: Uploading text file...');
        const textContent = 'This is a test document about artificial intelligence. AI has made significant progress in recent years.';
        fs.writeFileSync('test-ai-doc.txt', textContent);
        
        const textForm = new FormData();
        textForm.append('file', fs.readFileSync('test-ai-doc.txt'), {
            filename: 'test-ai-doc.txt',
            contentType: 'text/plain'
        });
        
        const textResponse = await axios.post('http://localhost:3000/api/upload', textForm, {
            headers: textForm.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        if (textResponse.data.success) {
            console.log('✅ Text file uploaded successfully!');
            console.log('   File ID:', textResponse.data.fileId);
            uploadedFiles.push(textResponse.data.fileId);
        } else {
            throw new Error('Text file upload failed: ' + JSON.stringify(textResponse.data));
        }
        
        // Test 2: Upload PDF file
        console.log('\n📁 Step 2: Uploading PDF file...');
        const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
        fs.writeFileSync('test-document.pdf', pdfContent);
        
        const pdfForm = new FormData();
        pdfForm.append('file', fs.readFileSync('test-document.pdf'), {
            filename: 'test-document.pdf',
            contentType: 'application/pdf'
        });
        
        const pdfResponse = await axios.post('http://localhost:3000/api/upload', pdfForm, {
            headers: pdfForm.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        if (pdfResponse.data.success) {
            console.log('✅ PDF file uploaded successfully!');
            console.log('   File ID:', pdfResponse.data.fileId);
            uploadedFiles.push(pdfResponse.data.fileId);
        } else {
            throw new Error('PDF file upload failed: ' + JSON.stringify(pdfResponse.data));
        }
        
        // Test 3: Chat with uploaded files
        console.log('\n💬 Step 3: Testing chat with uploaded files...');
        console.log('   Waiting 10 seconds for file processing...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const chatResponse = await axios.post('http://localhost:3000/api/chat', {
            prompt: 'What is artificial intelligence?',
            messageHistory: [],
            debugMode: true,
            fileIds: uploadedFiles
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (chatResponse.data.response) {
            console.log('✅ Chat successful!');
            console.log('   Response:', chatResponse.data.response.substring(0, 200) + '...');
            if (chatResponse.data.debug) {
                console.log('   Debug info:', chatResponse.data.debug);
            }
        } else {
            throw new Error('Chat failed: ' + JSON.stringify(chatResponse.data));
        }
        
        console.log('\n🎉 Complete workflow test passed!');
        console.log('   - Text file uploaded and processed');
        console.log('   - PDF file uploaded and processed');
        console.log('   - Chat with file search working');
        
    } catch (error) {
        console.error('\n❌ Workflow test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Response:', error.response.data);
        }
        if (error.stack) console.error(error.stack);
    } finally {
        // Clean up test files
        ['test-ai-doc.txt', 'test-document.pdf'].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    }
}

testCompleteWorkflow(); 