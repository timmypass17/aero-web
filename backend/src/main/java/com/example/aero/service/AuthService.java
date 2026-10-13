package com.example.aero.service;

import com.example.aero.repository.UserRepository;
import com.example.aero.exceptions.UsernameAlreadyExistsException;
import com.example.aero.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            S3Service s3Service
            ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.s3Service = s3Service;
    }

    public User signup(
            String firstName,
            String lastName,
            String username,
            String password,
            MultipartFile profilePicture
    ) throws IOException {
        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }

        // 1. Create the user first
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));

        // 2. Save the user to generate its UUID
        user = userRepository.save(user);

        // 3. Upload the profile picture using the generated user ID
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String pfpKey = s3Service.uploadFile(
                    profilePicture,
                    "profile-pictures/" + user.getId()
            );

            // 4. Store the S3 object key on the user
            user.setPfpKey(pfpKey);

            // 5. Save the updated user
            user = userRepository.save(user);
        }

        return user;
    }
}