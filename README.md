# Task Manager API

A RESTful API built with Node.js, Express, and TypeScript for managing tasks and users. It supports creating, updating, deleting, and filtering tasks—suitable for to-do apps, dashboards, or backend practice projects.

---

## 🚀 Features

* **CRUD Operations:** Full Create, Read, Update, and Delete capabilities for tasks.
* **User Authentication:** User registration, login, and secure session management using JWT (if implemented).
* **Validation:** Robust request validation for reliable data integrity. 
* **Error Handling:** Custom middleware for graceful error handling.
* **Configuration:** Environment-based configuration for easy setup in different environments (development/production).
* **Deployment Ready:** Pre-configured for production build and deployment (e.g., to platforms like Render).

--- 

## 🛠️ Tech Stack

| Technology |
|------------|
| Node.js    |
| Express    |
| Typescript |
| MongoDB    |

--- 

## 📦 Installation & Setup

1. **Clone the Repository**
```bash
   git clone https://github.com/EmreBaykusak/task-manager-api.git
   cd task-manager-api
```
2. **Install Dependencies**
```bash
   npm install
```
3. **Create a .env file**
```
PORT=3030
CONNECTION_STRING=your_database_connection_string
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
```
4. **Run in development**
```bash
   npm run dev
```

---

## 📖 API Endpoints

### 👤 User Routes

| Method | Endpoint         | Description                              |
|--------|------------------|------------------------------------------|
| POST   | /users           | Register a new user                      |
| POST   | /users/login     | Login user & get auth token              |
| POST   | /users/logout    | Logout from current session              |
| POST   | /users/logoutAll | Logout from all sessions                 |
| GET    | /users/me        | Get authenticated user profile           |
| PATCH  | /users/me        | Update user (name, email, age, password) |
| DELETE | /users/me        | Delete authenticated user                |
| POST   | /users/me/avatar | Upload avatar image                      |
| DELETE | /users/me/avatar | Delete avatar image                      |
| GET    | /users/me/avatar | Get authenticated user's avatar          |

---


### 📝 Task Routes

| Method | Endpoint   | Description                                             |
|--------|------------|---------------------------------------------------------|
| POST   | /tasks     | Create a new task                                       |
| GET    | /tasks     | Get all tasks (supports filtering, pagination, sorting) |
| GET    | /tasks/:id | Get a single task by ID                                 |
| PATCH  | /tasks/:id | Update task (description or completed)                  |
| DELETE | /tasks/:id | Delete task by ID                                       |

---


### 🔐 Authorization Header

All protected routes require a JWT:

---

### ✅ Usage Example

Example using `curl`:

```bash

curl -X POST http://localhost:3030/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "emreb",
    "email": "emre@example.com",
    "password": "123456"
  }'


curl -X POST http://localhost:3030/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Finish project", "completed": false}'
```


