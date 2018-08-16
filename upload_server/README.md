# File upload server

## 图片上传

描述：
```
HTTP Method: POST
Content-Type: multipart/form-data
URL: ip:port/upload
```

图片规定为PNG格式。

`HTML`代码样例：
```html
<form action="http://127.0.0.1:4001/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="img">
        <input type="submit" value="Upload">
</form>
```

#### POST请求提取样例
```
POST http://95.179.143.156:4001/upload HTTP/1.1
Host: 95.179.143.156:4001
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.8,zh-CN;q=0.5,zh;q=0.3
Accept-Encoding: gzip, deflate
Content-Type: multipart/form-data; boundary=---------------------------7394612631080960774912754745
Content-Length: 133534
DNT: 1
Connection: keep-alive
Upgrade-Insecure-Requests: 1

-----------------------------7394612631080960774912754745
Content-Disposition: form-data; name="img"; filename="rateit_screenshot.png"
Content-Type: image/png

(PNG Binary Data ...)
...
...
```

其中比较重要的是：` Content-Type: multipart/form-data; boundary=---------------------------7394612631080960774912754745` ，`boundary`是什么不重要，但和下面 HTTP BODY 中的相同即可。 在`HTML`代码中的`name="img"`是必要的，就是说必须要有`name`属性，如果没有，服务器认为没有文件传过来。（具体原因我也不清楚，但我最早没有`name`时，传过去的文件是空对象。）

## 图片下载

描述：
```
HTTP Method: GET
URL: ip:port/files/example.png
URL例子：ip:port/files/upload_7d6c8dd1359dfd6ade797be8ad4c880d.png
```