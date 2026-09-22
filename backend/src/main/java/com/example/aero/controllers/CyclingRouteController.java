package com.example.aero.controllers;

import com.example.aero.dto.CyclingRouteResponse;
import com.example.aero.models.CyclingRoute;
import com.example.aero.models.CyclingRouteRequest;
import com.example.aero.services.CyclingRouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/routes")
public class CyclingRouteController {
    private final CyclingRouteService cyclingRouteService;

    @Autowired
    public CyclingRouteController(CyclingRouteService cyclingRouteService) {
        this.cyclingRouteService = cyclingRouteService;
    }

    // @ModelAttribute - binds HTTP request data (like form fields and query parameters) directly into a Java object
    // - In Spring, form data is read using @RequestParam or @ModelAttribute. @RequestBody is for text format like JSON/XML.
    // Spring Security sees the session cookie and automatically creates/populates Authentication
    @PostMapping
    public ResponseEntity<CyclingRoute> createRoute(
            @ModelAttribute CyclingRouteRequest request,
            Authentication authentication
    ) throws IOException {
        CyclingRoute savedRoute = cyclingRouteService.createRoute(
                request.getName(),
                request.getDescription(),
                request.getFile(),
                request.getThumbnail(),
                authentication.getName(),
                request.getColor(),
                request.getDifficulty()
        );
        return ResponseEntity.ok(savedRoute);
    }

    @GetMapping
    public ResponseEntity<List<CyclingRouteResponse>> getRoutes(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam double radius
    ) {
        List<CyclingRouteResponse> routes = cyclingRouteService.getRoutes(latitude, longitude, radius);
        return ResponseEntity.ok(routes);
    }

}
