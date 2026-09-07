package com.example.aero.controllers;

import com.example.aero.models.CyclingRoute;
import com.example.aero.models.CyclingRouteRequest;
import com.example.aero.services.CyclingRouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<Void> saveRoute(
            @ModelAttribute CyclingRouteRequest request,
            Authentication authentication
    ) throws IOException {
        cyclingRouteService.saveRoute(
                request.getFile(),
                request.getName(),
                authentication.getName(),
                request.getColor()
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CyclingRoute>> getRoutes(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam double radius
    ) {
        List<CyclingRoute> routes = cyclingRouteService.getRoutes(latitude, longitude, radius);
        return ResponseEntity.ok(routes);
    }
}
