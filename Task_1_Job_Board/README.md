# CODSOFT Tech Internship 🚀
**Name:** Nikhil S 
**Task:** 1 - Job Board Application  

## 📋 Project Overview
A full-stack, responsive web application built with the MERN stack. This platform connects employers and job seekers, allowing companies to post openings and candidates to seamlessly browse, search, and apply for jobs with resume uploads.

🔗 **Live Demo:** [Insert your Vercel Link here]  
🔗 **Backend API:**(https://codsoft-x4s0.onrender.com)  

---

## ✨ Key Features
* **Role-Based Access Control (RBAC):** Distinct dashboard experiences and permissions for `Employers` and `Candidates`.
* **Secure Authentication:** User registration and login powered by JSON Web Tokens (JWT) and bcrypt password hashing.
* **Resume Processing:** Candidates can upload PDF/Word resumes, which are securely stored and served via Cloudinary integration.
* **Automated Email Notifications:** Integrated with Nodemailer to instantly alert candidates upon successful application submission.
* **Dynamic Search & Filtering:** Users can search for specific job titles or filter by skills and salary directly from the database.
* **Responsive Design:** Fully optimized for both desktop and mobile devices using Tailwind CSS.

---

## 🛠️ Technology Stack
**Frontend:**
* React.js (Vite/CRA)
* Tailwind CSS (Styling)
* Axios (API Communication)
* React Router DOM (Navigation)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose (Database)
* Cloudinary & Multer (File Uploads)
* Nodemailer (Email Services)
* JWT & Bcrypt.js (Security)

---

## 📂 Repository Structure
This repository uses a monorepo structure containing both the client and server code for easy deployment.

```text
CODSOFT/
 ┣ 📂 Task_1_Job_Board/
 ┃ ┣ 📂 job-board-frontend/   # React Client Application
 ┃ ┗ 📂 job-board-backend/    # Node.js Express API
 ┣ 📜 README.md

```

---

## 💻 Local Setup & Installation

If you wish to run this project on your local machine, follow these steps:

### 1. Clone the repository

```bash
git clone [https://github.com/](https://github.com/)[Your GitHub Username]/CODSOFT.git
cd CODSOFT/Task_1_Job_Board

```

### 2. Backend Setup

```bash
cd job-board-backend
npm install

```

* Create a `.env` file in the backend directory.
* Refer to the `.env.example` file to see the required variables (MongoDB URI, Cloudinary Keys, Email SMTP credentials, and JWT Secret).
* Start the server:

```bash
npm start

```

### 3. Frontend Setup

Open a new terminal window:

```bash
cd job-board-frontend
npm install

```

* Change the API URL in your Axios requests from the live Render URL back to `http://localhost:5000` (or your local port).
* Start the React app:

```bash
npm start 
# or 'npm run dev' if using Vite

```

---