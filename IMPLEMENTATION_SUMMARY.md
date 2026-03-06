# IT342 Phase 1 - Implementation Summary
**Project:** StudyNook  
**Student:** Ocampo  
**Date:** March 6, 2026

---

## 1. User Registration

### Registration Fields Used
The system implements user registration with the following fields:
- **Name** (String, required) - Full name of the user
- **Email** (String, required, unique) - User's email address
- **Password** (String, required) - User's password (minimum 6 characters)

### Validation Process
The registration process includes comprehensive validation:

1. **Required Field Validation:**
   - All fields (name, email, password) are checked for presence
   - Empty or null values are rejected with appropriate error messages

2. **Email Format Validation:**
   - Email format is validated using regex pattern
   - Pattern: `^[A-Za-z0-9+_.-]+@(.+)$`
   - Invalid emails are rejected before database operation

3. **Frontend Validation:**
   - Client-side validation checks all fields before submission
   - Password must be at least 6 characters
   - Real-time error messages displayed to users

### How Duplicate Accounts Are Prevented
The system prevents duplicate email registration through:
- Database constraint: `@Column(unique = true, nullable = false)` on email field
- Backend validation: Before saving, the system checks if email exists using `userRepository.findByEmail()`
- If email exists, returns error: "Email already registered. Please use a different email."

### How Passwords Are Stored Securely
Passwords are stored using industry-standard security practices:
- **BCrypt Password Encoder** is used for password hashing
- Passwords are never stored in plain text
- The `BCryptPasswordEncoder` uses salt and multiple hashing rounds
- Password field in database: `passwordHash` (stores the encrypted hash, not the original password)
- Encoding happens in `UserService.registerUser()` method:
  ```java
  user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
  ```

---

## 2. User Login

### Login Credentials Used
Users login with:
- **Email** - User's registered email address
- **Password** - User's password (validated against hashed password)

### How the System Verifies Users
The authentication process works as follows:

1. **Credential Submission:**
   - User submits email and password via POST request to `/api/auth/login`

2. **User Lookup:**
   - System searches database for user by email using `userRepository.findByEmail()`

3. **Password Verification:**
   - If user exists, system compares submitted password with stored hash
   - Uses `passwordEncoder.matches()` method for secure comparison
   - Original password is compared against the hashed version

4. **Authentication Result:**
   - If credentials match: User object returned with all user details
   - If credentials invalid: Returns 401 status with error message

### What Happens After Successful Login
Upon successful authentication:

1. **Backend Response:**
   - Returns complete User object (userId, name, email, role, createdAt)
   - HTTP 200 OK status

2. **Frontend Processing:**
   - User data stored in browser's localStorage
   - Application state updated with user information
   - Success message displayed to user

3. **Route Protection:**
   - User automatically redirected to Dashboard
   - Protected routes become accessible
   - User session persists across browser refreshes

4. **Dashboard Access:**
   - Dashboard displays user information (name, email, role, join date)
   - User can access system features
   - Logout functionality available

---

## 3. Database Table

### Table Structure
**Table Name:** `users`

**Columns:**
| Column Name    | Data Type      | Constraints                    | Description                          |
|---------------|----------------|--------------------------------|--------------------------------------|
| user_id       | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique identifier for each user      |
| name          | VARCHAR(255)   | NOT NULL                       | User's full name                     |
| email         | VARCHAR(255)   | UNIQUE, NOT NULL               | User's email (used for login)        |
| password_hash | VARCHAR(255)   | NOT NULL                       | BCrypt hashed password               |
| role          | VARCHAR(50)    | DEFAULT 'USER'                 | User role (USER, ADMIN, etc.)        |
| created_at    | DATETIME       | DEFAULT CURRENT_TIMESTAMP      | Account creation timestamp           |

### Database Configuration
- **Database:** MySQL (via XAMPP)
- **Database Name:** studynook_db
- **Connection:** localhost:3306
- **Hibernate:** Auto-creates/updates table structure
- **JPA Configuration:** `spring.jpa.hibernate.ddl-auto=update`

---

## 4. API Endpoints

### Registration Endpoint
**POST** `/api/auth/register`

