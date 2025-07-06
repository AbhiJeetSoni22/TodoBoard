# 🧠 Collaborative To-Do Board – Backend

This is the **backend** for a real-time collaborative to-do board application, built using **Node.js**, **Express.js**, **MongoDB**, and **Socket.IO**. It supports user authentication, task management with validation, real-time updates, action logging, conflict resolution, and smart task assignment.

---

## 🚀 Tech Stack

- **Node.js** – Runtime environment (ES Modules used)
- **Express.js** – Web framework for RESTful APIs
- **MongoDB** – NoSQL database using Mongoose
- **Socket.IO** – Real-time, bidirectional communication
- **JWT** – Secure user authentication
- **bcryptjs** – Password hashing
- **CORS** – Cross-origin support for frontend integration
- **dotenv** – Environment variable management

---

## ⚙️ Setup and Installation

### 1. Clone the Repository
 ```bash
 git clone <your-repo-url>
 cd todo-board-backend
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Set Up Environment Variables
Create a .env file in the root directory with the following content:

```bash
MONGO_URI=mongodb://localhost:27017/todo_board
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
### 4. Start MongoDB
Ensure MongoDB is running locally or connect to MongoDB Atlas if you're using the cloud.

### 5. Run the Server

```bash
node index.js
```

---

## 📝 Features

- **User Authentication** (Register/Login with JWT)
- **Task CRUD** (Create, Read, Update, Delete)
- **Real-time Collaboration** via Socket.IO
- **Action Logging** for all major actions
- **Smart Assign**:  
  Automatically assigns a task to the user with the fewest active tasks (in "Todo" or "In Progress"). This helps balance workload across users. When you click the "Smart Assign" button, the backend calculates which user currently has the least number of active tasks and assigns the task to them. The assignment is logged in the activity log and broadcast in real-time to all connected clients.

 - Example:
 - Users: Abhijeet (2 tasks), user1 (1 task), Rohit (0 tasks).
 - Clicking Smart Assign on "Plan -Meeting" assigns it to Rohit (0 tasks).
 - The Activity Log shows: "Abhijeet smart-assigned: Smart-assigned task: Plan Meeting to Rohit".


- **Conflict Handling**:  
  If two users try to update the same task at the same time, the backend checks the `lastModified` timestamp. If a conflict is detected (i.e., the task was updated by someone else after you loaded it), the server responds with a 409 Conflict and provides both the current and client versions. The frontend then prompts the user to resolve the conflict, ensuring no accidental overwrites.
   
  -Example:
  -User1 edits "Plan Meeting" (changes description) at time T1.
  -User2 edits the same task (changes priority) at T2, where T2 > T1.
 - User1’s update triggers a conflict. The modal shows both versions, and -User1 merges the changes (keeps their description, accepts User2’s priority).
 - The task is updated, and all clients see the resolved version.

---

## 📦 API Endpoints

- `/api/users` – User registration and login
- `/api/tasks` – Task management (CRUD, smart assign)
- `/api/actions` – Action log retrieval

---

## 📡 Real-Time Events

- `taskUpdate` – Emitted when a task is created, updated, assigned, or smart assigned
- `taskDelete` – Emitted when a task is deleted
- `actionUpdate` – Emitted when an action is logged (including smart assign and conflict resolution)

---

## 🛠️ Project Structure

```
backend/
  ├── controllers/
  ├── middleware/
  ├── models/
  ├── routes/
  ├── index.js
  ├── .env
  └── README.md
```

---

## 🧩 Notes

- Make sure to use the matching frontend for full real-time and collaborative features.
- Smart assign and conflict handling are designed to make team collaboration seamless and fair.