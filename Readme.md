

---

````markdown
# Store Ratings App

A full-stack web application for managing stores and ratings with **role-based access** (Admin, Store Owner, Normal User).  
Built with **React + Vite + TailwindCSS** on the frontend and **Express.js + Prisma + NeonDB** on the backend.

---

## 🚀 Tech Stack
- **Frontend:** React.js, Vite, TailwindCSS
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** NeonDB (PostgreSQL)
- **Auth:** JWT-based authentication
- **Tools:** Postman (for API testing)

---

## 📦 Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/store-ratings-app.git
cd store-ratings-app
````

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in `/backend` with:

```env
DATABASE_URL="your-neondb-url"
JWT_SECRET="your-secret-key"
PORT=5000
```

#### Run Database Migrations & Seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

> This seeds the database with default logins (see below).

#### Start Backend

```bash
npm run dev
```

Backend runs on: **[http://localhost:5000](http://localhost:5000)**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in `/frontend` with:

```env
VITE_API_URL="http://localhost:5000"
```

#### Start Frontend

```bash
npm run dev
```

Frontend runs on: **[http://localhost:5173](http://localhost:5173)**

---

## 👤 Seeded Login Credentials

| Role  | Email                                         | Password   |
| ----- | --------------------------------------------- | ---------- |
| Admin | [admin@example.com](mailto:admin@example.com) | Admin\@123 |
| Owner | [owner@example.com](mailto:owner@example.com) | Owner\@123 |
| User  | [user@example.com](mailto:user@example.com)   | User\@1234 |

---

## 🧪 Testing Backend with Postman

### 1. Authentication

**POST** `/api/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "role": "ADMIN",
    "email": "admin@example.com"
  }
}
```

Use this token in **Authorization → Bearer Token** for subsequent requests.

---

### 2. Admin Endpoints

* **Add User**

  * `POST /api/admin/users`
  * Body:

    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "Pass@123",
      "address": "123 Main St",
      "role": "USER"
    }
    ```

* **View All Users**

  * `GET /api/admin/users`

* **View All Stores**

  * `GET /api/admin/stores`

* **Dashboard Stats**

  * `GET /api/admin/dashboard`

---

### 3. Normal User Endpoints

* **Signup**

  * `POST /api/auth/signup`
  * Body:

    ```json
    {
      "name": "New User",
      "email": "newuser@example.com",
      "password": "User@1234",
      "address": "456 Park Lane"
    }
    ```

* **Get All Stores**

  * `GET /api/stores`

* **Submit Rating**

  * `POST /api/ratings`
  * Body:

    ```json
    {
      "storeId": 1,
      "rating": 5
    }
    ```

* **Update Rating**

  * `PUT /api/ratings/1`
  * Body:

    ```json
    {
      "rating": 4
    }
    ```

---

### 4. Store Owner Endpoints

* **Get Store Dashboard**

  * `GET /api/owner/dashboard`
  * Response:

    ```json
    {
      "store": {
        "id": 1,
        "name": "My Store",
        "averageRating": 4.2,
        "ratings": [
          {
            "user": "user@example.com",
            "rating": 5
          }
        ]
      }
    }
    ```

---

## ✅ Form Validations

* **Name:** 20–60 characters
* **Address:** Up to 400 characters
* **Password:** 8–16 characters, must include at least **one uppercase** and **one special character**
* **Email:** Must follow valid format

---

## 📌 Notes

* All tables support **sorting** (Name, Email, Role, etc.).
* All requests requiring authentication must include a **Bearer token**.
* Role-based access ensures different features for Admin, User, and Store Owner.

---

## 🖥️ Development Scripts

### Backend

```bash
npm run dev   # Start dev server
npm run build # Build backend
```

### Frontend

```bash
npm run dev   # Start Vite dev server
npm run build # Production build
```

---

## 🎯 Features Overview

* **Admin:** Manage stores, users, view dashboard stats
* **User:** Signup, login, view stores, submit/update ratings
* **Owner:** View store’s ratings and average rating

---

```

---

```
