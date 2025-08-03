# ProjectNinjas - Backend API

This is the backend server for the ProjectNinjas application. It is a Node.js and Express.js application responsible for handling all user authentication, project management, file uploads, and access control logic. It exposes a RESTful API that the frontend consumes.

---

### Features & API Endpoints

-   **User Authentication**
    -   `POST /api/auth/register`: Create a new user account.
    -   `POST /api/auth/login`: Log in a user and return a JWT.
-   **Project Management**
    -   `GET /api/projects`: Get a list of all public projects.
    -   `GET /api/projects/:id`: Get the details of a single project.
    -   `POST /api/projects`: Create a new project (Authentication required).
-   **File Management & Access Control**
    -   `POST /api/projects/:id/upload`: Upload a source code file to a project (Owner only).
    -   `POST /api/requests/project/:id`: Request access to a project's files (Authentication required).
    -   `GET /api/requests/my-projects`: Get all pending requests for projects you own.
    -   `PUT /api/requests/:requestId`: Approve or deny an access request (Owner only).

---

### Technology Stack

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** PostgreSQL
-   **Authentication:** JSON Web Tokens (JWT)
-   **File Uploads:** Multer
-   **Password Hashing:** bcryptjs

---

### Setup and Installation

**1. Clone the repository (if applicable):**
   ```bash
   git clone [your-repo-url]
   cd backend
```

**2. Install Dependencies:**

```bash
npm install
```

**3. Set up the PostgreSQL Database:**

  - Make sure you have PostgreSQL installed and running.
  - Create a new database (e.g., `projectninjas`).
  - Run the `init.sql` script provided in the root of this folder to create all the necessary tables. You can do this using a tool like pgAdmin or the `psql` command line:
    ```bash
    psql -U your_postgres_user -d projectninjas -f init.sql
    ```

**4. Create Environment File:**

  - Create a `.env` file in the root of the `backend` folder.
  - Add your database connection details and a secure JWT secret:
    ```env
    DB_USER=your_postgres_user
    DB_HOST=localhost
    DB_DATABASE=projectninjas
    DB_PASSWORD=your_postgres_password
    DB_PORT=5432
    JWT_SECRET=your_super_secret_key
    ```

**5. Running the Server:**

  - To start the development server, run:
    ```bash
    npm start
    ```
  - The server will be running on `http://localhost:5000`. 