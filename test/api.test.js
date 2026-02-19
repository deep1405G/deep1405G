const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('anonymous chat flow', async () => {
  const sessionRes = await request(app).post('/api/chat/session');
  assert.equal(sessionRes.statusCode, 200);
  const sessionId = sessionRes.body.sessionId;
  assert.ok(sessionId);

  const messageRes = await request(app)
    .post(`/api/chat/${sessionId}/message`)
    .send({ message: 'I feel stressed' });
  assert.equal(messageRes.statusCode, 200);
  assert.ok(messageRes.body.reply);
  assert.ok(messageRes.body.risk);

  const checkinRes = await request(app)
    .post(`/api/checkin/${sessionId}`)
    .send({ type: 'GAD-7', answers: [1, 1, 1, 1, 1, 1, 1] });
  assert.equal(checkinRes.statusCode, 200);
  assert.equal(checkinRes.body.type, 'GAD-7');
  assert.ok(typeof checkinRes.body.score === 'number');
});
