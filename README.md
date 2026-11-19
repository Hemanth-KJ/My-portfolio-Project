# My Portfolio — Full-Stack Developer Portfolio

A modern, responsive, and dynamic **Full-Stack Developer Portfolio** built with **React, Vite, Node.js, Express.js, and PostgreSQL**.

Unlike a traditional static portfolio, this application features a database-driven **Admin Content Management System (CMS)** that allows portfolio content to be managed dynamically without modifying the frontend source code.

The application is deployed using **Vercel, Render, and Supabase**, with **Resend API** integration for email notifications.

### Live Links

🌐 **Live Portfolio:** https://my-portfolio-project-ebon.vercel.app/

💻 **GitHub Repository:** https://github.com/Hemanth-KJ/My-portfolio-Project

---

## Features

### Portfolio Website

- Modern and responsive user interface
- Interactive homepage with animations
- About Me section
- Education timeline
- Technical skills showcase
- Dynamic projects section
- Resume section
- Contact form
- Smooth navigation using React Router
- REST API integration
- Database-driven portfolio content

### Admin Dashboard

- Secure admin login using JWT authentication
- Protected admin routes
- Create, read, update, and delete portfolio content
- Manage projects and technical skills
- Update education and experience information
- Manage resume details
- Manage homepage and About Me content
- View contact messages
- Dynamic updates through PostgreSQL

### Contact Management System

- Visitor contact form
- Server-side input validation
- PostgreSQL message storage
- Automated email notifications through Resend
- Gmail inbox integration
- Reply-To support for responding to visitors
- Error handling for failed email notifications

---

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (JWT) |
| Email Service | Resend API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Supabase |
| Version Control | Git, GitHub |

---

## System Architecture

```text
                         USER / ADMIN
                              |
                              v
                    +-------------------+
                    |    React + Vite   |
                    |      Frontend     |
                    |      (Vercel)     |
                    +-------------------+
                              |
                         HTTPS REST API
                              |
                              v
                    +-------------------+
                    | Node.js + Express |
                    |      Backend      |
                    |      (Render)     |
                    +-------------------+
                              |
                  +-----------+-----------+
                  |                       |
                  v                       v
        +-------------------+   +-------------------+
        |    PostgreSQL     |   |    Resend API     |
        |    (Supabase)     |   |  Email Service    |
        +-------------------+   +-------------------+
                  |                       |
                  v                       v
         Portfolio Content           Gmail Inbox
         Admin Information
         Contact Messages
```

### Architecture Overview

1. Visitors access the React frontend hosted on Vercel.
2. React communicates with the Express backend through REST APIs.
3. The backend validates requests and interacts with PostgreSQL.
4. Supabase stores portfolio content, admin information, and contact messages.
5. JWT authentication protects administrative functionality.
6. Resend sends email notifications when visitors submit contact messages.
7. The admin dashboard allows portfolio information to be updated dynamically.

---

## Project Structure

```text
My-portfolio-Project/
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |
|   |-- package.json
|   |-- vite.config.js
|   |-- vercel.json
|
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- server.js
|   |
|   |-- package.json
|   |-- .env
|
|-- .gitignore
|-- README.md
```

The structure above illustrates the main application directories.

---

## Getting Started

### Prerequisites

Ensure you have installed:

- Node.js and npm
- Git
- PostgreSQL or a Supabase project
- VS Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/Hemanth-KJ/My-portfolio-Project.git

cd My-portfolio-Project
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `backend/`:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_secure_jwt_secret

FRONTEND_URL=http://localhost:5173

RESEND_API_KEY=your_resend_api_key
CONTACT_RECEIVER_EMAIL=your_verified_gmail_address
```

Replace all placeholders with your own configuration.

Ensure the required PostgreSQL tables and admin account have been initialized.

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/v1/health
```

### 3. Frontend Setup

Open a new terminal from the project root.

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## REST API Endpoints

