# 🚀 Task 1: Full-Stack Job Board Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
</div>

## 📌 Project Overview
This repository contains a fully responsive, full-stack Job Board application developed as Task 1 for the CODSOFT Web Development Internship. The platform bridges the gap between employers and job seekers, featuring secure authentication, seamless resume uploads, and automated email notifications.

### 🔗 Live Links
* **Live Application:** ("https://codsoft-rho-nine.vercel.app")
* **Backend API URL:** ("https://codsoft-x4s0.onrender.com")

---

## ✨ Key Features
* **Secure Authentication:** Robust user login and registration utilizing JWT (JSON Web Tokens) and encrypted passwords.
* **Role-Based Access:** Distinct interfaces and permissions for Employers (posting jobs) and Candidates (applying for jobs).
* **Cloud File Storage:** Direct, secure resume (PDF) uploads handled via Cloudinary integration.
* **Automated Email Alerts:** Real-time email notifications powered by Nodemailer (e.g., application confirmations).
* **Responsive UI:** A modern, mobile-friendly interface built with React.

---

## 🛠️ Technology Stack
**Frontend:**
* React.js
* Axios (API calls)
* Deployed on **Vercel**

**Backend:**
* Node.js & Express.js
* MongoDB (Mongoose ODM)
* JSON Web Tokens (JWT) for secure routing
* Nodemailer (Email services)
* Cloudinary (Media/Resume storage)
* Deployed on **Render**

---

## 📂 Project Structure
```text
Task_1_Job_Board/
 ┣ 📂 job-board-frontend/      # React client application
 ┣ 📂 job-board-backend/       # Node.js/Express server and API
 ┗ 📜 README.md                # Project documentation

```

---

## 🔒 Environment Variables

To run this project locally, create a `.env` file in the **backend** directory. *(Note: The `.env` file is included in `.gitignore` to prevent leaking sensitive credentials).*

```env
# Server
PORT=5000

# Database
MONGODB_URI=your_mongodb_connection_string

# Security
JWT_SECRET=your_super_secret_jwt_string

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

---

## 🚀 Local Installation & Setup

**1. Clone the repository**

```bash
git clone [https://github.com/NikhilSunny11/CODSOFT.git]
cd CODSOFT/Task_1_Job_Board

```

**2. Setup the Backend**

```bash
cd job-board-backend
npm install
# Ensure your .env file is created with the variables above
npm run dev

```

**3. Setup the Frontend**
Open a new terminal window:

```bash
cd job-board-frontend
npm install
npm run dev

```

The application will now be running on `http://localhost:5173` (or your default React port), communicating with the backend on `http://localhost:5000`.

```
