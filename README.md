# Artpieces-Backend/RESTful

计算机和画画有许多共同之处。事实上，在我所知道的所有行业中，黑客与画家最像。

黑客与画家的共同之处，在于他们都是创作者。与作曲家、建筑师、作家一样，黑客和画家都是试图创作出优秀的作品。他们本质上都不是在做研究，虽然在创作的过程中，他们可能会发现一些新技术（当然那样更好）。——《黑客与画家》

[前端地址](https://github.com/Frost-Lee/Art-Pieces-front-end)

## Structure

```
Artpieces Backend
    |-- api_server/             // Provides common API service.
    |   |-- src/                // Source code
    |   |   |-- app.js          // Entry of the server.
    |   |   |-- misc.js         // An utility module to help launch the server
    |   |   |                   //+safely.
    |   |   `-- model.js        // Database models (data structures).
    |   `-- dist/               // Compiled code. Not in this repo.
    |
    `-- upload_server/          // Provides images upload service.
        |-- app.js              // Main program.
        `-- index.html          // A web page for test use.
```