**Request Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-03-06T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email already registered. Please use a different email."
}
```

### Login Endpoint
**POST** `/api/auth/login`

**Request Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-03-06T10:30:00"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

## 5. Technology Stack

### Backend (Spring Boot 4.0.2)
- **Framework:** Spring Boot
- **Build Tool:** Maven
- **Java Version:** 21
- **Architecture:** REST API
- **Dependencies:**
  - Spring Data JPA (Database operations)
  - Spring Security (Password encryption)
  - Spring Web MVC (REST controllers)
  - MySQL Connector (Database driver)

### Frontend (React)
- **Framework:** React 19.2.4
- **UI Library:** React DOM
- **HTTP Client:** Fetch API
- **State Management:** React Hooks (useState)
- **Storage:** LocalStorage for session persistence

### Database
- **DBMS:** MySQL
- **Server:** XAMPP (localhost)
- **ORM:** Hibernate (via Spring Data JPA)

---

## 6. Security Features Implemented

1. **Password Hashing:** BCrypt with automatic salt generation
2. **CSRF Protection:** Disabled for API (stateless REST)
3. **CORS Configuration:** Allows React frontend (http://localhost:3000)
4. **SQL Injection Prevention:** JPA parameterized queries
5. **Unique Email Constraint:** Database-level duplicate prevention
6. **Input Validation:** Both frontend and backend validation

---

## 7. Project Structure

### Backend Structure
```
backend/src/main/java/com/ocampo/backend/
├── BackendApplication.java          # Main Spring Boot application
├── config/
│   └── SecurityConfig.java          # Security and CORS configuration
├── controller/
│   └── AuthController.java          # REST API endpoints
├── dto/
│   ├── LoginRequest.java            # Login request DTO
│   ├── LoginResponse.java           # Login response DTO
│   └── RegisterRequest.java         # Registration request DTO
├── entity/
│   └── User.java                    # User entity (JPA)
├── repository/
│   └── UserRepository.java          # Data access layer
└── service/
    └── UserService.java             # Business logic layer
```

### Frontend Structure
```
web/src/
├── App.js                           # Main application component
├── Login.js                         # Login page component
├── Login.css                        # Login page styles
├── Register.js                      # Registration page component
├── Register.css                     # Registration page styles
├── Dashboard.js                     # Protected dashboard component
└── Dashboard.css                    # Dashboard styles
```

---

## 8. How to Run the Application

### Prerequisites
- Java 21 installed
- Node.js and npm installed
- XAMPP (MySQL) running on port 3306
- Database `studynook_db` created

### Backend Setup
1. Navigate to backend folder
2. Run: `./mvnw spring-boot:run` (Linux/Mac) or `mvnw.cmd spring-boot:run` (Windows)
3. Backend runs on: http://localhost:8080

### Frontend Setup
1. Navigate to web folder
2. Install dependencies: `npm install`
3. Start React app: `npm start`
4. Frontend runs on: http://localhost:3000

### Testing the Application
1. Open browser to http://localhost:3000
2. Register a new account with name, email, and password
3. Login with registered email and password
4. Access dashboard upon successful login
5. Verify user details displayed on dashboard

---

## 9. Maven Configuration

**Group ID:** `com.ocampo`  
**Artifact ID:** `backend`  
**Base Package:** `com.ocampo.backend`

**Note:** According to professor's requirements, the Group ID should follow the format `edu.cit.lastname`. To align with requirements, this should be changed to:
- Group ID: `edu.cit.ocampo`
- Artifact ID: `studynook`
- Base Package: `edu.cit.ocampo.studynook`

---

## 10. Features Checklist

- ✅ User Registration with name, email, password
- ✅ Required field validation
- ✅ Email format validation  
- ✅ Duplicate email prevention
- ✅ Secure password storage (BCrypt)
- ✅ User Login with email and password
- ✅ Credential verification against database
- ✅ Protected dashboard access after login
- ✅ User session management
- ✅ Logout functionality
- ✅ Database table with proper structure
- ✅ REST API endpoints (register, login)
- ✅ Error handling and user feedback
- ✅ Responsive UI with CSS styling

---

## Conclusion

The StudyNook authentication system has been successfully implemented with all required features for Phase 1. The system provides secure user registration, login functionality, and protected dashboard access. All passwords are encrypted using BCrypt, duplicate accounts are prevented, and the application follows REST API architecture with proper separation of concerns.
