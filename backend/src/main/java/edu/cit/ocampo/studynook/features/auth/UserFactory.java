package edu.cit.ocampo.studynook.features.auth;

public class UserFactory {

    public static User createUser(String firstName, String lastName, String email, String role) {
        User user = new User();
        user.setName(firstName + " " + lastName);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }
}