# sinaimg-proxy

**使用nginx或nodejs代理simaimg图片，拯救失效的图床** 



## 使用方法
在原本的新浪图床链接前拼接上你的Cloudflare Workers域名即可正常获取图片，以下是例子：

<b>新浪图床链接（有防盗链，不能直接访问）：<a href='https://tva1.sinaimg.cn/large/ec43126fgy1go4femy66vj228e35px6q.jpg'>→</a></b>
```HTTP
GET https://tva1.sinaimg.cn/large/ec43126fgy1go4femy66vj228e35px6q.jpg
```
<b>通过Cloudflare Workers代理的链接：<a href='https://sinaimg.lie.moe/https://tva1.sinaimg.cn/large/ec43126fgy1go4femy66vj228e35px6q.jpg'>→</a></b>
```HTTP
GET https://server.domain.workers.dev/https://tva1.sinaimg.cn/large/ec43126fgy1go4femy66vj228e35px6q.jpg
```


## nodejs配置 


| 功能 | 端口 |
| --- | --- |
| s5代理 | 1080 |
| 运行端口 | 8080 |


> 由https://github.com/ZiAzusa/sinaimg-cf-workers 修改而来
