# Artpieces-Backend/GraphQL

计算机和画画有许多共同之处。事实上，在我所知道的所有行业中，黑客与画家最像。

黑客与画家的共同之处，在于他们都是创作者。与作曲家、建筑师、作家一样，黑客和画家都是试图创作出优秀的作品。他们本质上都不是在做研究，虽然在创作的过程中，他们可能会发现一些新技术（当然那样更好）。——《黑客与画家》

[前端地址](https://github.com/Frost-Lee/Art-Pieces-front-end)

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

## RESTful 移植版

Checkout to branch [restful](https://github.com/ZJUGuoShuai/ArtPieces-Back-end/tree/restful).