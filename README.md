# docker-chat-network

# 🐳 Docker Chat Network

A fun and educational CLI-based chat system using Docker, Node.js, Redis, and NGINX load balancing — each container acts like a chatroom! Practice service discovery, internal networking, stateful containers, and load balancing all in one project.

---

## 📦 Features

- Two **chat rooms** (Node.js servers)
- Central **Redis** database for message storage
- **Nginx** as a load balancer for routing messages
- A **client** container to send chat messages via CLI
- Messages stored in Redis per room (`messages:room1`, `messages:room2`)

---

## 🧱 Project Structure

docker-chat-network/
│
├── docker-compose.yml
│
├── chatroom1/
│ ├── Dockerfile
│ └── server.js
│
├── chatroom2/
│ ├── Dockerfile
│ └── server.js
│
├── redis-client/
│ ├── Dockerfile
│ ├── package.json
│ └── client.js
│
└── nginx/
├── Dockerfile
└── default.conf


We'll use:

Node.js for chat servers (lightweight, good socket/HTTP support).
Redis to store chats (fast, simple key-value).
nginx as load balancer.
Docker Compose to manage it all.
---

📁 Step 1: Create Directory Structure
Open your terminal and run:

mkdir docker-chat-network
cd docker-chat-network

mkdir chatroom1 chatroom2 nginx redis-client
touch docker-compose.yml
---

🧩 Inside chatroom1
Run:

cd chatroom1
npm init -y
npm install express axios redis
touch server.js Dockerfile
---

✍️ Add server.js
// server.js
const express = require('express');
const axios = require('axios');
const Redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;
const ROOM = process.env.ROOM || "room1";
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

---

🐳 Dockerfile for chatroom
# chatroom1/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]

---
📦 Step 4: Redis Client Setup (redis-client)

cd redis-client
touch client.js Dockerfile package.json
npm init -y
npm install axios readline-sync

---

✍️ client.js
const axios = require('axios');
const readline = require('readline-sync');

const targets = ['http://nginx']; // nginx load balances to rooms

async function main() {
  while (true) {
    const message = readline.question("Enter message: ");
    await axios.post(`${targets[0]}/message`, { message });
    console.log("Message sent!\n");
  }
}

main();

---

🌐 Step 5: NGINX as Load Balancer

🔧 nginx/default.conf
upstream chatrooms {
    server chatroom1:3000;
    server chatroom2:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://chatrooms;
    }
}

---

🐳 nginx/Dockerfile
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf

---

📋 Step 6: docker-compose.yml

version: "3.9"

services:
  redis:
    image: redis
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - chatroom1
      - chatroom2

  chatroom1:
    build:
      context: ./chatroom1
    environment:
      - ROOM=room1
      - REDIS_HOST=redis
    depends_on:
      - redis

  chatroom2:
    build:
      context: ./chatroom2
    environment:
      - ROOM=room2
      - REDIS_HOST=redis
    depends_on:
      - redis

  client:
    build:
      context: ./client
    stdin_open: true
    tty: true

---

🚀 Step 7: Run Everything

From root (docker-chat-network/), run:

docker-compose up --build

---

✅ Step 3: Add More Features (Optional for Fun)

You can now enhance the chat system:

🎨 Cool Ideas:
Add chatroom names (/room city, /room friends)
Include timestamps
Use WebSockets (e.g. Socket.IO) for real-time messaging
Add a frontend: simple HTML page with JS to send/receive messages
Persist chat to MongoDB (for history)


---

docker exec -it docker-chat-network-client-1 node client.js

<img width="524" alt="Screenshot 2025-06-27 at 1 59 58 AM" src="https://github.com/user-attachments/assets/a80f3b20-6b61-4571-b999-36fae69effcf" />

---

docker exec -it redis redis-cli


<img width="524" alt="Screenshot 2025-06-27 at 2 01 48 AM" src="https://github.com/user-attachments/assets/a91e9d00-4f38-4fed-b6a6-c4716caffcf7" />


---

docker logs -f docker-chat-network-chatroom1-1
docker logs -f docker-chat-network-chatroom2-1


<img width="564" alt="Screenshot 2025-06-27 at 2 02 48 AM" src="https://github.com/user-attachments/assets/3270cfd8-8d84-47c3-81a9-d2412088bee0" />

---

🤖 Author

Syed Owais Ahmed
GitHub: @devopsbyowais

---

👍🏻THE END >>































