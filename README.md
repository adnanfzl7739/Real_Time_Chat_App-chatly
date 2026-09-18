# Chatly

A real-time one-to-one chat application built with the MERN stack and Socket.IO. Users connect with each other via a unique connection code, then chat with live typing indicators, online/offline presence, emoji support, and in-chat image sharing.

## Features

- **Connection-code-based chat initiation** — every user gets a unique 8-character connection code; entering someone else's code links your accounts so you can message each other (no public friend lists or open DMs)
- **Real-time messaging** with Socket.IO — instant message delivery, live "typing…" indicators, and online/offline presence updates
- **Secure authentication** — JWT stored in an `httpOnly` cookie, passwords hashed with bcrypt
- **Image sharing** — profile pictures and in-chat images uploaded via Multer and stored on Cloudinary
- **User search** — search within your existing connections by name or username
- **Editable profile** — update display name and profile picture
- **Responsive UI** built with React, Redux Toolkit, and Tailwind CSS, including an emoji picker

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Redux Toolkit, React Router, Tailwind CSS, Vite, Socket.IO client, emoji-picker-react |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookies), bcryptjs |
| Media Storage | Cloudinary (via Multer for uploads) |

## Project Structure

```
Real_Time_Chat_App-chatly/
├── backend/
│   ├── config/          # DB connection, Cloudinary, JWT token generation
│   ├── controllers/     # auth, user, message logic
│   ├── middlewares/     # isAuth (JWT verification), multer (uploads)
│   ├── models/          # User, Conversation, Message schemas
│   ├── routes/          # /api/auth, /api/user, /api/message
│   ├── socket/          # Socket.IO server (presence, typing events)
│   └── index.js
└── frontend/
    └── src/
        ├── components/    # SideBar, MessageArea, Sender/ReceiverMessage
        ├── customHooks/   # getCurrentUser, getMessages, getOtherUsers
        ├── pages/         # Login, SignUp, Home, Profile
        └── redux/         # user & message slices
```

## Prerequisites

- Node.js (v18+ recommended)
- npm
- A MongoDB instance (local or Atlas)
- A Cloudinary account (for image uploads)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/adnanfzl7739/Real_Time_Chat_App-chatly.git
cd Real_Time_Chat_App-chatly
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

The frontend is configured to talk to the backend at `http://localhost:5000` (CORS is set for `http://localhost:5173`) — update the API base URL in the frontend if you change ports.

### 4. Run the app

```bash
# Backend (from backend/)
npm run dev

# Frontend (from frontend/, in a separate terminal)
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend (API + Socket.IO server) at `http://localhost:5000`.

## API Overview

| Route | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Register a new user (generates a unique connection code) |
| `/api/auth/login` | POST | Log in, sets JWT cookie |
| `/api/auth/logout` | GET | Log out, clears JWT cookie |
| `/api/user/current` | GET | Get the authenticated user's profile |
| `/api/user/others` | GET | Get the user's existing connections |
| `/api/user/search` | GET | Search connections by name/username |
| `/api/user/profile` | PUT | Update name / profile image |
| `/api/user/connect` | POST | Connect with another user via their connection code |
| `/api/message/send/:receiver` | POST | Send a message (text and/or image) to a connection |
| `/api/message/get/:receiver` | GET | Get message history with a connection |

All routes except `signup`, `login`, and `logout` require authentication via the JWT cookie.

## Real-Time Events (Socket.IO)

| Event | Direction | Description |
|---|---|---|
| `getOnlineUsers` | Server → Client | Broadcasts the list of currently connected user IDs |
| `typing` | Client ↔ Server | Notifies the receiver that the sender is typing |
| `stopTyping` | Client ↔ Server | Notifies the receiver that typing has stopped |
| `newConnection` | Server → Client | Notifies a user in real time when someone connects with their code |

## License

No license specified yet — add one (e.g. MIT) if you intend this to be open source.
