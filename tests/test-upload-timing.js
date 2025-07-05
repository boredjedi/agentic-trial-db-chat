const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function testUploadTiming() {
    try {
        console.log('⏱️ Testing Upload Timing Breakdown\n');
        
        // Create a test file of different sizes
        const testSizes = [
            1024,        // 1KB
            1024 * 100,  // 100KB
            1024 * 1024, // 1MB
            1024 * 1024 * 5, // 5MB
            1024 * 1024 * 10 // 10MB
        ];
        
        for (const size of testSizes) {
            console.log(`\n📁 Testing ${formatFileSize(size)} file:`);
            
            // Create test content
            const testContent = 'A'.repeat(size);
            const buffer = Buffer.from(testContent);
            
            // Test OpenAI file upload
            const startTime = Date.now();
            console.log('  ⏳ Uploading to OpenAI...');
            
            const file = await openai.files.create({
                file: buffer,
                purpose: 'assistants'
            });
            
            const uploadTime = Date.now() - startTime;
            console.log(`  ✅ OpenAI upload: ${uploadTime}ms (${formatFileSize(size)} in ${uploadTime}ms = ${(size / uploadTime).toFixed(2)} KB/s)`);
            
            // Clean up
            try {
                await openai.files.del(file.id);
            } catch (e) {
                // Ignore cleanup errors
            }
            
            // Wait a bit between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n📊 Upload Speed Analysis:');
        console.log('- Small files (< 1MB): Usually fast (1-3 seconds)');
        console.log('- Medium files (1-5MB): Moderate (5-15 seconds)');
        console.log('- Large files (5-10MB+): Slow (15-60+ seconds)');
        console.log('- Network speed and OpenAI server load affect timing');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUploadTiming(); 