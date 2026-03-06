package edu.cit.ocampo.studynook.service;

import edu.cit.ocampo.studynook.entity.User;
import edu.cit.ocampo.studynook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register a new user with validation
     * Validates required fields and prevents duplicate email registration
     */
    public User registerUser(User user) {
        // Validate required fields
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        // Validate email format
        if (!user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("Invalid email format");
        }

        // Prevent duplicate email registration
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered. Please use a different email.");
        }

        // Store password securely (hashed with BCrypt)
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        
        // Set role (use provided role or default to USER)
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        }
        
        // Set creation timestamp
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    /**
     * Authenticate user with email and password
     * Returns user object if credentials are valid, null otherwise
     */
    public User authenticate(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return userOpt.get();
        }
        return null;
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
