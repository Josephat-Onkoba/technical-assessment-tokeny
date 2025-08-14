# TaskFlow - Technical Assessment (Completed)

## Overview
This repository contains a working React/Vite app with a Node/Express backend scaffold. The assessment tasks have been implemented with a focus on client-side behavior using localStorage for easy local testing.

## Stack
- Frontend: React, React Router, TailwindCSS, Vite
- Backend scaffold: Node.js, Express (not required to run the tasks locally)
- State/persistence: React Context API + localStorage
- Tests: Vitest + Testing Library (jsdom)

## What’s done
1) Task 1 – Display Login/Register page before the landing page
- “/” redirects to “/login”. Landing is only reachable after auth.
- When logged out, only the Dashboard tab shows in sidebars; navbar hides Tasks/Profile.

2) Task 2 – Task Filter
- Dedicated page at /user/task-filter with the user sidebar.
- Filter by status (All/Complete/Incomplete) and search by title/description.
- Reads tasks from localStorage and normalizes different task shapes.

3) Task 3 – Admin User Logs
- Admin page at /admin/user-logs shows username, role, login/logout times, token name, and IP.
- Admin can delete individual logs.
- Navbar logout updates the last login entry with logout time if present, or appends a logout record.
- Sidebar remains visible on the logs page (consistent admin layout).

4) Manage Users page improvement
- Loads users from remote API when available.
- Falls back to local demo users stored in localStorage if offline, so the table always shows data.

5) Tests
- Added a single integration test covering Tasks 1–3 with Vitest/Testing Library.

## How to run
1) Install deps and start dev server
```bash
npm install
npm run dev
```
Open the URL shown in the terminal (typically http://localhost:5173).

2) Demo accounts (local only)
- Admin: admin@example.com / password123
- User: user@example.com / password123

## How to test the tasks manually
- Task 1: Visit “/”. You should be redirected to “/login”. After logging in, navbar shows Tasks/Profile and full side menu appears.
- Task 2: User → Task Filter (left sidebar) or go to “/user/task-filter”. Filter by status and search; counts update live.
- Task 3: Admin → User Logs (left sidebar) or “/admin/user-logs”. Observe logs, click delete on a row to remove it.
