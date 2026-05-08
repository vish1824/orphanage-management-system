# 🏠 Sunshine Orphanage Management System

> A full-stack web application to manage orphanage operations — built as a Final Year Project

![GitHub repo size](https://img.shields.io/github/repo-size/vish1824/orphanage-management-system)
![GitHub stars](https://img.shields.io/github/stars/vish1824/orphanage-management-system?style=social)
![GitHub forks](https://img.shields.io/github/forks/vish1824/orphanage-management-system?style=social)

---

## 🌟 Features

- 🔐 **Authentication** — JWT-based login & registration with role-based access
- 👥 **4 User Roles** — Admin, Manager, Staff, Viewer (each with different permissions)
- 👦 **Children Management** — Full CRUD + beautiful gallery with adoption apply feature
- 🏥 **Medical Records** — Track diagnoses, treatments, doctor visits
- 📚 **Education Records** — Academic performance tracking per child
- 💝 **Adoption Pipeline** — Application → Review → Approval workflow
- 💰 **Donations Tracking** — Cash & goods donations with donor details
- 💸 **Expense Management** — Category-wise expense tracking
- 📦 **Inventory** — Stock management with low-stock & expiry alerts
- 📅 **Events** — Manage orphanage events and activities
- 📊 **Analytics Dashboard** — Charts with Recharts (donations, expenses, gender, age)
- ⚡ **Real-time Updates** — Socket.IO live notifications & online user tracking
- 📋 **Activity Logs** — Every action tracked per user

---

## 🚀 Tech Stack

| Layer           | Technology                                 |
| --------------- | ------------------------------------------ |
| **Frontend**    | React 18, Vite, Tailwind CSS, React Router |
| **Charts**      | Recharts                                   |
| **Real-time**   | Socket.IO                                  |
| **Backend**     | Node.js, Express.js                        |
| **Auth**        | JWT, bcryptjs                              |
| **Database**    | MySQL 8.0                                  |
| **HTTP Client** | Axios                                      |

---

## 🔑 Demo Credentials

| Role        | Email                   | Password   |
| ----------- | ----------------------- | ---------- |
| **Admin**   | admin@sunshinehome.org  | admin123   |
| **Manager** | priya@sunshinehome.org  | manager123 |
| **Staff**   | anitha@sunshinehome.org | staff123   |
| **Viewer**  | viewer@sunshinehome.org | viewer123  |

---

## 🛠️ Local Setup

### Prerequisites

- Node.js v18+
- MySQL 8.0+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vish1824/orphanage-management-system.git
cd orphanage-management-system
```

### 2. Setup the database

- Open **MySQL Workbench**
- Run `server/database/schema.sql` (Ctrl+Shift+Enter)

### 3. Configure environment

Create `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orphanage_db
JWT_SECRET=sunshine_orphanage_super_secret_jwt_2024
```

### 4. Install & run server

```bash
cd server
npm install
node database/seed.js
npm run dev
```

### 5. Install & run client (new terminal)

```bash
cd client
npm install
npm run dev
```

### 6. Open in browser

```
http://localhost:5173
```

---

## 📁 Project Structure

```
orphanage-management-system/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # 17 pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth & Socket context
│   │   └── services/        # API calls (Axios)
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── routes/              # 14 API routes
│   ├── middleware/          # JWT auth middleware
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   ├── seed.js          # Sample data
│   │   └── db.js            # MySQL connection
│   └── index.js             # Express + Socket.IO
│
└── README.md
```

---

## 👩‍💻 Developer

**Vishnulakshmi**
GitHub: [@vish1824](https://github.com/vish1824)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
