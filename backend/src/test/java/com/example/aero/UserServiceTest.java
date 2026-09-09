package com.example.aero;

import com.example.aero.repositories.UserRepository;
import com.example.aero.models.User;
import com.example.aero.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock // use mock
    private UserRepository userRepository;

    @InjectMocks    // creates real UserService and inject it mock dependencies
    private UserService userService;

    @Test
    void getUser_returnsUser() {

        // Arrange
        String username = "timmy";
        String encodedPassword = "hashedPassword";

        User expectedUser = new User(1L, username, encodedPassword);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(expectedUser));

        // Act
        Optional<User> result = userService.getUser(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(expectedUser, result.get());
        assertEquals(1, result.get().getId());
        assertEquals("timmy", result.get().getUsername());
        assertEquals("hashedPassword", result.get().getPassword());

        // verify that findById(1) was called 1 time
        verify(userRepository).findById(1L);
    }

    @Test
    void getUser_returnsEmpty_whenUserDoesNotExist() {
        // Arrange
        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUser(999L);

        // Assert
        assertTrue(result.isEmpty());

        verify(userRepository).findById(999L);
    }
}
