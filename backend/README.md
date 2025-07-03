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

```bash
MONGO_URI=mongodb://localhost:27017/todo_board
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
### 5. Run the Server

```bash
node index.js
```