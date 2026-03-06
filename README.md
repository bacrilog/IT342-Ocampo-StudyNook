# StudyNook - User Authentication System
**IT342 Phase 1: User Registration and Login**  
**Date:** March 06, 2026

## Project Overview
StudyNook is a web-based application built with Spring Boot (backend) and React (frontend) that provides secure user authentication with registration and login functionality.

## Technology Stack

### Backend
- **Framework:** Spring Boot 4.0.2
- **Java:** Version 21
- **Build Tool:** Maven
- **Database:** MySQL (via XAMPP)
- **Security:** BCrypt Password Encryption
- **Architecture:** REST API

### Frontend
- **Framework:** React 19.2.4
- **HTTP Client:** Fetch API
- **Styling:** Custom CSS

## Features Implemented (Phase 1)
✅ User Registration (Name, Email, Password)  
✅ Email Validation & Duplicate Prevention  
✅ Secure Password Storage (BCrypt Hashing)  
✅ User Login with Email and Password  
✅ Protected Dashboard Access  
✅ Session Management (LocalStorage)  
✅ Logout Functionality  

## Database Setup

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services

### Step 2: Create Database
1. Open browser and go to: http://localhost/phpmyadmin
2. Click **New** to create a database
3. Database name: `studynook_db`
4. Collation: `utf8mb4_general_ci`
5. Click **Create**

**Note:** The application will automatically create the `users` table when you run the backend.

## Running the Application

### Backend Setup (Port 8080)

1. Open terminal and navigate to backend folder:
```bash
cd backend
```

2. Run the Spring Boot application:

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Mac/Linux:**
```bash
./mvnw spring-boot:run
```

3. Wait for the message: "Started BackendApplication in X seconds"
4. Backend API is now running at: http://localhost:8080

### Frontend Setup (Port 3000)

1. Open a **new terminal** and navigate to web folder:
```bash
cd web
```

2. Install dependencies (first time only):
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

4. Browser will automatically open at: http://localhost:3000

## Testing the Application

### Test User Registration
1. Go to http://localhost:3000
2. Fill out the **Create Account** form:
   - **Full Name:** John Doe
   - **Email:** john@example.com
   - **Password:** password123
3. Click **Sign Up**
4. You should see: "Registration Successful! You can now login."

### Test User Login
1. Fill out the **Login** form:
   - **Email:** john@example.com
   - **Password:** password123
2. Click **Login**
3. You should see: "Login Successful!"
4. You will be redirected to the **Dashboard**

### Verify Database Record
1. Go to: http://localhost/phpmyadmin
2. Select database: `studynook_db`
3. Click on table: `users`
4. You should see your registered user with:
   - Name, Email, Role (USER)
   - Password will be a BCrypt hash (encrypted)
   - Created timestamp

### Test Duplicate Prevention
1. Try to register again with the same email
2. You should see error: "Email already registered. Please use a different email."

### Test Invalid Login
1. Try to login with wrong password
2. You should see error: "Invalid email or password"

### Test Dashboard
1. After successful login, you should see:
   - Welcome message with your name
   - Your email address
   - Your role
   - Member since date
   - Logout button

### Test Logout
1. Click **Logout** button on dashboard
2. You should be redirected back to Login/Register page
3. Dashboard is no longer accessible until you login again

## API Endpoints

### Register User
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "password123"
}
```

### Login User
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Database Schema

**Table:** `users`

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| user_id       | BIGINT       | PRIMARY KEY, AUTO_INCREMENT |
| name          | VARCHAR(255) | NOT NULL                 |
| email         | VARCHAR(255) | UNIQUE, NOT NULL         |
| password_hash | VARCHAR(255) | NOT NULL                 |
| role          | VARCHAR(50)  | DEFAULT 'USER'           |
| created_at    | DATETIME     | DEFAULT CURRENT_TIMESTAMP |

## Troubleshooting

### Backend Issues

**Error: "Port 8080 already in use"**
- Stop any other application using port 8080
- Or change port in `application.properties`: `server.port=8081`

**Error: "Cannot establish database connection"**
- Make sure XAMPP MySQL is running
- Verify database `studynook_db` exists
- Check database credentials in `application.properties`

### Frontend Issues

**Error: "Backend not connected"**
- Make sure backend is running on port 8080
- Check browser console for CORS errors
- Verify API endpoints are accessible

**Error: "Port 3000 already in use"**
- Stop any other React app running
- Or use different port: `PORT=3001 npm start`

## Project Structure

```
StudyNook/
├── backend/                  # Spring Boot backend
│   ├── src/main/java/com/ocampo/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   └── AuthController.java
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entity/
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   └── service/
│   │       └── UserService.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── web/                      # React frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Register.js
│   │   ├── Register.css
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   └── package.json
│
├── IMPLEMENTATION_SUMMARY.md # Phase 1 implementation details
└── README.md                 # This file
```

## Security Features

- ✅ **BCrypt Password Hashing** - Passwords never stored in plain text
- ✅ **Email Uniqueness** - Database constraint prevents duplicates
- ✅ **Input Validation** - Frontend and backend validation
- ✅ **CORS Configuration** - Secure cross-origin requests
- ✅ **SQL Injection Prevention** - JPA parameterized queries

## Next Steps for Phase 1 Submission

1. ✅ Test all features (registration, login, dashboard)
2. ✅ Take screenshots:
   - Registration page
   - Successful registration message
   - Login page
   - Successful login and dashboard
   - Database record in phpMyAdmin
3. ✅ Make final commit with message: "IT342 Phase 1 – User Registration and Login Completed"
4. ✅ Copy commit hash/link
5. ✅ Prepare PDF with:
   - GitHub repository link
   - Final commit hash
   - Screenshots
   - Implementation summary (see IMPLEMENTATION_SUMMARY.md)
6. ✅ Submit PDF before deadline

## Contact
For questions or issues, refer to the IMPLEMENTATION_SUMMARY.md file for detailed documentation.
