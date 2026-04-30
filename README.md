# 🚀 Loan Management System (MERN)

Full-stack Loan Management System that manages the complete lifecycle of a loan using role-based workflows.

---

## 🧱 Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- cookie-session
- multer (file upload)
- Cloudinary (file storage)

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Axios

---

## ⚙️ Features

- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Borrower loan application flow
- Business Rule Engine (BRE)
- File upload (salary slip)
- Loan lifecycle management
- Role-based dashboards

---

## 📊 Loan Lifecycle



---

## 🏢 Roles

- Admin (access all modules)
- Sales (manage leads)
- Sanction (approve/reject loans)
- Disbursement (release funds)
- Collection (handle repayments)
- Borrower (apply for loans)

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd loan-management-system

cd server
npm install
```

.env setup
MONGO_URI=your_mongodb_uri
JWT_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```
npm run dev
npm run build
npm run start

cd client
npm install
npm run dev


```
---

## 🌱 Seed Data (Pre-created Users)

To make testing easier, the system includes pre-seeded users for each role.

### ▶️ Run Seed Script

```bash
npx ts-node src/scripts/seed.ts
```

| Role         | Email                                                 | Password |
| ------------ | ----------------------------------------------------- | -------- |
| Admin        | [admin@test.com](mailto:admin@test.com)               | password |
| Sales        | [sales@test.com](mailto:sales@test.com)               | password |
| Sanction     | [sanction@test.com](mailto:sanction@test.com)         | password |
| Disbursement | [disbursement@test.com](mailto:disbursement@test.com) | password |
| Collection   | [collection@test.com](mailto:collection@test.com)     | password |
| Borrower     | [borrower@test.com](mailto:borrower@test.com)         | password |

🧠 Business Rule Engine (BRE)

Loan application is rejected if:

Age not between 23–50
Salary below ₹25,000
Invalid PAN format
Employment status is Unemployed

🔐 API Routes (Key)
Auth
POST /api/users/signup
POST /api/users/signin
POST /api/users/signout
GET /api/users/currentuser
Borrower
POST /api/borrower/profile
POST /api/upload
POST /api/loans/apply
Dashboard
GET /api/sales/leads
GET /api/sanction/loans
POST /api/disbursement/:id
POST /api/collection/payment
