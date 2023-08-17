const fs = require('fs');
const path = require('path');
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/index.html') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html'});
                res.end('Internal Server Error')
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html'});
                res.end(data)
            }
        });
    } else if (req.url.endsWith('.html')) {
        const errorPath = path.join(__dirname, '404.html');
        fs.readFile(errorPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html'});
                res.end('Internal Server Error')
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html'});
                res.end(data)
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is running');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});