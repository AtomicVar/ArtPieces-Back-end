# ArtPieces Back-end APIs

## Database Description

#### Table: users

| user_id | email        | nick_name | activ_status | password |
| ------- | ------------ | --------- | ------------ | -------- |
| INT(10) | VARCHAR      | VARCHAR   | BOOL         | CHAR(40) |
| 用户ID  | 电子邮件地址 | 昵称      | 用户激活状态 | 密码     |

#### Table: user_relations

| user_id | following_id |
| ------- | ------------ |
| INT(10) | INT(10)      |
| 用户ID  | 关注者ID     |

#### Table: user_works

| user_id | work_id |
| ------- | ------- |
| INT(10) | INT(16) |
| 用户ID  | 作品ID  |

#### Table: works

| work_id | date     | data             | title   | description | type | is_public |
| ------- | -------- | ---------------- | ------- | ----------- | ---- | --------- |
| INT(16) | DATETIME | JSON             | VARCHAR | VARCHAR     | ENUM | BOOL      |
| 作品ID  | 日期时间 | 作品数据（步骤） | 标题    | 描述        | 类型 | 是否公开  |

#### Table: user_stars

| user_id | work_id |
| ------- | ------- |
| INT(10) | INT(16) |
| 用户ID  | 作品ID  |

## APIs

所有请求均为POST，类型为`application/json`，返回类型同样是`application/json`。

#### 1. login

###### 请求：

```
uri: /login
body: {
    email: string
    password: string
}
```

此处`password`为经过`SHA1` Hash过的长度为40的字符串。

###### 响应：

```
body: {
    status: int,
    msg: string,
    data: {
        user_id: int,
        token: string
    }
}
```



#### 2. put/work

###### 请求

```
uri: /put/work
body: {
    user_id: int,
    token: string,
    work_id: int,
    work_data: [{step1}, {step2}, ...]
}
```

其中，若是第一次put，则	`work_id`为0。`work_data`为一个数组，其中每个元素为一个JSON对象，即每个步骤。

###### 响应

```
body: {
    status: int,
    msg: string,
    work_id: int
}
```

#### 3. get/work

###### 请求

```
uri: /get/work
body: {
	user_id: int,
	token: string,
    work_id: int
}
```

###### 响应

```
body: {
    status: int,
    msg: string,
 	work_data: [{step1}, {step2}, ...]
}
```

