const fs = require('fs');

async function testUpload() {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let data = '';
    data += '--' + boundary + '\r\n';
    data += 'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n';
    data += 'Content-Type: text/plain\r\n\r\n';
    data += 'This is a test document.\r\n';
    data += '--' + boundary + '--\r\n';

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
            },
            body: data
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (err) {
        console.error('Error fetching:', err);
    }
}

testUpload();
