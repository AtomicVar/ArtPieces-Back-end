const Koa = require('koa');
const logger = require('koa-logger');
const body = require('koa-better-body');
const router = require('koa-router')();
const serve = require('koa-static');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const APIURL = 'http://127.0.0.1:4001/';

const upload = async (ctx) => {
    ctx.response.type = 'application/json';
    console.log("haha");
    let file = ctx.request.files[0];
    let newfile = 'files/' + path.basename(file.path) + '.png';
    fs.copyFile(file.path, newfile, (err) => { if (err) throw err; });
    ctx.response.body = {
        msg: 'File saved',
        url: APIURL + newfile, 
    };

};

router.post('/upload', upload);

app.use(logger());
app.use(body(option = { formLimit: '10mb' }));
app.use(router.routes());
app.use(serve('.'));

app.listen(4001);
console.log(`File upload server started at ${APIURL}`);