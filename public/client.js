(() => {
  const socket = io();
  const consoleEl = document.getElementById('console');
  const statsEl = document.getElementById('stats');
  const welcomeMsgEl = document.getElementById('welcomeMsg');
  const enabledToggle = document.getElementById('enabledToggle');
  const importCookiesBtn = document.getElementById('importCookiesBtn');
  const cookieInput = document.getElementById('cookieString');
  const saveMsgBtn = document.getElementById('saveMsg');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const botStatus = document.getElementById('botStatus');
  const statusBadge = document.getElementById('statusBadge');
  const uploadForm = document.getElementById('uploadForm');
  const appstateFile = document.getElementById('appstateFile');
  const threadCountEl = document.getElementById('threadCount');
  const ttsToggle = document.getElementById('ttsToggle');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn = document.getElementById('loginBtn');

  let ttsEnabled = false;
  let lastSessionState = null;

  function appendLog(text) {
    const now = new Date().toLocaleTimeString();
    consoleEl.textContent += `[${now}] ${text}\n`;
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  async function loadStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data && data.config) {
        welcomeMsgEl.value = data.config.welcomeMessage || '';
        enabledToggle.checked = !!data.config.enabled;
        statsEl.textContent = `رسائل واردة: ${data.config.stats.messagesReceived || 0} — رسائل مُرسلة: ${data.config.stats.messagesSent || 0}`;
        botStatus.textContent = data.botRunning ? 'البوت يعمل' : 'البوت متوقف';
        statusBadge.textContent = data.botRunning ? 'أونلاين' : 'متوقف';
        
        // Show/hide warning banner based on session status
        const alertBanner = document.getElementById('alertBanner');
        const uploadRow = document.querySelector('.upload-row');
        const sessionChanged = lastSessionState !== data.appstateExists;
        
        if (!data.appstateExists) {
          alertBanner.style.display = 'block';
          if (uploadRow) uploadRow.classList.add('highlight-card');
          startBtn.disabled = true;
          startBtn.title = 'يجب رفع ملف الجلسة أولاً';
          if (sessionChanged) {
            appendLog('⚠️ تنبيه: لا توجد جلسة محفوظة. الرجاء رفع ملف appstate.json أو لصق الكوكيز.');
          }
        } else {
          alertBanner.style.display = 'none';
          if (uploadRow) uploadRow.classList.remove('highlight-card');
          startBtn.disabled = false;
          startBtn.title = '';
          if (sessionChanged && lastSessionState === false) {
            appendLog('✅ تم رفع الجلسة بنجاح! يمكنك الآن تشغيل البوت.');
          }
        }
        lastSessionState = data.appstateExists;
      }
    } catch (e) {
      appendLog('فشل جلب الحالة: ' + e.message);
    }
  }

  socket.on('bot-log', (d) => {
    appendLog(d.message);
  });

  socket.on('stats', (s) => {
    statsEl.textContent = `رسائل واردة: ${s.messagesReceived || 0} — رسائل مُرسلة: ${s.messagesSent || 0}`;
  });

  socket.on('thread-count', (count) => {
    threadCountEl.textContent = `المحادثات: ${count}`;
  });

  socket.on('new-message', (m) => {
    appendLog(`رسالة جديدة من ${m.fromUserId} في المحادثة ${m.threadId}: ${m.text}`);
    // emit to TTS
    if (ttsEnabled && m.text) {
      try {
        const ut = new SpeechSynthesisUtterance(m.text);
        ut.lang = 'ar-SA';
        speechSynthesis.cancel(); // stop any previous
        speechSynthesis.speak(ut);
      } catch (e) {
        appendLog('خطأ في قراءة الصوت: ' + e.message);
      }
    }
  });

  uploadForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const file = appstateFile.files[0];
    if (!file) return alert('اختر ملف appstate.json للرفع');
    const form = new FormData();
    form.append('appstate', file);
    appendLog('رفعت الملف، جاري الإرسال...');
    try {
      const res = await fetch('/api/upload-appstate', { method: 'POST', body: form });
      const json = await res.json();
      if (json.ok) {
        appendLog('تم رفع ملف الجلسة بنجاح');
        await loadStatus();
      } else {
        appendLog('رفع الملف فشل: ' + JSON.stringify(json));
        alert('رفع الملف فشل: ' + (json.error || 'خطأ'));
      }
    } catch (e) {
      appendLog('Upload error: ' + e.message);
    }
  });

  importCookiesBtn.addEventListener('click', async () => {
    const cookieString = cookieInput.value.trim();
    if (!cookieString) return alert('ألصق سلسلة الكوكيز أولاً');
    appendLog('جاري استيراد الكوكيز...');
    try {
      const res = await fetch('/api/import-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieString })
      });
      const json = await res.json();
      if (json.ok) appendLog('تم استيراد الكوكيز.');
      else appendLog('فشل استيراد الكوكيز: ' + JSON.stringify(json));
    } catch (e) {
      appendLog('Import error: ' + e.message);
    }
  });

  saveMsgBtn.addEventListener('click', async () => {
    const message = welcomeMsgEl.value;
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const json = await res.json();
      if (json.ok) {
        appendLog('تم تحديث رسالة الترحيب.');
        await loadStatus();
      } else appendLog('خطأ تحديث الرسالة: ' + JSON.stringify(json));
    } catch (e) {
      appendLog('Save message error: ' + e.message);
    }
  });

  enabledToggle.addEventListener('change', async () => {
    const enabled = enabledToggle.checked;
    try {
      const res = await fetch('/api/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const json = await res.json();
      if (json.ok) appendLog('تم ' + (enabled ? 'تفعيل' : 'إيقاف') + ' الرد الآلي');
      await loadStatus();
    } catch (e) {
      appendLog('Toggle error: ' + e.message);
    }
  });

  startBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/start', { method: 'POST' });
      const json = await res.json();
      if (json.ok) appendLog('تم تشغيل البوت.');
      else appendLog('فشل تشغيل البوت: ' + JSON.stringify(json));
      await loadStatus();
    } catch (e) {
      appendLog('Start error: ' + e.message);
    }
  });

  stopBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/stop', { method: 'POST' });
      const json = await res.json();
      if (json.ok) appendLog('تم إيقاف البوت.');
      else appendLog('فشل إيقاف البوت: ' + JSON.stringify(json));
      await loadStatus();
    } catch (e) {
      appendLog('Stop error: ' + e.message);
    }
  });

  ttsToggle.addEventListener('change', () => {
    ttsEnabled = !!ttsToggle.checked;
    appendLog('قراءة الرسائل (TTS) ' + (ttsEnabled ? 'مفعلة' : 'معطلة'));
  });

  loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
      alert('الرجاء إدخال البريد الإلكتروني/اسم المستخدم وكلمة المرور');
      return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'جاري تسجيل الدخول...';
    appendLog('محاولة تسجيل الدخول...');
    
    try {
      const res = await fetch('/api/login-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      
      if (json.ok) {
        appendLog('✅ تم تسجيل الدخول بنجاح!');
        passwordInput.value = '';
        await loadStatus();
      } else {
        appendLog('❌ فشل تسجيل الدخول: ' + (json.error || 'خطأ غير معروف'));
        alert('فشل تسجيل الدخول: ' + (json.error || 'تحقق من البريد وكلمة المرور'));
      }
    } catch (e) {
      appendLog('❌ خطأ في تسجيل الدخول: ' + e.message);
      alert('خطأ في الاتصال: ' + e.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'تسجيل الدخول';
    }
  });

  // initial load
  loadStatus();
})();
