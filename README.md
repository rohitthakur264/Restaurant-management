# 🍽️ Flavour Haven — Restaurant Management System

A full-stack Restaurant Management System built with **Node.js**, **Express**, **MongoDB**, and **vanilla HTML/CSS/JS** with a premium dark-mode UI. Follows **Cloud 5.0** architecture principles.

---

## ✨ Features

- **Role-Based Access**: Admin, Staff, Customer with JWT authentication
- **Admin Dashboard**: Analytics with Chart.js (revenue, orders, popular items)
- **Menu Management**: Full CRUD with categories, veg/non-veg filtering
- **Order Management**: Real-time order queue with status progression
- **Inventory Tracking**: Stock levels with low-stock alerts
- **PDF Bill Generation**: Downloadable invoice with PDFKit
- **Employee Management**: User roles & access control
- **Search & Filter**: On menu, orders, inventory, employees
- **Responsive Design**: Works on mobile, tablet, desktop
- **Docker Ready**: Dockerfile + docker-compose.yml included

---

## 📁 Project Structure (MVC)

```
restaurant-management/
├── server.js              # Express entry point
├── config/db.js           # MongoDB connection
├── middleware/             # Auth, Role, Logger
├── models/                # Mongoose schemas (User, MenuItem, Order, Inventory, Payment)
├── controllers/           # Business logic
├── routes/                # RESTful API routes (microservices-style)
├── utils/                 # PDF generator, seed data
├── public/                # Frontend (static files)
│   ├── index.html         # Login/Register
│   ├── customer/          # Menu, Orders, Billing
│   ├── staff/             # Order Queue, Inventory
│   ├── admin/             # Dashboard, Menu CRUD, Employees, Reports
│   ├── css/style.css
│   └── js/                # Auth, Customer, Staff, Admin modules
├── Dockerfile
├── docker-compose.yml
└── .env
```

---

## 🚀 Quick Start (Localhost)

### Prerequisites
- **Node.js** v16+ installed
- **MongoDB** running on `localhost:27017`

### Steps

```bash
# 1. Navigate to project folder
cd restaurant-management

# 2. Install dependencies
npm install

# 3. Seed sample data (users, menu items, inventory)
npm run seed

# 4. Start the server
npm start
```

Open **http://localhost:5000** in your browser.

### Demo Login Credentials

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@restaurant.com   | admin123    |
| Staff    | staff@restaurant.com   | staff123    |
| Customer | john@example.com       | customer123 |

---

## 🐳 Docker Deployment

```bash
# Build and start containers
docker-compose up --build

# Seed data (in a new terminal)
docker exec -it <app-container-id> node utils/seedData.js
```

---

## 📡 API Routes

| Method | Route                    | Auth           | Description          |
|--------|--------------------------|----------------|----------------------|
| POST   | /api/auth/register       | Public         | Register             |
| POST   | /api/auth/login          | Public         | Login (JWT)          |
| GET    | /api/menu                | Public         | List menu items      |
| POST   | /api/menu                | Admin          | Create menu item     |
| PUT    | /api/menu/:id            | Admin          | Update menu item     |
| DELETE | /api/menu/:id            | Admin          | Delete menu item     |
| GET    | /api/orders              | Staff/Admin    | All orders           |
| GET    | /api/orders/my           | Customer       | My orders            |
| POST   | /api/orders              | Customer       | Place order          |
| PATCH  | /api/orders/:id/status   | Staff/Admin    | Update order status  |
| GET    | /api/inventory           | Staff/Admin    | List inventory       |
| POST   | /api/inventory           | Admin          | Add inventory item   |
| PUT    | /api/inventory/:id       | Admin          | Update inventory     |
| GET    | /api/payments            | Admin          | List payments        |
| POST   | /api/payments            | Staff/Admin    | Record payment       |
| GET    | /api/payments/:id/pdf    | Authenticated  | Download PDF bill    |
| GET    | /api/users               | Admin          | List users           |
| PUT    | /api/users/:id           | Admin          | Update user          |
| GET    | /api/analytics           | Admin          | Dashboard stats      |

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Auth**: JWT + bcrypt
- **PDF**: PDFKit
- **Charts**: Chart.js
- **Icons**: Font Awesome 6
- **Fonts**: Inter + Playfair Display (Google Fonts)


