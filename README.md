# ProjectNinjas: A Secure Academic Portfolio Platform

Welcome to ProjectNinjas, a full-stack web application designed and developed as a sophisticated digital portfolio platform for students. This repository contains the complete source code for both the frontend React application and the backend Node.js API.

The core mission of this project is **"Protected Prestige"**—to provide an elegant and secure environment where students can showcase their academic work. The platform solves the problem of academic plagiarism by encouraging project visibility while protecting the core intellectual property through a creator-controlled, permission-based workflow.

![ProjectNinjas Login Page](https://i.imgur.com/gKj2V0Y.png)

---

## Key Features

-   **Full User Authentication:** Secure user registration and login functionality using JWT (JSON Web Tokens) for session management.
-   **Complete Project CRUD:** Users can Create, Read, Update, and Delete their own projects.
-   **Secure, Role-Based Access Control:** A sophisticated, owner-controlled system for managing access to private project files. Authenticated users can send a formal "Access Request" to a project owner, who can then approve or deny it from their dashboard.
-   **Persistent Request Status:** A user's request status (`pending`, `approved`, `denied`) is persistent across login sessions. Once a request is approved, the user gains access to download the project files.
-   **File Management System:** Project owners can upload and categorize project-related files (e.g., "Source Code," "Documentation") to a secure, private storage.
-   **Dynamic & Professional UI:** A responsive frontend with a custom "Monochrome Luxury" theme built with Tailwind CSS, featuring premium fonts and a clean, elegant design.

---

## Technology Stack

| Category             | Technology                                                                          |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Frontend** | React.js, TypeScript, Vite, Tailwind CSS, React Router, Axios                       |
| **Backend** | Node.js, Express.js                                                                 |
| **Database** | PostgreSQL                                                                          |
| **Authentication** | JSON Web Tokens (JWT) with `bcryptjs` for password hashing                          |
| **File Handling** | Multer for multipart/form-data uploads                                              |
| **Development** | Git/GitHub, npm, pgAdmin, Cursor (AI-Assisted IDE)                                  |

---

## Local Setup & Installation

To run this project on your local machine, you will need to run both the backend and frontend servers simultaneously in two separate terminals.

### 1. Backend Setup (`/backend`)

The backend server handles all the business logic and database interactions.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the PostgreSQL Database:**
    - Ensure you have PostgreSQL installed and the service is running.
    - Create a new database (e.g., `projectninjas`).
    - Run the `init.sql` script provided in the `backend` folder to create all the necessary tables. You can do this using a tool like pgAdmin or the `psql` command line.

4.  **Create Environment File:**
    - In the root of the `backend` folder, create a `.env` file.
    - Add your database connection details and a secure JWT secret:
      ```env
      DB_USER=your_postgres_user
      DB_HOST=localhost
      DB_DATABASE=projectninjas
      DB_PASSWORD=your_postgres_password
      DB_PORT=5432
      JWT_SECRET=your_super_secret_key_that_is_long_and_random
      ```

5.  **Running the Server:**
    - To start the development server, run:
      ```bash
      npm start
      ```
    - The server will be running on `http://localhost:5000`.

### 2. Frontend Setup (`/frontend`)

The frontend application provides the user interface.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Running the Development Server:**
    - To start the application for development, run:
      ```bash
      npm run dev
      ```
    - The application will be available at `http://localhost:5173`.

---

### Project Structure

The repository is organized into two main directories:

-   **`/backend`**: Contains the Node.js and Express.js server, including all controllers, routes, middleware, and database configuration.
-   **`/frontend`**: Contains the React and TypeScript application, including all pages, components, hooks, and contexts.

This clean separation of concerns makes the project easy to manage, scale, and understand.