The backend provides versioned REST APIs for portfolio content and administrative operations.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/home` | Retrieve homepage content |
| GET | `/api/v1/about` | Retrieve About Me information |
| GET | `/api/v1/education` | Retrieve education details |
| GET | `/api/v1/skills` | Retrieve technical skills |
| GET | `/api/v1/projects` | Retrieve projects |
| GET | `/api/v1/resume` | Retrieve resume information |
| GET | `/api/v1/contact` | Retrieve contact section content |
| POST | `/api/v1/contact/messages` | Submit a contact message |
| GET | `/api/v1/health` | Check backend health |
| Various | `/api/v1/admin/*` | Admin authentication and content management |

Protected administrative operations require valid authentication.

---

## Admin Authentication

The application uses **JSON Web Tokens (JWT)** for admin authentication.

### Authentication Flow

```text
Admin Login
     |
     v
Express Authentication API
     |
     v
Credential Verification
     |
     v
JWT Token Generation
     |
     v
Authenticated Admin Requests
     |
     v
Protected CRUD Operations
     |
     v
PostgreSQL Database
```

The admin dashboard allows authorized users to manage portfolio content without manually editing the frontend code.

---

## Contact Email Notification Flow

When a visitor submits the contact form:

1. React collects the visitor's name, email, and message.
2. The frontend sends a POST request to `/api/v1/contact/messages`.
3. Express validates the submitted data.
4. PostgreSQL stores the contact message.
5. The backend calls the Resend API over HTTPS.
6. Resend processes the notification.
7. The portfolio owner receives an email in Gmail.

```text
Visitor
   |
   v
React Contact Form
   |
   v
Express Contact Controller
   |
   v
Supabase PostgreSQL
   |
   v
Resend Email API
   |
   v
Gmail Inbox
```

The message remains stored in PostgreSQL even if email notification delivery fails.

### Why Resend?

Resend uses an HTTPS API, avoiding the SMTP port restrictions that can affect email delivery from some free hosting environments.

The Resend testing sender supports restricted recipient addresses. Sending to arbitrary recipients requires a verified sending domain.

---

## Security Features

- JWT-based admin authentication
- Protected backend routes
- CORS origin configuration
- HTTP security headers using Helmet
- Server-side request validation
- Environment variable management
- PostgreSQL-backed data storage
- Private email API credentials
- Error handling and request logging

### Security Best Practices

Never commit the following files or credentials:

```text
.env
.env.local
node_modules/
dist/
```

Use strong JWT secrets and configure production environment variables through the hosting providers.

---

## Deployment

The application is deployed using free-tier hosting services.

### Frontend — Vercel

**Live URL:** https://my-portfolio-project-ebon.vercel.app/

Vercel configuration:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Production environment variable:

```env
VITE_API_BASE_URL=https://YOUR_RENDER_BACKEND.onrender.com/api/v1
```

React Router rewrites are configured through `frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend — Render

The Node.js and Express backend is hosted on Render.

Production environment variables:

```env
NODE_ENV=production

DATABASE_URL=your_supabase_connection_string

JWT_SECRET=your_secure_jwt_secret

FRONTEND_URL=https://my-portfolio-project-ebon.vercel.app

RESEND_API_KEY=your_resend_api_key

CONTACT_RECEIVER_EMAIL=your_verified_gmail_address
```

The backend exposes REST APIs for portfolio content, admin authentication, and contact management.

### Database — Supabase

Supabase provides managed PostgreSQL storage for:

- Homepage content
- About Me information
- Education
- Skills
- Projects
- Resume information
- Admin data
- Contact messages

### Email Service — Resend

Resend handles transactional email notifications using its HTTPS API.

The backend authenticates with `RESEND_API_KEY`, while `CONTACT_RECEIVER_EMAIL` identifies the destination inbox.

---

## Production Build

To build the React frontend:

```bash
cd frontend

npm install

npm run build
```

The generated production files are stored in:

```text
frontend/dist/
```

Vercel automatically builds and deploys the frontend when changes are pushed to the connected production branch.

---

## Future Enhancements

- Improve application performance through code splitting
- Optimize images and static assets
- Add automated frontend and backend tests
- Implement contact form rate limiting and spam protection
- Improve SEO and accessibility
- Add application analytics
- Implement CI/CD quality checks
- Add enhanced admin dashboard reporting

---

## Author

**Hemanth K J**

Computer Science Engineering Student | Software Developer | Full-Stack Developer

Passionate about building scalable backend systems, modern web applications, and AI-powered software solutions.

**Portfolio:** https://my-portfolio-project-ebon.vercel.app/

**GitHub:** https://github.com/Hemanth-KJ

---

## License

This project is intended for personal portfolio and educational use.

All rights reserved unless a separate license is provided.

---

⭐ If you find this project useful, consider starring the repository!
