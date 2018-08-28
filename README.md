# Artpieces-Backend/GraphQL

计算机和画画有许多共同之处。事实上，在我所知道的所有行业中，黑客与画家最像。

黑客与画家的共同之处，在于他们都是创作者。与作曲家、建筑师、作家一样，黑客和画家都是试图创作出优秀的作品。他们本质上都不是在做研究，虽然在创作的过程中，他们可能会发现一些新技术（当然那样更好）。——《黑客与画家》

---

[前端地址](https://github.com/Frost-Lee/Art-Pieces-front-end)

[GraphQL Playground / API 测试地址(https://artpieces.cn/api)](https://artpieces.cn/api)

**注意**：一定要在地址栏加上`/api`，如图所示，否则将没有任何结果。
![截图](https://wx3.sinaimg.cn/mw1024/8163951ely1funftn0f3vj20gv05daa0.jpg)

Upload server 地址：https://artpieces.cn/img

## Convention

`Mutation`类型的 API 将统一返回`Msg`对象，这个对象的结构是：

```json
{
    "status": Number,
    "payload": Object
}
```

当`status`为`0`时表示正常返回，这时`payload`的类型取决于 API 的类型，在 API 文档里有清晰的说明（在 Playground 里，用`Status-0-Payload`来指代这个对象的）；

当`status`不为`0`时表示有错误发生，这时`payload`是一个说明错误原因的`String`。目前支持的错误类型有：

| status | payload                           | description                      |
| ------ | --------------------------------- | -------------------------------- |
| -1     | Access Denied: wrong password.    | 用户密码错误                     |
| -2     | Access Denied: illegal identity. | 用户身份不符合，试图改动他人数据 |
| -3     | Object Not Found                  | 数据操作目标不存在               |
| 1      | ?                                 | 其他类型错误，payload 不确定     |

## Structure

```
Artpieces Backend
    |-- api_server/             // API 服务器
    |   |-- src/                // 源代码
    |   |   |-- app.js          // 主程序入口
    |   |   |-- controller.js   // API 函数
    |   |   |-- misc.js         // 一个使得服务器更安全启动的模块
    |   |   |-- model.js        // 数据库模型（数据包定义）
    |   |   `-- schema.graphql  // GraphQL Schema
    |   `-- dist/               // Babel 编译后的代码
    |
    `-- upload_server/          // 文件（图片）上传服务器
        |-- app.js              // 主程序入口
        `-- index.html          // 供测试用的网页
```

## TODOs

-   [ ] 用户注册限制（目前用户注册 API 没有任何限制，可以非法注册大量用户）
-   [x] 身份验证
-   [ ] 完善的错误处理系统
-   [x] 旧图片的自动销毁

## RESTful 移植版

Checkout to branch [restful](https://github.com/ZJUGuoShuai/ArtPieces-Back-end/tree/restful).
