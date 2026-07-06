# 🎨 CodeCanvas - Creative Code Gallery

**CodeCanvas** is a full-stack creative playground for developers. Write HTML, CSS, and JavaScript, see instant live previews, and share your creations with the community.

## ✨ Features

- **🎯 Live Code Editor** - Three-panel editor (HTML/CSS/JS) with CodeMirror 6 and instant iframe preview
- **🖼️ Gallery** - Browse community creations with responsive grid, trending section, and tag filtering
- **❤️ Social Interactions** - Like, comment, and fork your favorite pieces
- **🔍 Full-Text Search** - FTS5-powered search to discover amazing works
- **🔔 Real-time Notifications** - WebSocket-powered instant notifications on likes, comments, and forks
- **🌐 i18n Support** - One-click English/Chinese language switching
- **👤 User System** - JWT authentication with personal profile pages

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 |
| **Editor** | CodeMirror 6 (HTML/CSS/JS syntax highlighting) |
| **State** | Zustand |
| **Backend** | Go 1.25 + Gin + gorilla/websocket |
| **Database** | SQLite (modernc.org/sqlite - pure Go, no CGO) |
| **Auth** | JWT + bcrypt |
| **i18n** | react-i18next + i18next-browser-languagedetector |

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+

### 1. Clone and Install

```bash
git clone https://github.com/JasonBuildAI/CodeCanvas.git
cd CodeCanvas

# Install frontend dependencies
cd client && npm install && cd ..

# Install Go dependencies
cd server && go mod tidy && cd ..
```

### 2. Start Backend

```bash
cd server
go run ./cmd/server/main.go
```

### 3. Start Frontend

```bash
cd client
npm run dev
```

### 4. Open

Visit **http://localhost:5173** in your browser.

## 📁 Project Structure

```
codecanvas/
├── server/                     # Go backend
│   ├── cmd/server/main.go      # Entry point
│   └── internal/
│       ├── config/             # Configuration
│       ├── database/           # SQLite connection + migration
│       ├── model/              # Data models + DB operations
│       ├── service/            # Business logic (JWT auth)
│       ├── handler/            # HTTP handlers
│       ├── middleware/         # Auth + CORS middleware
│       ├── websocket/          # WebSocket hub + client
│       └── router/             # Route registration
├── client/                     # React frontend
│   └── src/
│       ├── pages/              # Page components
│       ├── components/         # UI components
│       ├── services/           # API clients
│       ├── stores/             # Zustand stores
│       ├── i18n/               # Internationalization
│       └── types/              # TypeScript types
└── start.ps1                   # One-click startup script
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Code Pieces
- `GET /api/code-pieces` - List (paginated)
- `GET /api/code-pieces/trending` - Trending
- `GET /api/code-pieces/:id` - Get by ID
- `POST /api/code-pieces` - Create
- `PUT /api/code-pieces/:id` - Update
- `DELETE /api/code-pieces/:id` - Delete

### Social
- `POST /api/code-pieces/:id/like` - Like
- `DELETE /api/code-pieces/:id/like` - Unlike
- `POST /api/code-pieces/:id/comments` - Comment
- `POST /api/code-pieces/:id/fork` - Fork

### Search
- `GET /api/search?q=query` - Full-text search

### Notifications
- `GET /api/notifications` - List notifications
- WebSocket `/api/ws?token=xxx` - Real-time notifications

## 📸 Screenshots

![Home](https://via.placeholder.com/800x450?text=CodeCanvas+Home)
![Editor](https://via.placeholder.com/800x450?text=CodeCanvas+Editor)

## 📄 License

MIT
