const express = require('express');
const axios = require('axios');
const Redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;
const ROOM = process.env.ROOM || "room2"; // Updated to room2
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const client = Redis.createClient({ url: `redis://${REDIS_HOST}:6379` });

app.use(express.json());

client.connect().catch(console.error);

app.post('/message', async (req, res) => {
  const { message } = req.body;
  await client.rPush(`messages:${ROOM}`, message);
  console.log(`[${ROOM}] Received: ${message}`);
  res.send(`[${ROOM}] Message stored`);
});

app.get('/messages', async (req, res) => {
  const messages = await client.lRange(`messages:${ROOM}`, 0, -1);
  res.json(messages);
});

app.listen(port, () => {
  console.log(`[${ROOM}] listening on port ${port}`);
});

