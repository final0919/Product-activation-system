
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const mockApi = require('./mock/api');

const app = express();
const port = process.env.PORT || 5001;

// Use CORS with default settings (allow all origins)
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制到10MB

// If DB isn't connected, transparently fall back to in-memory API
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    // Use database routes - pass to next middleware
    return next();
  }
  // Use in-memory API - initialize admin account
  const { initializeAdmin } = require('./mock/store');
  await initializeAdmin();
  return mockApi(req, res, next);
});

// Define Routes (only used when database is connected)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/activation-codes', require('./routes/activationCodes'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Activation API Status</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(900px 500px at 10% 0%, rgba(245, 158, 11, 0.18), transparent 60%),
          radial-gradient(800px 450px at 90% 10%, rgba(251, 191, 36, 0.16), transparent 55%),
          linear-gradient(to bottom, #fffbeb, #ffffff);
        color: #111827;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        width: 100%;
        max-width: 640px;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 20px;
        padding: 24px 24px 20px;
        border: 1px solid #fef3c7;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
      }
      .header {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
      }
      .logo {
        height: 40px;
        width: 40px;
        border-radius: 16px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f9fafb;
        font-weight: 800;
        font-size: 20px;
      }
      .title {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.03em;
      }
      .subtitle {
        font-size: 13px;
        color: #4b5563;
      }
      .pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 12px 0 16px;
      }
      .pill {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
      }
      .status {
        padding: 10px 12px;
        border-radius: 12px;
        font-size: 13px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .status-ok {
        background: #ecfdf3;
        border: 1px solid #bbf7d0;
        color: #166534;
      }
      .status-bad {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
      }
      .status-ok .status-dot {
        background: #22c55e;
      }
      .status-bad .status-dot {
        background: #ef4444;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
        gap: 10px;
        margin-top: 4px;
      }
      .panel {
        border-radius: 16px;
        padding: 12px 12px 10px;
        background: #fefce8;
        border: 1px solid #fef3c7;
      }
      .panel-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .panel-body {
        font-size: 12px;
        color: #4b5563;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        background: #111827;
        color: #facc15;
        padding: 2px 6px;
        border-radius: 6px;
      }
      a {
        color: #b45309;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      @media (max-width: 480px) {
        .card {
          padding: 18px 16px 16px;
        }
      }
    </style>
  </head>
  <body>
    <main class="card">
      <header class="header">
        <div class="logo">A</div>
        <div>
          <div class="title">Activation API</div>
          <div class="subtitle">Backend status & developer info</div>
        </div>
      </header>
      <section class="pill-row">
        <div class="pill">Express · Port ${port}</div>
        <div class="pill">JSON API</div>
        <div class="pill">Yellow theme</div>
      </section>
      <section class="status ${dbReady ? 'status-ok' : 'status-bad'}">
        <span class="status-dot"></span>
        <span>${dbReady ? 'Database connected' : 'Database unavailable – API will return 503 for /api/* until it connects.'}</span>
      </section>
      <section class="grid">
        <div class="panel">
          <div class="panel-title">Frontend URL</div>
          <div class="panel-body">
             Production: <code>https://your-vercel-app.vercel.app</code><br />
             Development: <code>http://localhost:3000</code><br />
             <small>Replace with your actual Vercel domain</small>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">API examples</div>
          <div class="panel-body">
            Login: <code>POST /api/auth/login</code><br />
            Register: <code>POST /api/auth/register</code><br />
            Current user: <code>GET /api/users/me</code>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`);
});

const startServer = async () => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });

  // Try DB connection in background; API will use mock mode until connected.
  const connected = await connectDB();
  if (!connected) {
    console.warn('Database not connected. Running in in-memory mode for /api/* until DB connects.');
  }
};

startServer();
