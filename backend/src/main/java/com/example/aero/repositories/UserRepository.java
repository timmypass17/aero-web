package com.example.aero.repositories;

import com.example.aero.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA derived query methods
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}