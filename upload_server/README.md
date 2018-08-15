# File upload server

## 图片上传

描述：
```
HTTP Method: POST
Content-Type: multipart/form-data
URL: ip:port/upload
```

`HTML`代码样例：
```html
<form action="http://127.0.0.1:4001/upload" method="post" enctype="multipart/form-data">
        <input type="file">
        <input type="submit" value="Upload">
    </form>
```

## 图片下载

描述：
```
HTTP Method: GET
URL: ip:port/files/example.png
URL例子：ip:port/files/upload_7d6c8dd1359dfd6ade797be8ad4c880d.png
```