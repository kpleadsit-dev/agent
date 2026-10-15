const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 1. Humana Proxy Route
app.use('/humana', createProxyMiddleware({
  target: 'https://www.humana.com',
  changeOrigin: true,
  secure: false,
  pathRewrite: { '^/humana': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  }
}));

// 2. Aetna Proxy Route
app.use('/aetna', createProxyMiddleware({
  target: 'https://www.aetna.com',
  changeOrigin: true,
  secure: false,
  pathRewrite: { '^/aetna': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  }
}));

// 3. Main Dashboard UI
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
            .aetna { background-color: #d22630; }
            .aetna:hover { background-color: #ad1c24; }
            .secure { font-size: 12px; color: #9ca3af; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Agent Portal Gateway</h1>
            <p>Select a portal below to launch:</p>

            <a class="btn humana" href="/humana">Open Humana Portal</a>
            <a class="btn aetna" href="/aetna">Open Aetna Portal</a>

            <div class="secure">🔒 Secure Express Gateway</div>
        </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});
