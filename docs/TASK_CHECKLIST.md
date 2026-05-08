# Task Checklist — Phase 1: User Registration and Login

## Project Setup
- [x] Spring Boot 3.5.0 backend with Maven
- [x] Group ID: edu.cit.ocampo | Artifact ID: studynook
- [x] Base package: edu.cit.ocampo.studynook
- [x] React frontend (web/)
- [x] Supabase PostgreSQL database connected

## Backend — Registration & Login
- [x] User entity (users table): userId, name, email, passwordHash, role, createdAt
- [x] UserRepository with findByEmail()
- [x] UserService — field validation, email format check, duplicate prevention, BCrypt hashing
- [x] POST /api/auth/register endpoint
- [x] POST /api/auth/login endpoint
- [x] SecurityConfig — CORS, CSRF disabled, BCryptPasswordEncoder, permitAll on /api/auth/**

## Frontend — UI 
- [x] Landing page — CIT logo, StudyNook branding, Sign In / Sign Up buttons
- [x] Sign In page — Email + Password, maroon Login button, blue card border
- [x] Sign Up page — Email, First Name + Last Name, Password + Confirm Password
- [x] Dashboard — Welcome message, user info, maroon Logout button
- [x] Custom logout confirmation modal
- [x] Maroon/gold color scheme matching Figma design

## Submission
- [ ] Create GitHub repo: IT342-Ocampo-StudyNook
- [ ] Push code with commit: "IT342 Phase 1 – User Registration and Login Completed"
- [ ] Take 5 screenshots (register page, successful registration, login page, successful login, DB record)
- [ ] Create PDF: IT342_Phase1_StudyNook_Ocampo.pdf (GitHub link, commit hash, screenshots, summary)