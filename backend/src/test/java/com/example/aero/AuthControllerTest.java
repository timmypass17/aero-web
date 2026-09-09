package com.example.aero;

import com.example.aero.controllers.AuthController;
import com.example.aero.models.User;
import com.example.aero.services.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private SecurityContextRepository securityContextRepository;

    @Test
    void signup_returnsUser() throws Exception {

        User user = new User(
                1L,
                "timmy",
                "hashedPassword"
        );

        when(authService.signup("timmy", "password123"))
                .thenReturn(user);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                        "username": "timmy",
                        "password": "password123"
                    }
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("timmy"));

        verify(authService).signup(
                "timmy",
                "password123"
        );
    }

    @Test
    void login_returnsOk() throws Exception {

        Authentication authentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                        "username": "timmy",
                        "password": "password123"
                    }
                """))
                .andExpect(status().isOk());

        verify(authenticationManager)
                .authenticate(any());
    }

    @Test
    void login_returnsUnauthorized() throws Exception {

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "username": "timmy",
                    "password": "wrongpassword"
                }
            """))
                .andExpect(status().isUnauthorized());

        verify(authenticationManager)
                .authenticate(any());
    }

    @Test
    void me_returnsUsername() throws Exception {

        Authentication authentication = mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("timmy");

        mockMvc.perform(get("/auth/me")
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(content().string("timmy"));
    }
}
