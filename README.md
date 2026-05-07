# SWS AI Document Hub

SWS AI Document Hub is a full-stack document management dashboard prototype. It features a modern, responsive React interface and an Express backend, complete with real-time WebSocket notifications for bulk uploads.

## Features

- **File Upload:** Upload single or multiple files via drag-and-drop or file picker (up to 20MB per file).
- **Per-file Progress:** Real-time upload progress tracking for individual files.
- **Document Library:** View all uploaded documents with size, type, upload date, and download links.
- **Real-Time Notifications:** Uses Socket.io to push a success notification and a toast banner when bulk uploads (4+ files) complete.
- **Notification Center:** Persistent notification history with read/unread statuses, stored via SQLite.
- **Modern UI:** Built with React, Tailwind CSS v3, and the Livvic Google Font for a clean, product-ready design.

## Tech Stack

**Frontend:**
- React (bootstrapped with Vite)
- Tailwind CSS
- Socket.io Client
- Axios
- React Dropzone

**Backend:**
- Node.js & Express
- Multer (for file handling)
- Better-SQLite3 (for lightweight, zero-config persistent storage)
- Socket.io (for real-time event broadcasting)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- `npm` (Node Package Manager)

## Installation & Setup

Clone the repository and follow the instructions below to start both the backend and frontend servers.

### 1. Start the Backend Server

The backend runs on port `5000` and automatically creates an SQLite database (`sws.db`) and an `uploads/` folder on startup.

```bash
cd server
npm install
node index.js
```
*You should see `Database initialized successfully` and `Server running at http://localhost:5000`.*

### 2. Start the Frontend Application

The frontend runs on port `5173` (or the next available port) and proxies `/api` and `/uploads` requests to the backend.

Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## Project Structure

```
sws-document-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios API calls
│   │   ├── components/     # UI Components (DropZone, Header, etc.)
│   │   ├── hooks/          # Custom hooks (useSocket)
│   │   ├── pages/          # Main Views (UploadPage, NotificationsPage)
│   │   ├── App.jsx         # Root component and state manager
│   │   └── main.jsx        # Entry point
│   └── vite.config.js      # Vite config and API proxy
│
└── server/                 # Node.js backend
    ├── db/                 # SQLite database and setup
    ├── routes/             # Express API routes (upload, files, notifications)
    ├── uploads/            # Automatically stores uploaded files
    ├── socket.js           # Socket.io configuration
    └── index.js            # Express server entry point
```

## API Endpoints

- `POST /api/upload`: Upload files (Multipart Form Data).
- `GET /api/files`: Fetch all uploaded file metadata.
- `GET /api/files/:id/download`: Download a specific file.
- `GET /api/notifications`: Fetch all persistent notifications.
- `PATCH /api/notifications/:id/read`: Mark a single notification as read.
- `PATCH /api/notifications/read-all`: Mark all notifications as read.

## Database Schema

**files:**
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `size` (INTEGER)
- `type` (TEXT)
- `path` (TEXT)
- `status` (TEXT)
- `uploaded_at` (DATETIME)

**notifications:**
- `id` (INTEGER PRIMARY KEY)
- `message` (TEXT)
- `type` (TEXT)
- `is_read` (INTEGER)
- `created_at` (DATETIME)
