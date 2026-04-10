package edu.cit.ocampo.studynook.factory;

import edu.cit.ocampo.studynook.entity.User;

public class UserFactory {

    public static User createUser(String firstName, String lastName, String email, String role) {
        User user = new User();
        user.setName(firstName + " " + lastName);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }
}