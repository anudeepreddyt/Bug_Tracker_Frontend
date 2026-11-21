# TrackFlow — React Frontend for Spring Boot Bug Tracker

A complete, responsive SaaS-grade frontend built with **React 18, Vite, Tailwind CSS, React Router, Axios, and dnd-kit**, engineered directly against the API contracts of your existing `com.anudeepreddy.Bug_Tracker` Spring Boot backend.

## Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Spring Boot Bug Tracker Backend** running locally on `http://localhost:8080`
- **PostgreSQL** database (`Bug_Tracker`) active

## Quick Start

1. **Extract the project** and open the `bug-tracker-frontend` folder in VS Code.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Ensure `.env` contains:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
4. **Apply the required Spring Boot CORS configuration** (see `CORS_FIX.md`) so the browser allows requests from `http://localhost:5173`.
5. **Start the development server**:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:5173` in your browser, register a user (lowercase letters only per backend validation), sign in, and start managing projects and issues.

## Production Build
```bash
npm run build
npm run preview
```

## Project Structure
```text
src/
├── api/
│   ├── axios.js              # Centralized Axios instance, JWT Bearer interceptor & error normalizer
│   ├── authApi.js            # /signin, /signup, /getuser, /updatedetails, /updatepassword, /deleteuser
│   ├── projectApi.js         # /createproject, /deleteproject, /getprojectbyid, /getprojectbyname
│   ├── projectMemberApi.js   # /addprojectmem, /deleteprojectmem
│   ├── issueApi.js           # /createissue, /changeissue, /changestatus, /changepriority, /deleteissue, /getprojectissue
│   └── commentApi.js         # /addcomment, /projectcomments, /getallcomments, /editcomment, /deletecomment
├── components/
│   ├── common/               # Badges, Modal, ConfirmDialog, EmptyState, LoadingSpinner
│   ├── issues/               # CreateIssueModal, IssueDetailModal (with comments)
│   ├── kanban/               # KanbanColumn, KanbanCard (@dnd-kit/sortable)
│   ├── layout/               # AppLayout, Sidebar, Topbar
│   ├── projects/             # CreateProjectModal
│   └── routing/              # ProtectedRoute
├── context/
│   ├── AuthContext.jsx       # JWT decoding, expiry timer, login/register/logout
│   ├── ThemeContext.jsx      # Light/Dark theme persistence
│   ├── ToastContext.jsx      # Global notification toasts
│   └── WorkspaceContext.jsx  # Projects, issues, optimistic Kanban updates, known users/members
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProjectsPage.jsx
│   ├── ProjectDetailsPage.jsx
│   ├── KanbanPage.jsx
│   ├── IssuesPage.jsx
│   └── ProfilePage.jsx
└── utils/
    ├── constants.js          # Exact backend Status, Priority, Role, ProjectRole enums
    ├── formatters.js         # Date & avatar initial helpers
    └── jwtUtils.js           # Client-side JWT payload & expiration parser
```
