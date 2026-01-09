# 🛡️ Digital Knowledge Network (DKN)

> **Velion Dynamics - Enterprise Knowledge Management System**

The **Digital Knowledge Network (DKN)** is a full-stack web application designed to centralise organisational knowledge, enforce governance policies, and drive employee engagement through gamification. This project helps Velion Dynamics transition from fragmented data silos to a unified, secure, and compliant digital workspace.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Key Features](#-key-features)
4. [Prerequisites](#-prerequisites)
5. [Installation Guide](#-installation-guide)
6. [Default Credentials](#-default-credentials)
7. [API Documentation](#-api-documentation)
8. [Troubleshooting](#-troubleshooting)

---

## 🔭 Project Overview

The DKN system addresses critical business challenges such as data duplication, lack of version control, and low employee engagement. It implements **Role-Based Access Control (RBAC)** to ensure that sensitive data (like Governance Policies) is only modifiable by authorised personnel, while Knowledge Assets can be contributed by all staff.

**Core Objectives:**
* **Centralisation:** Single source of truth for all documents.
* **Compliance:** Strict versioning and audit trails for governance.
* **Engagement:** Gamified contribution system (Points, Badges, Leaderboards).
* **Security:** Granular permission management using Laravel Middleware.

---

## 💻 Tech Stack

### Backend (API)
* **Framework:** Laravel 12
* **Language:** PHP 8.3
* **Database:** MySQL 8.0 / MariaDB
* **Authentication:** Laravel Sanctum (Token-based)
* **Architecture:** MVC / RESTful API

### Frontend (Client)
* **Library:** React 18
* **Build Tool:** Vite
* **State Management:** Zustand
* **Routing:** React Router DOM v6
* **HTTP Client:** Axios
* **Styling:** Bootstrap 5 / Custom CSS

---

## ✨ Key Features

1.  **Authentication & Security**
    * Secure Login with Token Management.
    * RBAC Middleware (`ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `GOVERNANCE_COUNCIL`).
    * Protected Routes on both Client and Server.

2.  **Knowledge Management**
    * Upload, View, Edit, and Archive Knowledge Assets.
    * File Upload support (PDF, DOCX).
    * Status workflow (Draft → Pending Review → Published).

3.  **Governance & Compliance**
    * Dedicated Policy Management Module.
    * GDPR Data Erasure & Export requests.
    * Full System Audit Logs (tracking logins, edits, and deletions).

4.  **Gamification**
    * Automated point tracking for uploads and reviews.
    * Live Leaderboard showing top contributors.
    * Badges for specific achievements (e.g., "Quality Star").

---

## 📋 Prerequisites

Ensure your environment meets the following requirements before installation:

* **PHP** >= 8.2
* **Composer** (Latest)
* **Node.js** >= 20.0 (LTS) & **NPM**
* **MySQL** running on localhost (Port 3306)

---

## 🚀 Installation Guide

### Part 1: Backend Setup (Laravel)

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/aashish-giri/dkn-project.git](https://github.com/aashish-giri/dkn-project.git)
    cd dkn-project/backend
    ```

2.  **Install Dependencies**
    ```bash
    composer install
    ```

3.  **Environment Configuration**
    ```bash
    cp .env.example .env
    ```
    * Open `.env` and configure your database:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=dkn_db
    DB_USERNAME=root
    DB_PASSWORD=
    ```

4.  **Generate Key & Migrate**
    ```bash
    php artisan key:generate
    php artisan storage:link
    php artisan migrate --seed
    ```
    *(The `--seed` flag creates the default Admin, Supervisor, and initial Data)*

5.  **Run the Server**
    ```bash
    php artisan serve
    ```
    > API URL: `http://127.0.0.1:8000`

---

### Part 2: Frontend Setup (React)

1.  **Navigate to Frontend Directory**
    *(Open a new terminal)*
    ```bash
    cd ../frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Axios**
    Ensure `src/services/axiosInstance.js` points to your backend:
    ```javascript
    baseURL: "[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)"
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    > Application URL: `http://localhost:5173`

---

## 🔑 Default Credentials

Use these accounts to test the different access levels required for the coursework assessment.

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@velion.com` | `password` | User Management, Full Deletion, Logs |
| **Supervisor** | `supervisor@velion.com` | `password` | Review Assets, Publish Content |
| **Council** | `gov@velion.com` | `password` | Policy Creation, Deprecation |
| **Employee** | `staff@velion.com` | `password` | Create Drafts, View Assets |

---

## 📡 API Documentation

Important endpoints used in this application:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Public | Authenticates user & returns token |
| `GET` | `/api/assets` | Auth | Lists all visible knowledge assets |
| `POST` | `/api/assets` | Auth | Upload a new draft asset |
| `GET` | `/api/users` | **Admin** | Lists all registered users |
| `GET` | `/api/audit-logs` | **Admin** | View system security logs |
| `GET` | `/api/dashboard-stats`| Auth | Returns counts, leaderboard & activity |

---

## 🛠️ Troubleshooting

**1. Images not loading?**
Ensure you ran the storage link command in the backend folder:
```bash
php artisan storage:link
