import test from 'node:test';
import assert from 'node:assert/strict';
import { aiStatus, handleChat } from '../server/ai.js';

test('reports AI as unconfigured when no server secret or model exists', () => {
  const key = process.env.AI_API_KEY; const model = process.env.AI_MODEL;
  delete process.env.AI_API_KEY; delete process.env.AI_MODEL;
  assert.deepEqual(aiStatus(), { configured: false, model: null });
  if (key !== undefined) process.env.AI_API_KEY = key;
  if (model !== undefined) process.env.AI_MODEL = model;
});

test('rejects unsupported methods without contacting the provider', async () => {
  const result = await handleChat({ method: 'GET', headers: {}, socket: {} });
  assert.equal(result.status, 405);
});

test('requires explicit data sharing consent for AI requests', async () => {
  const oldKey = process.env.AI_API_KEY; const oldModel = process.env.AI_MODEL;
  process.env.AI_API_KEY = 'test-only'; process.env.AI_MODEL = 'test-model';
  const result = await handleChat({
    method: 'POST', headers: { 'x-forwarded-for': 'consent-test' }, socket: {},
    body: { question: 'Explain this workbook', context: {}, consent: false },
  });
  assert.equal(result.status, 400);
  if (oldKey === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = oldKey;
  if (oldModel === undefined) delete process.env.AI_MODEL; else process.env.AI_MODEL = oldModel;
});
