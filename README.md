
# Bug Tracker — Frontend

Working demo Link : https://bug-tracker-frontend-9r8n.onrender.com

React frontend for my Spring Boot Bug Tracker. Built with Vite, Tailwind CSS, and `@dnd-kit` for the Kanban board.

**Backend Repository:** [Bug_Tracker_Backend](https://github.com/anudeepreddyt/Bug_Tracker_Backend)

---

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** (with Light & Dark mode)
- **React Router v6**
- **Axios** (centralized instance with JWT interceptor)
- **@dnd-kit** (drag-and-drop Kanban board)
- **Lucide Icons**

---

## Features

- **Authentication:** Sign up, log in, persistent JWT session, auto-logout on token expiry, and backend-synced sign out.
- **Dashboard:** Live counts for projects, total issues, To Do, In Progress, Completed, and High Priority bugs, plus a recent issues list.
- **Projects & Members:** Create or delete projects, load existing projects by ID or name, and manage project members (`Manager` / `Developer`).
- **Kanban Board:** Project-based 3-column board (`TODO`, `IN_PROGRESS`, `COMPLETED`) with drag-and-drop that updates the backend immediately and rolls back if the request fails.
- **Issues & Comments:** Search and filter issues by project, status, priority, or unassigned state. Inspect issue details, edit fields, and add/edit/delete comments.
- **Account Settings:** View user profile (including User ID), update username/email, change password, or delete account.

---

## Running Locally

### Prerequisites
- Node.js 18+
- The Spring Boot backend running on `http://localhost:8080`

### Setup

1. Clone the repo:
   ```bash
   git clone [https://github.com/anudeepreddyt/Bug_Tracker_Frontend.git](https://github.com/anudeepreddyt/Bug_Tracker_Frontend.git)
   cd Bug_Tracker_Frontend
