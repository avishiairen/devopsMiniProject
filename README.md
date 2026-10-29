# ShipShape — Project Delivery & Release Readiness Platform

A full-stack MERN application for managing projects, tasks, and releases.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017 (or via Docker — see below)

### 1. Start the Backend
```powershell
cd backend
npm install
npm start
```
Backend runs at: http://localhost:5000  
Health check: http://localhost:5000/api/health

### 2. Start the Frontend (in a second terminal)
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Start MongoDB with Docker (if not installed locally)
```powershell
docker run -d --name shipshape-mongo -p 27017:27017 mongo:7
```

---

## Project Structure
```
shipshape/
├── backend/
│   ├── models/       # Mongoose schemas (Project, Task, Release)
│   ├── routes/       # Express route handlers (CRUD + dashboard)
│   ├── server.js     # Express app entry point
│   ├── seed.js       # Demo data seeder (runs once automatically)
│   └── .env          # Configuration (copy from .env.example)
├── frontend/
│   └── src/
│       ├── App.jsx       # Root component + routing
│       ├── Dashboard.jsx # Dashboard page
│       ├── Projects.jsx  # Projects CRUD
│       ├── Tasks.jsx     # Tasks CRUD with filters
│       ├── Releases.jsx  # Releases with live readiness
│       ├── Sidebar.jsx   # Navigation sidebar
│       ├── api.js        # Centralised API calls
│       ├── utils.jsx     # Shared helpers + toast
│       └── index.css     # Design system (dark navy/violet)
└── README.md
```

## API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/health | Health check |
| GET | /api/dashboard | Aggregated stats + readiness |
| GET/POST | /api/projects | List / create projects |
| GET/PUT/DELETE | /api/projects/:id | Single project ops |
| GET/POST | /api/tasks | List (with filters) / create tasks |
| GET/PUT/DELETE | /api/tasks/:id | Single task ops |
| GET/POST | /api/releases | List / create releases |
| GET/PUT/DELETE | /api/releases/:id | Single release ops |

## Release Readiness Rule
A release is **Ready** when 100% of tasks in the associated project are **Completed**.  
If any task is *To Do* or *In Progress*, the release is **Blocked**.  
This is calculated live from real database records — nothing is hardcoded.
