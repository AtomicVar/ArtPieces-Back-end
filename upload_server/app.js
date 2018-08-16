const formidable = require('formidable');
const http = require('http');
const fs = require('fs');

const uploadServer = http.createServer((req, res) => {
    // Upload a file
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        let form = new formidable.IncomingForm();
        let msg = {};

        form.on('file', (name, file) => {
            if (file.type == 'image/png') {
                msg.msg = `${name} uploaded`;
                msg.url = file.path;
                console.log(`File ${file.name} saved to ${file.path}.`);
            } else {
                msg.error = 'PNG wanted!';
                console.log('Bad file type.');
            }
        });

        form.on('error', (err) => {
            msg.error = 'Internal Server Error';
            throw err;
        });

        form.on('end', () => {
            if (msg.error) {
                res.statusCode = 500;
            } else {
                res.statusCode = 200;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(msg));
        });

        form.uploadDir = './files';
        form.keepExtensions = true;
        form.parse(req);
    }
    
    // Download a file
    else if (req.url.indexOf('/files') == 0 && req.method.toLowerCase() == 'get') {
        let filePath = req.url.slice(1);
        fs.stat(filePath, (err, stat) => {
            if (err) {
                if ('ENOENT' == err.code) {
                    res.statusCode = 404;
                    res.end('Not Found.');
                } else {
                    res.statusCode = 500;
                    res.end('Internal Server Error.');
                }
            } else {
                res.setHeader('Content-Length', stat.size);
                let stream = fs.createReadStream(filePath);
                stream.pipe(res);
                stream.on('error', () => {
                    res.statusCode = 500;
                    res.end('Internal Server Error.');
                });
            }
        });
    }
    
    // Malformed URL
    else {
        res.statusCode = 400;
        res.end('Bad Request.');
    }
});

uploadServer.listen(4001, '0.0.0.0',  'localhost', () => {
    console.log('Upload server started...');
});