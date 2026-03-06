# Phase 1 Submission Checklist

## ✅ Code Implementation (COMPLETED)
- [x] Backend: User entity with name, email, passwordHash
- [x] Backend: User repository with email lookup
- [x] Backend: User service with validation & authentication
- [x] Backend: Auth controller with register/login endpoints
- [x] Backend: Security config with BCrypt password encoding
- [x] Frontend: Registration form with validation
- [x] Frontend: Login form with validation
- [x] Frontend: Dashboard with user info display
- [x] Frontend: CSS styling for all pages
- [x] Documentation: Implementation summary created
- [x] Documentation: README with setup instructions

## 📋 Testing Requirements (TO DO)

### Test 1: User Registration
- [ ] Start XAMPP and ensure MySQL is running
- [ ] Create database `studynook_db` in phpMyAdmin
- [ ] Start backend: `cd backend` then `mvnw.cmd spring-boot:run`
- [ ] Start frontend: `cd web` then `npm install` then `npm start`
- [ ] Go to http://localhost:3000
- [ ] Fill registration form:
  - Name: [Your test name]
  - Email: [Your test email]
  - Password: [Your test password]
- [ ] Click "Sign Up"
- [ ] Verify success message appears
- [ ] **SCREENSHOT: Registration page (before submitting)**
- [ ] **SCREENSHOT: Success message after registration**

### Test 2: Database Verification
- [ ] Go to http://localhost/phpmyadmin
- [ ] Open database `studynook_db`
- [ ] Click on `users` table
- [ ] Verify your user record exists with:
  - user_id, name, email, password_hash (encrypted), role, created_at
- [ ] **SCREENSHOT: Database record in phpMyAdmin**

### Test 3: Duplicate Email Prevention
- [ ] Try to register again with the same email
- [ ] Verify error message: "Email already registered..."
- [ ] **SCREENSHOT: Duplicate email error (optional)**

### Test 4: User Login
- [ ] On login form, enter your registered email and password
- [ ] Click "Login"
- [ ] **SCREENSHOT: Login page (before submitting)**
- [ ] Verify success message and redirect to dashboard
- [ ] **SCREENSHOT: Dashboard showing user information**

### Test 5: Dashboard Features
- [ ] Verify dashboard shows:
  - Welcome message with your name
  - Email address
  - Role (USER)
  - Member since date
- [ ] Click logout button
- [ ] Verify return to login/register page

### Test 6: Invalid Login
- [ ] Try to login with wrong password
- [ ] Verify error message: "Invalid email or password"
- [ ] **SCREENSHOT: Invalid login error (optional)**

## 📸 Required Screenshots (MINIMUM 5)

### Must Have:
1. [ ] **Registration Page** - Empty form ready for input
2. [ ] **Successful Registration** - Success message displayed
3. [ ] **Login Page** - Empty form ready for input
4. [ ] **Successful Login/Dashboard** - Dashboard with user info
5. [ ] **Database Record** - phpMyAdmin showing user in `users` table

### Optional (Recommended):
6. [ ] Duplicate email prevention error
7. [ ] Invalid login credentials error
8. [ ] Backend running in terminal
9. [ ] Frontend running in terminal

## 🔄 Git Commit (TO DO)

### Option 1: If you have Git initialized
```bash
# Stage all changes
git add .

# Create final commit
git commit -m "IT342 Phase 1 – User Registration and Login Completed"

# Push to GitHub
git push origin main

# Get commit hash
git log -1 --oneline
```

### Option 2: If you DON'T have Git yet
```bash
# Navigate to project root
cd c:\Users\L24X09W31\Documents\StudyNook

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "IT342 Phase 1 – User Registration and Login Completed"

# Create GitHub repository (go to github.com)
# Repository name: IT342-Ocampo-StudyNook

# Add remote and push
git remote add origin https://github.com/[YOUR-USERNAME]/IT342-Ocampo-StudyNook.git
git branch -M main
git push -u origin main

# Get commit hash
git log -1 --oneline
```

### Commit Information Needed:
- [ ] Commit hash (e.g., `a1b2c3d`)
- [ ] Commit URL (e.g., `https://github.com/username/IT342-Ocampo-StudyNook/commit/a1b2c3d`)

## 📄 PDF Document Preparation (TO DO)

### Create PDF with following sections:

### Section 1: GitHub Repository
- [ ] Repository URL: `https://github.com/[USERNAME]/IT342-Ocampo-StudyNook`
- [ ] Note: Repository name format should be `IT342-Lastname-AppName`

### Section 2: Final Commit
- [ ] Commit message: "IT342 Phase 1 – User Registration and Login Completed"
- [ ] Commit hash: [paste your commit hash]
- [ ] Commit URL: [paste full GitHub commit URL]
- [ ] Commit date: March 6, 2026

### Section 3: Screenshots
Paste all 5 required screenshots with labels:
1. Registration Page
2. Successful Registration
3. Login Page
4. Successful Login / Dashboard
5. Database Record (phpMyAdmin)

### Section 4: Implementation Summary (1 Page)
Copy content from `IMPLEMENTATION_SUMMARY.md` file:

#### User Registration
- Registration fields: name, email, password
- Validation process: required fields, email format, password length
- Duplicate prevention: unique email constraint, backend check
- Password security: BCrypt hashing

#### User Login
- Login credentials: email and password
- Verification process: database lookup, BCrypt password matching
- Success behavior: localStorage session, dashboard redirect

#### Database Table
- Table: `users`
- Columns: user_id, name, email, password_hash, role, created_at

#### API Endpoints
- POST /api/auth/register
- POST /api/auth/login

### File Naming:
- [ ] Rename PDF to: `IT342_Phase1_StudyNook_Ocampo.pdf`

## ⚠️ IMPORTANT NOTES

### Maven Configuration Issue:
Your current configuration:
- Group ID: `com.ocampo`
- Artifact ID: `backend`

Professor's requirement:
- Group ID: `edu.cit.lastname` (should be `edu.cit.ocampo`)
- Artifact ID: `appname` (should be `studynook`)

**Options:**
1. Keep current config and mention in PDF that base package is `com.ocampo.backend`
2. Refactor to match requirements (would require significant changes)

**Recommendation:** Keep current config for now, note in summary that base package is `com.ocampo.backend`

## ✅ Final Checklist Before Submission

- [ ] All features tested and working
- [ ] All 5+ screenshots captured
- [ ] Git repository created on GitHub
- [ ] Repository name: `IT342-Ocampo-StudyNook`
- [ ] Final commit made with correct message
- [ ] PDF created with all required sections
- [ ] PDF filename: `IT342_Phase1_StudyNook_Ocampo.pdf`
- [ ] PDF reviewed for completeness
- [ ] Submitted before deadline

## 📁 Files Reference

All documentation is in your project folder:
- `README.md` - Setup and running instructions
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation explanation
- `PHASE1_SUBMISSION_CHECKLIST.md` - This file

## 🆘 Quick Help

### Can't start backend?
- Make sure Java 21 is installed: `java --version`
- Make sure XAMPP MySQL is running
- Database `studynook_db` must exist

### Can't start frontend?
- Make sure Node.js is installed: `node --version`
- Run `npm install` first (one time only)
- Make sure backend is running first

### Can't see users table?
- Table is auto-created when backend starts
- Check backend console for "Creating table users"
- Refresh phpMyAdmin page

### Backend errors?
- Check `application.properties` database settings
- Ensure MySQL port is 3306
- Ensure database password is empty (root user)

---

**Good luck with your Phase 1 submission! 🎓**
