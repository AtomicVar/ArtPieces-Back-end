const formidable = require('formidable');
const images = require('images');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Generate a random APPCODE in the current directory.
// The APPCODE can insure that the /destroy is sent from localhost.
const crypto = require('crypto');
fs.writeFileSync(
    path.join(__dirname, '../APPCODE.json'),
    JSON.stringify(crypto.randomBytes(20).toString('hex'))
);
console.log('APPCODE.json generated.');

const APPCODE = require('../APPCODE.json');

const APIURL = 'https://artpieces.cn/img';

const uploadServer = http.createServer((req, res) => {
    console.log(req.url);
    // Upload a file
    if (req.url == '/upload' && req.method == 'POST') {
        let form = new formidable.IncomingForm();
        let msg = {};

        form.on('file', (name, file) => {
            console.log(`Uploading image ${name}.`);
            if (file.type == 'image/jpg' || file.type == 'image/jpeg') {
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
                
                // 获取图片尺寸
                let img = images(file.path);

                // Save a compressed copy
                img.resize(400).save(compressedAbsolutePath);

                // Construct the msg
                msg.msg = `${name} uploaded`;
                msg.url = path.join(APIURL, originalRelativePath);
                msg.compressedURL = path.join(APIURL, compressedRelativePath);
            } else {
                console.log('Bad file type.');
                msg.error = '.jpg/.jpeg file wanted!';
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
            console.log('Image uploaded.');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(msg));
        });

        form.uploadDir = path.join(__dirname, 'original');
        form.keepExtensions = true;
        form.parse(req);
    }

    // 查询图片元信息（长宽）
    else if (req.url == '/query' && req.method == 'POST') {
        let req_string = '';
        req.on('data', (chunk) => {
            req_string += chunk;
        });

        req.on('end', () => {
            let req_json = JSON.parse(req_string);
            let img = images(path.join(__dirname, 'original', path.basename(req_json.url)));
            let res_json = {
                width: img.width(),
                heigth: img.height(),
            };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(res_json));
        });
    }

    // Download a original file
    else if (req.url.startsWith('/original') && req.method == 'GET') {
        console.log('Trying download original.');
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
    } else if (req.url.startsWith('/compressed') && req.method == 'GET') {
        console.log('Trying download compressed.');
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
                    return;
                });
            }
        });
    }

    // Destroy an image
    else if (req.url == '/destroy' && req.method == 'POST') {
        // Verify the APPCODE
        if (req.headers.appcode != APPCODE) {
            res.statusCode = 400;
            res.end('Permission denied!');
            return;
        }

        let rawData = '';
        req.on('data', chunk => {
            rawData += chunk;
        });
        req.on('end', () => {
            console.log(rawData);
            try {
                let file = JSON.parse(rawData).filename;
                fs.unlink(path.join(__dirname, 'original', file), err => {
                    if (err) throw err;
                    console.log(file + ' is deleted.');
                });
                fs.unlink(path.join(__dirname, 'compressed', file), err => {
                    if (err) throw err;
                    console.log(file + ' is deleted(compressed).');
                });
                res.end('OK');
            } catch (e) {
                console.error(e.message);
            }
        });
    }

    // Malformed URL
    else {
        console.log('Bad request.');
        res.statusCode = 400;
        res.end('Bad Request.');
    }
});

uploadServer.listen(4001, '0.0.0.0', () => {
    console.log('Upload server started...');
});
