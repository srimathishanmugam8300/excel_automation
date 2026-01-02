# Auth System

This is a secure authentication module with Admin and User roles, featuring a FastAPI backend and a React frontend.

## Project Structure

```
auth_system/
  backend/       # FastAPI application
  frontend/      # React application (Vite)
  README.md
```

## 1️⃣ Backend Run Steps

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment (if not already done):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will run at `http://127.0.0.1:8000`.
    Swagger UI is available at `http://127.0.0.1:8000/docs`.

    **Default Admin Credentials:**
    - Username: `admin`
    - Password: `admin123`

## 2️⃣ Frontend Run Steps

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

3.  Run the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend will typically run at `http://localhost:5173`.

4.  Open your browser and go to the URL shown in the terminal (e.g., `http://localhost:5173`).

## Features

- **Admin Login**: Secure login for administrators.
- **User Login**: Login for standard users.
- **Admin Dashboard**: Create users, view user list, reset user passwords.
- **First Login Enforcement**: Users created by admin must change their password on first login.
- **Forgot Password**: Users can request a reset token (simulated) and reset their password.
- **Change Password**: Authenticated users can change their password.
