package edu.cit.ocampo.studynook.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.ocampo.studynook.entity.User;
import edu.cit.ocampo.studynook.service.UserService;

/**
 * REST API Controller for User Authentication
 * Handles user registration and login
 * 
 * Endpoints:
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login with email and password
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Register a new user
     * Required fields: name, email, password
     * 
     * @param user User object with name, email, and passwordHash
     * @return Registered user object or error message
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Login with email and password
     * 
     * @param loginData Map containing email and password
     * @return User object if login successful, error message otherwise
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");
            
            User user = userService.authenticate(email, password);

            if (user != null) {
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
