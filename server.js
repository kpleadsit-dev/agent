const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();

// Your Private Proxy configuration
const PROXY_HOST = '198.23.243.226';
const PROXY_PORT = 6361;
const PROXY_USER = 'lswyimcd';
const PROXY_PASS = 'rqywx6r1yil8';

// Create an authenticated proxy agent for Humana/Aetna requests
const proxyAgent = new HttpsProxyAgent(`http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`);

// Middleware to fix asset links and HTML content so styles load properly
const injectProxyFixes = {
  target: 'https://www.humana.com',
  changeOrigin: true,
  secure: false,
  agent: proxyAgent,
  pathRewrite: { '^/humana': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Rewrite redirects and headers if necessary
    const contentType = proxyRes.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      let originalWrite = res.write;
      let originalEnd = res.end;
      let chunks = [];

      res.write = function (chunk) {
        if (chunk) chunks.push(chunk);
      };

      res.end = function (chunk) {
        if (chunk) chunks.push(chunk);
        let body = Buffer.concat(chunks).toString('utf8');
        
        // Rewrite root-relative paths so CSS, JS, and images load through /humana/
        body = body.replace(/href="\//g, 'href="/humana/');
        body = body.replace(/src="\//g, 'src="/humana/');
        body = body.replace(/action="\//g, 'action="/humana/');

        res.setHeader('content-length', Buffer.byteLength(body));
        originalEnd.call(res, body);
      };
    }
  }
};

app.use('/humana', createProxyMiddleware(injectProxyFixes));

// Main Dashboard UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agent Portal Gateway</title>
        <style>
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
            h1 { font-size: 22px; color: #111827; margin-bottom: 8px; }
            p { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
            .btn { display: block; width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; color: white; cursor: pointer; }
            .humana { background-color: #4b830d; }
            .humana:hover { background-color: #3b680a; }
            .secure { font-size: 12px; color: #9ca3af; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Agent Portal Gateway</h1>
            <p>Select a portal below to launch:</p>
            <a class="btn humana" href="/humana">Open Humana Portal</a>
            <div class="secure">🔒 Secured via Private US Proxy</div>
        </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
