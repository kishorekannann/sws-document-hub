# SWS AI Document Hub — Full Project Documentation


> Read this entire file before generating any code. Follow every instruction exactly.

---

## 1. Project Overview

Build a **Document Management Dashboard** called **SWS AI Document Hub**.

This is a full-stack web application where users can:
- Upload PDF documents (single or bulk)
- Track upload progress per file in real time
- Receive real-time notifications when background processing completes
- View and manage a persistent notification center

**This is a prototype. No user authentication is required.**

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Fast setup, component-based |
| Styling | Tailwind CSS | Easy white/blue theme matching |
| Backend | Node.js + Express | Simple, JS throughout |
| Real-time | Socket.io (server + client) | WebSocket notifications |
| File Upload | Multer (Express middleware) | Handles multipart/form-data |
| Database | SQLite via `better-sqlite3` | Zero config, persists to disk |
| HTTP Client | Axios | Upload progress tracking |

### Font
Use **Livvic** from Google Fonts throughout the UI.
```html
<link href="https://fonts.googleapis.com/css2?family=Livvic:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Color Theme
- Primary Blue: `#2563EB`
- Light Blue Accent: `#EFF6FF`
- White Background: `#FFFFFF`
- Light Gray Background: `#F8FAFC`
- Border Color: `#E2E8F0`
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`
- Success Green: `#16A34A`
- Error Red: `#DC2626`

---

## 3. Folder Structure

```
sws-document-hub/
├── client/                         ← React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          ← App header with notification bell
│   │   │   ├── DropZone.jsx        ← Drag and drop file upload area
│   │   │   ├── FileProgressItem.jsx← Per-file progress bar component
│   │   │   ├── DocumentTable.jsx   ← Uploaded documents list/table
│   │   │   ├── NotificationDropdown.jsx ← Notification panel dropdown
│   │   │   └── ToastBanner.jsx     ← Bulk upload toast/banner
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx      ← Main upload page (tab 1)
│   │   │   └── NotificationsPage.jsx← Notifications page (tab 2)
│   │   ├── hooks/
│   │   │   └── useSocket.js        ← Socket.io connection hook
│   │   ├── api/
│   │   │   └── index.js            ← All axios API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         ← Node.js + Express backend
│   ├── db/
│   │   ├── database.js             ← SQLite connection + table creation
│   │   └── sws.db                  ← Auto-created SQLite database file
│   ├── routes/
│   │   ├── upload.js               ← POST /api/upload
│   │   ├── files.js                ← GET /api/files, GET /api/files/:id/download
│   │   └── notifications.js        ← GET/PATCH /api/notifications
│   ├── uploads/                    ← Stored uploaded files (auto-created)
│   ├── socket.js                   ← Socket.io setup and event emitters
│   ├── index.js                    ← Express server entry point
│   └── package.json
│
└── README.md
```

---

## 4. Database Schema (SQLite)

### Table: `files`
```sql
CREATE TABLE IF NOT EXISTS files (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  size        INTEGER NOT NULL,
  type        TEXT NOT NULL,
  path        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'complete',
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `notifications`
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL CHECK(type IN ('success', 'error', 'info')),
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Backend — Full Specification

### Entry Point: `server/index.js`
- Create Express app
- Mount CORS middleware (allow all origins in dev)
- Mount JSON body parser
- Serve static files from `uploads/` at `/uploads`
- Mount routes: `/api/upload`, `/api/files`, `/api/notifications`
- Create HTTP server from Express app
- Attach Socket.io to HTTP server
- Call `initDB()` from `db/database.js` before starting
- Listen on port `5000`

### `server/db/database.js`
- Import `better-sqlite3`
- Export `db` as the connected database instance
- Export `initDB()` function that runs CREATE TABLE IF NOT EXISTS for both tables above
- DB file path: `./db/sws.db`

### `server/socket.js`
- Import `socket.io` Server
- Export `initSocket(httpServer)` — attaches socket.io to the server
- Export `emitNotification(notification)` — emits event `'new_notification'` to all connected clients
- Socket.io should allow CORS from `http://localhost:5173`

### Route: `POST /api/upload`
- Use `multer` with `diskStorage`
- `destination`: `./uploads/`
- `filename`: keep original name with timestamp prefix to avoid conflicts e.g. `Date.now() + '-' + originalname`
- `limits`: 20MB per file
- Accept field name `files`, allow multiple files (`upload.array('files', 50)`)
- For each uploaded file:
  - Insert a record into `files` table
  - Return the inserted row id
- After ALL files are saved:
  - Insert ONE notification into `notifications` table:
    - If count > 3: `message = "X files uploaded successfully (bulk)"`, `type = "success"`
    - If count <= 3: `message = "X file(s) uploaded successfully"`, `type = "success"`
  - Call `emitNotification(notification)` with the new notification object
