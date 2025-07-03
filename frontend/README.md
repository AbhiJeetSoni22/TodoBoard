# 🧠 Collaborative To-Do Board – Frontend

This is the **frontend** for a real-time collaborative to-do board application, built with **React**, **Vite**, **Tailwind CSS**, and **Socket.IO**. It provides a modern Kanban board interface for managing tasks collaboratively, with real-time updates, authentication, and smart assignment features.

---

## 🚀 Tech Stack

- **React** – UI library for building interactive interfaces
- **Vite** – Fast development server and build tool
- **Tailwind CSS** – Utility-first CSS framework
- **Socket.IO Client** – Real-time updates from the backend
- **Axios** – HTTP client for API requests
- **React DnD** – Drag-and-drop for Kanban columns
- **React Router** – Routing and navigation

---

## ⚙️ Setup and Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the `frontend` directory:

```
VITE_API_URL=http://localhost:5000
```

Adjust the URL if your backend runs elsewhere.

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000) by default.

---

## 📝 Features

- **User Authentication** (Register/Login)
- **Kanban Board** with drag-and-drop tasks
- **Real-time Collaboration** via Socket.IO
- **Task CRUD** (Create, Read, Update, Delete)
- **Smart Assignment** to balance workload
- **Conflict Resolution** for concurrent edits
- **Activity Log** for recent actions

---

## 📁 Project Structure

```
frontend/
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── context/
  │   ├── pages/
  │   ├── App.jsx
  │   ├── main.jsx
  │   └── ...
  ├── .env
  ├── index.html
  ├── package.json
  └── vite.config.js
```

---

## 🖥️ Usage

- Register a new account or log in.
- Create, edit, or delete tasks.
- Drag tasks between columns.
- Use "Smart Assign" to auto-assign tasks.
- See real-time updates and activity log.

---

## 📦 Build for Production

```bash
npm run build
```

---

## 🤝 Backend

See the `../backend/README.md` for backend setup and API