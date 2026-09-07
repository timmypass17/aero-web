package com.example.aero.configs;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    // Tells Spring how passwords should be hashed and checked.
    // BCrypt is used to hash passwords.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Manages the authentication process.
    // Used by AuthController when a user logs in.
    // Handles username/password authentication
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // Tells Spring Security to store the user's authentication
    // in the HTTP session.
    //
    // This is what allows the user to remain logged in
    // between requests.
    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    // Defines Spring Security's security rules.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // Enable CORS so React (localhost:5173)
            // can communicate with Spring Boot (localhost:8080).
            .cors(cors -> {
            })

            // Disable CSRF protection.
            // Commonly disabled for a simple REST API during development.
            .csrf(csrf -> csrf.disable())

            // Define which endpoints require authentication.
            .authorizeHttpRequests(auth -> auth

                    // Anyone can create an account.
                    .requestMatchers(
                            HttpMethod.POST,
                            "/auth/signup"
                    ).permitAll()

                    // Anyone can attempt to log in.
                    .requestMatchers(
                            HttpMethod.POST,
                            "/auth/login"
                    ).permitAll()

                    // Anyone can log out.
                    .requestMatchers(
                            "/auth/logout"
                    ).permitAll()
                    .requestMatchers(
                            "/auth/me"
                    ).authenticated()
                    // Every other endpoint requires the user
                    // to be authenticated.
                    .anyRequest().authenticated()
            )

            // Configure Spring Security's logout functionality.
            .logout(logout -> logout

                    // POST /auth/logout will log the user out.
                    .logoutUrl("/auth/logout")

                    // Allow the logout request.
                    .permitAll()
            );

        return http.build();
    }

    // Defines which frontend origins are allowed
    // to communicate with the backend.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests coming from the React frontend.
        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        // HTTP methods React is allowed to use.
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allow all request headers.
        configuration.setAllowedHeaders(
                List.of("*")
        );

        // Allow cookies to be sent between
        // React and Spring Boot.
        //
        // This is important because JSESSIONID
        // is used for the Spring Security session.
        configuration.setAllowCredentials(true);

        // Create the CORS configuration source.
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Apply this CORS configuration to all endpoints.
        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}