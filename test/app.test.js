import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

// Start server before running tests
test.before(async () => {
  process.env.NODE_ENV = 'test';
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

// Close server after all tests finish
test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health returns 200 and valid health payload', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.status, 'UP');
  assert.equal(data.environment, 'test');
  assert.ok(typeof data.uptimeSeconds === 'number');
  assert.ok(data.system.nodeVersion);
  assert.ok(data.processMemory.heapUsedMB >= 0);
});

test('GET /api/info returns application and runtime metadata', async () => {
  const res = await fetch(`${baseUrl}/api/info`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.ok(data.app.name);
  assert.equal(data.app.version, '1.0.0');
  assert.ok(data.runtime.node);
  assert.ok(data.runtime.arch);
});

test('GET /api/items returns items list', async () => {
  const res = await fetch(`${baseUrl}/api/items`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.ok(Array.isArray(data.items));
  assert.ok(data.count >= 1);
});

test('POST /api/items creates a new learning item', async () => {
  const newItem = {
    title: 'Automated test task',
    category: 'Testing'
  };

  const res = await fetch(`${baseUrl}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItem)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.message, 'Item created successfully');
  assert.equal(data.item.title, newItem.title);
  assert.equal(data.item.category, newItem.category);
  assert.ok(data.item.id);
});

test('POST /api/items fails validation when title is empty', async () => {
  const res = await fetch(`${baseUrl}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Validation failed');
});

test('DELETE /api/items/:id removes the item', async () => {
  // First create an item to delete
  const createRes = await fetch(`${baseUrl}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Item to delete', category: 'Testing' })
  });
  const created = await createRes.json();
  const idToDelete = created.item.id;

  // Now delete it
  const delRes = await fetch(`${baseUrl}/api/items/${idToDelete}`, {
    method: 'DELETE'
  });
  assert.equal(delRes.status, 200);

  // Deleting again should return 404
  const secondDelRes = await fetch(`${baseUrl}/api/items/${idToDelete}`, {
    method: 'DELETE'
  });
  assert.equal(secondDelRes.status, 404);
});

test('GET /api/unknown-route returns 404 with helpful json message', async () => {
  const res = await fetch(`${baseUrl}/api/unknown-route`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.error, 'Endpoint not found');
  assert.ok(Array.isArray(data.availableEndpoints));
});
