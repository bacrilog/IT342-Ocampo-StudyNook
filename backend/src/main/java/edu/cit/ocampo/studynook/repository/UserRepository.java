package edu.cit.ocampo.studynook.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.ocampo.studynook.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