- Respond with `{ files: [...insertedFiles], notification: {...} }`

### Route: `GET /api/files`
- Query all rows from `files` table ORDER BY `uploaded_at DESC`
- Return `{ files: [...] }`

### Route: `GET /api/files/:id/download`
- Fetch file record from DB by id
- Use `res.download(absolutePath, originalName)` to trigger browser download

### Route: `GET /api/notifications`
- Query all rows from `notifications` ORDER BY `created_at DESC`
- Return `{ notifications: [...] }`

### Route: `PATCH /api/notifications/:id/read`
- Update `is_read = 1` for the given notification id
- Return `{ success: true }`

### Route: `PATCH /api/notifications/read-all`
- Update `is_read = 1` for ALL notifications
- Return `{ success: true }`

---

## 6. Frontend — Full Specification

### `client/src/api/index.js`
Export these functions using axios:
```javascript
uploadFiles(files, onProgress)   // POST /api/upload with FormData, calls onProgress(percent) per file
fetchFiles()                      // GET /api/files
downloadFile(id, name)            // GET /api/files/:id/download
fetchNotifications()              // GET /api/notifications
markRead(id)                      // PATCH /api/notifications/:id/read
markAllRead()                     // PATCH /api/notifications/read-all
```

For `uploadFiles`, use axios with `onUploadProgress` to calculate per-file percentage. Since multer receives all files together, simulate per-file progress using the overall progress event divided by file count.

### `client/src/hooks/useSocket.js`
- Connect to `http://localhost:5000` using `socket.io-client`
- Listen on `'new_notification'` event
- Accept a callback `onNotification(notification)` 
- Return `{ socket, connected }`
- Disconnect on component unmount

### `client/src/App.jsx`
- Two tabs in header: **Document Upload** and **AI Assistant** (AI Assistant tab is just a placeholder — show "Coming Soon")
- Active tab has blue underline, font Livvic
- Header has app title "SWS AI Document Hub" with a blue document icon and a "LIVE DEMO" badge
- Header has a notification bell icon on the right with an unread count badge (red circle)
- State: `notifications` array (fetched from backend + updated via socket)
- State: `unreadCount` derived from notifications where `is_read === 0`
- On mount: fetch notifications from API, set up socket listener

### `client/src/pages/UploadPage.jsx`

#### Info Banner
Blue info banner at top:
```
ℹ Simulated demo — files are processed client-side only, nothing is stored.
Upload 1–3 files to see individual per-file progress bars.
Upload 4 or more files to trigger the bulk notification flow.
```

#### DropZone Area
- Dashed border box with upload icon, text "Drop files here or click to browse"
- Subtext: "Any file type · Up to 20 MB per file"
- Three pill/badge labels: "Single file", "Bulk upload", "Try 4+ files to trigger notifications"
- Click to open native file picker (accept PDF, but allow any file)
- Drag and drop supported
- On file selection: immediately start upload and show progress

#### Upload Logic
```
if selectedFiles.length > 3:
  show ToastBanner: "Upload in progress — processing X files in background."
  show CollapsibleProgressSection (minimized by default, expandable)
else:
  show inline FileProgressItem for each file
```

#### FileProgressItem Component
For each file show:
- File icon + filename
- File size (formatted: KB or MB)
- File type badge
- Status badge: pending / uploading / complete / failed
- Progress bar (blue fill, animated) showing percentage
- Percentage text

#### After Upload Completes
- Files appear in the **Document Library** table below the dropzone
- Table columns: Name, Size, Type, Upload Date, Status, Download button
- Download button triggers file download via API

#### Bulk Notification (Socket.io)
When the socket emits `'new_notification'`:
- Show a toast/banner: "✅ X files uploaded successfully — [timestamp]"
- This must work even if the user has switched to the Notifications tab
- Add the notification to the global notifications state

### `client/src/pages/NotificationsPage.jsx`
- List all notifications fetched from backend
- Each notification shows: icon (✅/❌/ℹ), message, timestamp, read/unread indicator
- "Mark as read" button per notification
- "Mark all as read" button at the top
- Unread notifications have a light blue background
- Read notifications have white background
- Timestamps formatted as: "May 7, 2026 at 3:45 PM"

### `client/src/components/NotificationDropdown.jsx`
- Triggered by clicking the bell icon in the header
- Shows last 5 notifications
- "Mark all as read" button
- Link to "View all notifications" → switches to Notifications tab
- Unread count badge on bell icon (red, disappears when count is 0)

---

## 7. Real-Time Notification Flow

