const express = require('express');
const fetch = require('node-fetch');
const { SocksProxyAgent } = require('socks-proxy-agent');

const app = express();

// 【配置区】填写你的 SOCKS5 代理账号、密码、IP 和端口
// 格式: socks5://username:password@host:port
const PROXY_URL = 'socks5://你的账号:你的密码@127.0.0.1:1080';

// 初始化代理 Agent
const proxyAgent = new SocksProxyAgent(PROXY_URL);

// 【1】全局中间件：添加跨域和缓存控制响应头
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Accept-Encoding,X-Requested-with,Origin');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    
    // 如果是 OPTIONS 预检请求，直接返回 204
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// 【2】处理图片请求路由
app.get('/*', async (req, res) => {
    // 处理新浪图床链接 (去掉开头的 / 以及 http(s)://)
    let rawPath = req.path.substring(1);
    let sinaUrl = rawPath.replace(/^https?:\/+/, '');
    
    // 构建新 URL 并校验域名
    const newUrl = `https://${sinaUrl}`;
    try {
        const parsedUrl = new URL(newUrl);
        if (!parsedUrl.hostname.includes('sinaimg.cn')) {
            return res.status(404).send('404 Not Found (Invalid Domain)');
        }
    } catch (e) {
        return res.status(400).send('Bad Request');
    }

    try {
        // 【3】通过带有账号密码的 SOCKS5 代理回源新浪图床
        const response = await fetch(newUrl, {
            agent: proxyAgent, // 挂载本地代理
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
                "Referer": "https://weibo.cn/"
            }
        });

        // 【4】校验响应状态和类型
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('image')) {
            return res.status(404).send('404 Not Found (Image Unreachable)');
        }

        // 【5】设置返回给客户端的 Header 并流式转发
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        
        // 使用 pipe 流式传输，边下载边发送，不占用服务器内存
        response.body.pipe(res);

    } catch (error) {
        console.error('代理请求失败:', error.message);
        res.status(502).send('502 Bad Gateway (Proxy Connection Failed)');
    }
});

// 启动服务
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Node.js 代理服务已启动，监听内部端口: ${PORT}`);
    // 出于安全考虑，控制台日志隐藏真实的账号密码信息
    const safeLogUrl = new URL(PROXY_URL);
    console.log(`代理模式: 已开启，当前代理服务器 -> ${safeLogUrl.host}`);
});
