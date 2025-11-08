const fs = require('fs-extra');
const { IgApiClient } = require('instagram-private-api');
const { CookieJar } = require('tough-cookie');

let ig = null;
let pollInterval = null;
let keepAliveInterval = null;
let ioRef = null;
let configPathGlobal = null;
let appstatePathGlobal = null;
let lastMessageIds = new Map();
let isSending = false;

function log(msg) {
  const payload = { message: String(msg), ts: Date.now() };
  console.log(payload.message);
  if (ioRef) ioRef.emit('bot-log', payload);
}

async function readConfig() {
  try { return fs.readJsonSync(configPathGlobal); } catch (e) { return null; }
}

async function saveAppStateSerialized() {
  try {
    if (!ig) return;
    const serialized = await ig.state.serialize();
    await fs.writeJson(appstatePathGlobal, serialized, { spaces: 2 });
    log('Saved session to appstate.json');
  } catch (e) {
    log('Failed to save appstate: ' + (e.message || e));
  }
}

async function ensureIg() {
  if (!ig) {
    ig = new IgApiClient();
  }
}

// Convert cookie string to tough-cookie jar
async function setCookieJarFromString(cookieString) {
  const jar = new CookieJar();
  const pairs = cookieString.split(';').map(s => s.trim()).filter(Boolean);
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.substring(0, idx).trim();
    const value = pair.substring(idx + 1).trim();
    const cookieStr = `${name}=${value}; Domain=.instagram.com; Path=/; HttpOnly`;
    try {
      await jar.setCookie(cookieStr, 'https://www.instagram.com');
    } catch (e) {
      log('Error setting cookie: ' + (e.message || e));
    }
  }
  ig.state.cookieJar = jar;
}

async function loadSessionFromAppstate(appstatePath) {
  try {
    if (!fs.existsSync(appstatePath)) return false;
    const data = fs.readJsonSync(appstatePath);
    await ensureIg();
    if (data && data.cookieString) {
      log('Loading cookieString from appstate.json');
      await setCookieJarFromString(data.cookieString);
      return true;
    }
    if (data && (data.constants || data.cookieJar || data.deviceString || data.uuid)) {
      await ensureIg();
      await ig.state.deserialize(data);
      log('Deserialized ig.state from appstate.json');
      return true;
    }
    return false;
  } catch (e) {
    log('Error loading appstate: ' + (e.message || e));
    return false;
  }
}