```
User selects 4+ files
       ↓
Frontend shows ToastBanner "Upload in progress..."
       ↓
Frontend sends POST /api/upload with all files
       ↓
Multer saves files to disk → inserts into `files` table
       ↓
Server inserts notification into `notifications` table
       ↓
Server calls emitNotification() via Socket.io
       ↓
All connected clients receive 'new_notification' event
       ↓
Frontend updates notification state + shows success toast
Bell icon badge count increases
```

---

## 8. UI Component Details

### Header
```
[📄 SWS AI Document Hub] [LIVE DEMO badge]          [🔔 badge]
────────────────────────────────────────────────────────────
[📤 Document Upload]  [🤖 AI Assistant]
                 ^underline on active tab
```

### File Progress Item (during upload)
```
[📄 icon] filename.pdf                    [uploading badge]
          2.4 MB · application/pdf
          [████████░░░░░░░░░░░░] 45%
```

### Document Library Table
```
| Name           | Size   | Type | Uploaded At      | Status   | Action     |
|----------------|--------|------|------------------|----------|------------|
| report.pdf     | 2.4 MB | PDF  | May 7, 2026      | ✅ Done  | ⬇ Download |
```

### Notification Item
```
[✅] 4 files uploaded successfully (bulk)
     May 7, 2026 at 3:45 PM                    [Mark as read]
```
Unread → light blue background `#EFF6FF`
Read → white background

---

## 9. Package Dependencies

### Server `package.json`
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "better-sqlite3": "^9.4.3",
    "socket.io": "^4.7.4",
    "uuid": "^9.0.0"
  }
}
```

### Client `package.json`
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.7",
    "socket.io-client": "^4.7.4",
    "react-dropzone": "^14.2.3"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

---

## 10. Vite Config (client/vite.config.js)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000'
    }
  }
})
```

---

## 11. Tailwind Config (client/tailwind.config.js)

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        livvic: ['Livvic', 'sans-serif']
      },
      colors: {
        primary: '#2563EB',
        'primary-light': '#EFF6FF',
      }
    }
  },
  plugins: []
}
```

---

## 12. Git Commit Plan

Make a commit every 15 minutes. Commit messages must follow this plan:

| Time | What to build | Commit message |
|---|---|---|
| 0–15 min | Init both projects, install deps, folder structure | `feat: project scaffold with client and server` |
| 15–30 min | SQLite DB setup, Express server, upload route with multer | `feat: upload API with multer and SQLite storage` |
| 30–45 min | React upload page, dropzone, per-file progress bars | `feat: upload UI with per-file progress bars` |
| 45–60 min | Socket.io setup, bulk notification logic, toast banner | `feat: bulk upload notification via socket.io` |
| 60–75 min | Notification center page, header bell icon, badge count | `feat: notification center with unread badge` |
| 75–90 min | Mark as read, mark all read, document download, UI polish | `feat: read status, download, and UI polish` |

---

## 13. Key Rules for AI Code Generation

1. **Never use localStorage** — all state that needs to persist across refreshes must come from the backend API
2. **Socket.io notifications must work across tab switches** — store socket listener at App.jsx level, not inside a page component
3. **Per-file progress bars are required** — do not use a single combined progress bar
4. **Bulk threshold is > 3 files** — 4 or more files triggers the bulk flow
5. **All notifications are stored in SQLite** — fetched via GET /api/notifications on every page load
6. **CORS must be enabled** on the Express server for `http://localhost:5173`
7. **File downloads** must use the backend route, not a direct link to the upload folder
8. **Font is Livvic** — import from Google Fonts in `index.html`
9. **Color theme is white and blue** — match `#2563EB` as primary blue throughout
10. **Do not build the AI Assistant tab** — just show a "Coming Soon" placeholder

---

## 14. How to Run

### Start the backend
```bash
cd server
npm install
node index.js
# Server running at http://localhost:5000
```

### Start the frontend
```bash
cd client
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 15. Feature Checklist

- [ ] Drag and drop file upload zone
- [ ] Click to browse file upload
- [ ] Per-file progress bar (individual, not combined)
- [ ] File size, type, status shown per file
- [ ] Files saved to disk and recorded in SQLite
- [ ] Document library table with name, size, type, date, download
- [ ] Bulk toast banner when > 3 files uploaded
- [ ] Real-time Socket.io notification on upload complete
- [ ] Notification persists across page refresh (fetched from DB)
- [ ] Notification bell icon with unread count badge
- [ ] Notification dropdown with last 5 notifications
- [ ] Full notifications page
- [ ] Mark individual notification as read
- [ ] Mark all notifications as read
- [ ] Two tabs: Document Upload and AI Assistant (placeholder)
- [ ] Livvic font applied globally
- [ ] White and blue color theme throughout