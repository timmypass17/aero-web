package com.example.aero.service;

import com.example.aero.repository.UserRepository;
import com.example.aero.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> getUser(Long id) {
        return userRepository.findById(id);
    }
}