async function checkLogin() {
  try {
    const me = await ig.account.currentUser();
    log(`Logged in as ${me.username} (pk: ${me.pk})`);
    return me;
  } catch (e) {
    log('Login check failed: ' + (e.message || e));
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function humanLikeSend(threadId, message) {
  // Simulate typing delay and human-like behaviour before sending
  const typingDelay = randomBetween(2500, 8000); // 2.5s - 8s
  log(`Simulating typing for ${typingDelay} ms before replying to ${threadId}`);
  ioRef && ioRef.emit('bot-log', { message: `Simulating typing ${typingDelay}ms before reply`, ts: Date.now() });
  await sleep(typingDelay);

  // Extra randomized small pauses, and avoid sending if another send in progress
  if (isSending) {
    const wait = randomBetween(500, 2000);
    log(`Another send in progress; waiting ${wait}ms`);
    await sleep(wait);
  }
  isSending = true;
  try {
    await ig.entity.directThread(threadId).broadcastText(message);
    log(`Replied to thread ${threadId}`);
  } finally {
    isSending = false;
  }
}

async function keepAliveJob() {
  try {
    // Fetch timeline to appear active
    await ig.feed.timeline().items();
    log('Performed keep-alive timeline fetch');
  } catch (e) {
    log('Keep-alive error: ' + (e.message || e));
  }
}

async function pollingLoop() {
  const cfg = await readConfig();
  if (!cfg) return;
  if (!cfg.enabled) {
    // still emit stats if present
    if (ioRef) ioRef.emit('stats', cfg.stats || { messagesReceived: 0, messagesSent: 0 });
    return;
  }

  try {
    const inboxFeed = ig.feed.directInbox();
    const threads = await inboxFeed.items();
    // Emit thread count to dashboard
    if (ioRef) ioRef.emit('thread-count', Array.isArray(threads) ? threads.length : 0);

    if (!threads || !threads.length) return;
    const me = await checkLogin();
    const myId = me ? me.pk : null;

    for (const thread of threads) {
      const threadId = thread.thread_id;
      const lastItem = (thread.items && thread.items[0]) || null;
      const lastItemId = lastItem ? lastItem.item_id : null;
      if (!lastItemId) continue;
      const prevSeen = lastMessageIds.get(threadId);
      if (prevSeen && prevSeen === lastItemId) continue;

      const senderId = lastItem.user_id;
      const text = lastItem.text || (lastItem.item_type === 'text' ? lastItem.message : '') || '';
      // Notify dashboard about new message (so it can display and optionally read aloud)
      if (ioRef) ioRef.emit('new-message', {
        threadId,
        fromUserId: senderId,
        text: text || '[non-text message]',
        ts: Date.now()
      });

      // update received stats
      if (senderId && myId && senderId.toString() !== myId.toString()) {
        cfg.stats = cfg.stats || { messagesReceived: 0, messagesSent: 0 };
        cfg.stats.messagesReceived = (cfg.stats.messagesReceived || 0) + 1;
        fs.writeJsonSync(configPathGlobal, cfg, { spaces: 2 });
        if (ioRef) ioRef.emit('stats', cfg.stats);

        if (cfg.enabled) {
          const message = cfg.welcomeMessage || '';
          try {
            await humanLikeSend(threadId, message);
            cfg.stats.messagesSent = (cfg.stats.messagesSent || 0) + 1;
            fs.writeJsonSync(configPathGlobal, cfg, { spaces: 2 });
            if (ioRef) ioRef.emit('stats', cfg.stats);
            await saveAppStateSerialized();
          } catch (e) {
            log('Failed to send reply: ' + (e.message || e));
          }
        } else {
          log(`New message in ${threadId} but auto-reply disabled`);
        }
      }
      lastMessageIds.set(threadId, lastItemId);
    }
  } catch (e) {
    log('Polling error: ' + (e.message || e));
  }
}

async function start(io, configPath, appstatePath) {
  ioRef = io;
  configPathGlobal = configPath;
  appstatePathGlobal = appstatePath;
  await ensureIg();
  const loaded = await loadSessionFromAppstate(appstatePathGlobal);
  if (!loaded) {
    log('No usable session found in appstate.json. Please use dashboard to import cookies or provide a serialized session.');
    ig.state.cookieJar = new CookieJar();
  } else {
    await checkLogin();
  }

  // clear previous intervals
  if (pollInterval) clearInterval(pollInterval);
  if (keepAliveInterval) clearInterval(keepAliveInterval);

  // Start polling with small jitter between runs to appear less bot-like
  const baseIntervalMs = 10000; // 10s
  pollInterval = setInterval(async () => {
    // jitter +/- 3s
    const jitter = randomBetween(-3000, 3000);
    await sleep(Math.max(0, jitter));
    await pollingLoop();
  }, baseIntervalMs);

  // Keep-alive: fetch timeline every 60-120 seconds randomly
  keepAliveInterval = setInterval(async () => {
    await keepAliveJob();
  }, randomBetween(60 * 1000, 120 * 1000));

  // run once immediately
  await pollingLoop();

  // Expose helper functions
  module.exports.updateConfig = async function (cfg) {
    if (ioRef) ioRef.emit('config', cfg);
  };

  module.exports.loadCookiesFromAppstate = async function (appstatePath) {
    const loaded2 = await loadSessionFromAppstate(appstatePath);
    if (loaded2) {
      const valid = await checkLogin();
      if (valid) log('Session loaded and verified after appstate upload or cookie import.');
      else log('Session loaded but login verification failed. Cookies may be incomplete or expired.');
    } else {
      log('No cookies/session found in appstate.json.');
    }
  };
}

async function stop() {
  if (pollInterval) clearInterval(pollInterval);
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  pollInterval = null;
  keepAliveInterval = null;
  try { await saveAppStateSerialized(); } catch (e) {}
  ig = null;
  ioRef = null;
  lastMessageIds.clear();
}

module.exports = {
  start,
  stop,
  updateConfig: async () => {},
  loadCookiesFromAppstate: async () => {}
};