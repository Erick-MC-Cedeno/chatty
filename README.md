# chatty
Chatty is a real-time chat application built with **NestJS** and **React**. It allows users to send and receive messages instantly, providing a smooth and interactive communication experience.

---

## 🧰 Technologies
- **NestJS** — Backend framework for Node.js. (https://nestjs.com/)
- **React** — UI library for building interfaces. (https://reactjs.org/)
- **Socket.IO** — Real-time communication (WebSockets). (https://socket.io/)
- **MongoDB** — Document-oriented NoSQL database. (https://www.mongodb.com/)
- **Material UI (MUI)** — Ready-to-use React components. (https://mui.com/)

> These technologies help build a scalable application with real-time capabilities and a modern UI.

---

## 🔧 Prerequisites
- Node.js (recommended: **>= 16**). https://nodejs.org/
- pnpm (recommended): `npm i -g pnpm` https://pnpm.io/
- MongoDB running locally or available in the cloud. https://www.mongodb.com/
- Redis running locally (used for sessions and queues). https://redis.io/

---

## 🚀 Installation & Running
Follow these steps using two terminals (one for backend and one for frontend).

### Backend (`app-core`)
1. Enter the directory:

```bash
cd app-core
```

2. Create a `.env` file with required variables (example):

```env
PORT=4000
DB_URI=mongodb://localhost:27017/chatty
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
TOKEN_SECRET=changeme
EXPIRE_IN=86400000
RATE_LIMIT_TTL=60
RATE_LIMIT=10
EMAIL_USER=you@example.com
EMAIL_PASS=yourpassword
```

3. Install dependencies and run in development mode:

```bash
pnpm install
pnpm run start:dev
```

The backend listens by default on `http://localhost:4000` and exposes the API under `/secure/api`.

### Frontend (`frontend`)
1. Enter the directory:

```bash
cd frontend
```

2. Install dependencies and run:

```bash
pnpm install
pnpm start
```

The React app runs by default at `http://localhost:3000`.

> If the backend runs on a different URL, update `frontend/src/api/http.js` and change `baseApi` to the correct address.

---

## 📝 Notes
- Make sure MongoDB and Redis are running before starting the backend.
- For production, build the backend (`pnpm run build`) and run `pnpm run start:prod` or follow standard deployment best practices.

---

If you'd like, I can add a `.env.example` file and scripts to start both services with a single command. ✅

