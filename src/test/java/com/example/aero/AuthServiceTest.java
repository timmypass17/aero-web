package com.example.aero;

import com.example.aero.daos.UserRepository;
import com.example.aero.models.User;
import com.example.aero.services.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void signup_createsUser() {
        // Arrange
        String username = "timmy";
        String password = "password123";
        String encodedPassword = "hashedPassword";

        when(userRepository.existsByUsername(username))
                .thenReturn(false);

        when(passwordEncoder.encode(password))
                .thenReturn(encodedPassword);

        User savedUser = new User(1L, username, encodedPassword);

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        // Act
        User result = authService.signup(username, password);

        // Assert
        assertEquals(1L, result.getId());
        assertEquals("timmy", result.getUsername());
        assertEquals("hashedPassword", result.getPassword());

        verify(userRepository).existsByUsername(username);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class));
    }
}
