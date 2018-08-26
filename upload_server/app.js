const formidable = require('formidable');
const sharp = require('sharp');
const http = require('http');
const path = require('path');
const fs = require('fs');

let APIURL = '';
if (process.env.NODE_ENV == 'test') {
    APIURL = 'http://127.0.0.1:4001/';
} else {
    APIURL = 'https://artpieces.cn/img';
}

const uploadServer = http.createServer((req, res) => {
    // Upload a file
    if (req.url == '/upload' && req.method == 'POST') {
        let form = new formidable.IncomingForm();
        let msg = {};

        form.on('file', (name, file) => {
            if (file.type == 'image/png') {
                // Use absolute path while saving files
                // Use relative path while giving download URLs
                let originalRelativePath = path.relative(__dirname, file.path);
                let compressedAbsolutePath = path.join(
                    __dirname,
                    'compressed',
                    path.basename(file.path)
                );
                let compressedRelativePath = path.join(
                    'compressed',
                    path.basename(file.path)
                );
                // Save a compressed copy
                fs.readFile(file.path, (err, data) => {
                    if (err) throw err;
                    sharp(data)
                        .resize(400, 300)
                        .toFile(compressedAbsolutePath);
                });

                // Construct the msg
                msg.msg = `${name} uploaded`;
                msg.url = APIURL + originalRelativePath;
                msg.compressedURL = APIURL + compressedRelativePath;
            } else {
                msg.error = 'PNG wanted!';
            }
        });

        form.on('error', err => {
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

        form.uploadDir = path.join(__dirname, 'original');
        form.keepExtensions = true;
        form.parse(req);
    }

    // Download a original file
    else if (req.url.indexOf('/original') == 0 && req.method == 'GET') {
        let filePath = path.join(__dirname, req.url.slice(1));
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
    } else if (req.url.indexOf('/compressed') == 0 && req.method == 'GET') {
        let filePath = path.join(__dirname, req.url.slice(1));
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

uploadServer.listen(4001, '0.0.0.0', 'localhost', () => {
    console.log('Upload server started...');
});
