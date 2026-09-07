package com.example.aero.services;

import com.example.aero.repositories.UserRepository;
import com.example.aero.exceptions.UsernameAlreadyExistsException;
import com.example.aero.models.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(password));

        return userRepository.save(user);
    }
}