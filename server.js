const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

const sessions = new Map();
const streams = new Map();
const analytics = {
  sessions: 0,
  messages: 0,
  gamesPlayed: 0,
  escalations: 0,
};

const resourceLibrary = [
  { id: 'counseling', title: 'Campus Counseling Center', url: 'https://example.edu/counseling', tags: ['counselor', 'talk'] },
  { id: 'breathing', title: 'Guided Breathing Exercise', url: 'https://example.org/breathe', tags: ['breathing', 'calm'] },
  { id: 'sleep', title: 'Better Sleep Tips', url: 'https://example.org/sleep', tags: ['sleep', 'rest'] },
  { id: 'hotline', title: '24/7 Crisis Hotline', url: 'tel:988', tags: ['crisis', 'emergency'] },
  { id: 'support-group', title: 'Peer Support Group', url: 'https://example.org/support', tags: ['peer', 'community'] },
];

const hotlineDirectory = [
  { label: '988 Suicide & Crisis Lifeline', value: '988' },
  { label: 'Campus Security', value: 'tel:+180000000' },
  { label: 'Local Emergency', value: '911' },
];

function broadcast(sessionId, event, data) {
  const listeners = streams.get(sessionId);
  if (!listeners) return;
  listeners.forEach((res) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

function detectRisk(message = '') {
  const normalized = message.toLowerCase();
  const crisisKeywords = ['suicide', 'kill myself', 'hurt myself', 'end it', 'can\'t go on', 'overdose'];
  const concerning = crisisKeywords.some((word) => normalized.includes(word));
  if (concerning) {
    return { level: 'high', reason: 'crisis_keyword' };
  }
  if (normalized.includes('sad') || normalized.includes('anxious') || normalized.includes('stressed')) {
    return { level: 'medium', reason: 'distress' };
  }
  return { level: 'low', reason: 'none' };
}

function guidedReply(message) {
  if (!message) {
    return 'Hi there. I can help with quick check-ins, calming microgames, or finding resources. How are you feeling right now?';
  }
  const normalized = message.toLowerCase();
  if (normalized.includes('game')) {
    return 'Want to try a 4-7-8 breathing exercise, trivia, or word association?';
  }
  if (normalized.includes('stress') || normalized.includes('anxiety')) {
    return 'Thanks for sharing. A short breathing exercise could help. I can also start a guided check-in like GAD-7.';
  }
  if (normalized.includes('help') || normalized.includes('support')) {
    return 'I am here to support. I can connect you with resources or start a quick wellbeing check-in.';
  }
  return 'I heard you. I can listen, run a check-in, or share resources. Want to start a guided GAD-7 check-in?';
}

function ensureSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }
  const expiresAt = new Date(session.expiresAt);
  if (Date.now() > expiresAt.getTime()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

app.post('/api/chat/session', (_req, res) => {
  const now = new Date();
  const sessionId = uuidv4();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const session = { sessionId, createdAt: now.toISOString(), expiresAt: expiresAt.toISOString(), anonymous: true };
  sessions.set(sessionId, session);
  analytics.sessions += 1;
  res.json(session);
});

app.get('/api/chat/:sessionId/stream', (req, res) => {
  const { sessionId } = req.params;
  const session = ensureSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);
  const listeners = streams.get(sessionId) || new Set();
  listeners.add(res);
  streams.set(sessionId, listeners);
  req.on('close', () => {
    listeners.delete(res);
  });
});

app.post('/api/chat/:sessionId/message', (req, res) => {
  const { sessionId } = req.params;
  const { message = '' } = req.body || {};
  const session = ensureSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  const risk = detectRisk(message);
  const reply = guidedReply(message);
  analytics.messages += 1;
  if (risk.level === 'high') {
    analytics.escalations += 1;
    broadcast(sessionId, 'escalation', { hotlineDirectory, message: 'High risk detected. Showing escalation options.' });
  }
  broadcast(sessionId, 'bot_message', { reply, risk });
  res.json({ reply, risk });
});

app.post('/api/checkin/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { answers = [], type = 'GAD-7' } = req.body || {};
  const session = ensureSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  const score = answers.reduce((sum, val) => sum + Number(val || 0), 0);
  const level = score >= 15 ? 'high' : score >= 10 ? 'moderate' : 'low';
  const guidance =
    level === 'high'
      ? 'Your score suggests you may be experiencing significant distress. Please consider speaking with a counselor.'
      : level === 'moderate'
      ? 'Your score suggests moderate symptoms. Let’s practice coping skills and monitor how you feel.'
      : 'Your score suggests mild symptoms. Keep checking in and practicing healthy habits.';
  res.json({ sessionId, type, score, level, guidance });
});

app.post('/api/escalate/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = ensureSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  analytics.escalations += 1;
  broadcast(sessionId, 'escalation', { hotlineDirectory, message: 'Escalation requested by user.' });
  res.json({ ok: true, hotlineDirectory });
});

app.get('/api/resources', (req, res) => {
  const { q = '' } = req.query;
  const term = String(q).toLowerCase();
  const matches = resourceLibrary.filter(
    (item) => item.title.toLowerCase().includes(term) || item.tags.some((tag) => tag.includes(term)),
  );
  res.json({ resources: matches, total: matches.length });
});

app.post('/api/games/:sessionId/played', (req, res) => {
  const { sessionId } = req.params;
  const session = ensureSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  analytics.gamesPlayed += 1;
  res.json({ ok: true, gamesPlayed: analytics.gamesPlayed });
});

app.get('/api/analytics/summary', (_req, res) => {
  res.json(analytics);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
