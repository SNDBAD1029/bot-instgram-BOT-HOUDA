import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';

import * as BOT from './bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPSTATE_PATH = path.resolve(__dirname, 'appstate.json');
const CONFIG_PATH = path.resolve(__dirname, 'config.json');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json());
app.use(cors());

// Serve public assets (client JS, images, etc.)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve dashboard index.html from project root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ensure config exists
const defaultConfig = {
  enabled: true,
  welcomeMessage: "مرحبا انا اسمي 22HM\n\nلقد تم تطويري من قبل حودا\n\nشكرا لـ رسالتك سيقوم حودا بالرد عليك في اقرب وقت ممكن",
  stats: { messagesReceived: 0, messagesSent: 0 },
  botRunning: false
};
if (!fs.existsSync(CONFIG_PATH)) fs.writeJsonSync(CONFIG_PATH, defaultConfig, { spaces: 2 });

function readConfig() {
  try { return fs.readJsonSync(CONFIG_PATH); } catch (e) { return defaultConfig; }
}
function writeConfig(cfg) { fs.writeJsonSync(CONFIG_PATH, cfg, { spaces: 2 }); }

// API: status
app.get('/api/status', (req, res) => {
  const cfg = readConfig();
  const appstateExists = fs.existsSync(APPSTATE_PATH) && Object.keys(fs.readJsonSync(APPSTATE_PATH) || {}).length > 0;
  res.json({ config: cfg, appstateExists, botRunning: cfg.botRunning });
});

// Update welcome message
app.post('/api/message', (req, res) => {
  const { message } = req.body;
  const cfg = readConfig();
  cfg.welcomeMessage = typeof message === 'string' ? message : cfg.welcomeMessage;
  writeConfig(cfg);
  if (typeof BOT.updateConfig === 'function') BOT.updateConfig(cfg);
  res.json({ ok: true, config: cfg });
});

// Toggle enabled
app.post('/api/toggle', (req, res) => {
  const { enabled } = req.body;
  const cfg = readConfig();
  cfg.enabled = !!enabled;
  writeConfig(cfg);
  if (typeof BOT.updateConfig === 'function') BOT.updateConfig(cfg);
  res.json({ ok: true, config: cfg });
});

// Import cookie string (user pastes cookie header)
app.post('/api/import-cookies', async (req, res) => {
  const { cookieString } = req.body;
  if (!cookieString || typeof cookieString !== 'string') return res.status(400).json({ error: 'cookieString required' });
  await fs.writeJson(APPSTATE_PATH, { cookieString }, { spaces: 2 });
  if (typeof BOT.loadCookiesFromAppstate === 'function') {
    await BOT.loadCookiesFromAppstate(APPSTATE_PATH);
  }
  res.json({ ok: true });
});

// Upload appstate.json file via multipart/form-data (field name: appstate)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
app.post('/api/upload-appstate', upload.single('appstate'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const text = req.file.buffer.toString('utf8');
    const parsed = JSON.parse(text);
    await fs.writeJson(APPSTATE_PATH, parsed, { spaces: 2 });
    if (typeof BOT.loadCookiesFromAppstate === 'function') {
      await BOT.loadCookiesFromAppstate(APPSTATE_PATH);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON file', details: e.message });
  }
});

// Start bot
app.post('/api/start', async (req, res) => {
  const cfg = readConfig();
  try {
    await BOT.start(io, CONFIG_PATH, APPSTATE_PATH);
    cfg.botRunning = true;
    writeConfig(cfg);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Stop bot
app.post('/api/stop', async (req, res) => {
  try {
    await BOT.stop();
    const cfg = readConfig();
    cfg.botRunning = false;
    writeConfig(cfg);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Socket: forward bot logs and allow dashboard to receive events
io.on('connection', (socket) => {
  console.log('Dashboard connected');
  socket.emit('connected', { now: Date.now() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
});
