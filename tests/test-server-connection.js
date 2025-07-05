const http = require('http');

async function testServerConnection() {
    console.log('🔍 Testing server connection...\n');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/status',
        method: 'GET'
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Headers:`, res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response body:', data);
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ Server is running and responding correctly');
                    resolve(jsonData);
                } catch (error) {
                    console.log('❌ Server response is not valid JSON');
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Server connection failed:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

testServerConnection()
    .then(() => {
        console.log('\n🎉 Server connection test passed!');
    })
    .catch((error) => {
        console.log('\n❌ Server connection test failed!');
        console.log('Make sure the server is running with: node server.js');
    }); 