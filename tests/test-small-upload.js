const fs = require('fs');
const FormData = require('form-data');

async function testSmallUpload() {
    try {
        console.log('🧪 Testing small file upload...');
        
        // Create a small test file
        const testContent = 'This is a test document for upload testing. It contains some sample text to verify the upload functionality is working correctly.';
        fs.writeFileSync('test-small.txt', testContent);
        
        console.log('📄 Created test file: test-small.txt');
        console.log('📤 Uploading to server...');
        
        const form = new FormData();
        form.append('file', fs.createReadStream('test-small.txt'));
        
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        const data = await response.json();
        console.log('📥 Server response:', data);
        
        if (data.success) {
            console.log('✅ Upload successful!');
            console.log(`📁 File ID: ${data.fileId}`);
            console.log(`📄 Filename: ${data.filename}`);
            console.log(`⏳ Processing: ${data.processing}`);
            
            if (data.processing) {
                console.log('⏳ Monitoring processing status...');
                await monitorProcessing(data.fileId);
            }
        } else {
            console.log('❌ Upload failed:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

async function monitorProcessing(fileId) {
    for (let i = 0; i < 30; i++) {
        try {
            const response = await fetch(`http://localhost:3000/api/processing-status?fileId=${fileId}`);
            const data = await response.json();
            
            console.log(`⏳ Status check ${i + 1}: ${data.processing ? 'Processing...' : 'Complete!'}`);
            
            if (!data.processing) {
                console.log('✅ File processing completed!');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error('❌ Status check failed:', error.message);
        }
    }
    console.log('⏰ Processing timeout');
}

// Run the test
testSmallUpload(); 