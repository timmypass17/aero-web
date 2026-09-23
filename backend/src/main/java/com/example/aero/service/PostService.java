package com.example.aero.service;

import com.example.aero.dto.CreatePostRequest;
import com.example.aero.model.CyclingRoute;
import com.example.aero.model.Post;
import com.example.aero.model.RouteSource;
import com.example.aero.model.User;
import com.example.aero.repository.CyclingRouteRepository;
import com.example.aero.repository.PostRepository;
import com.example.aero.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CyclingRouteRepository cyclingRouteRepository;
    private final GpxParserService gpxParserService;
    private final GeometryFactory geometryFactory;

    public PostService(
            PostRepository postRepository,
            CyclingRouteRepository cyclingRouteRepository,
            UserRepository userRepository,
            GpxParserService gpxParserService,
            GeometryFactory geometryFactory
    ) {
        this.postRepository = postRepository;
        this.cyclingRouteRepository = cyclingRouteRepository;
        this.userRepository = userRepository;
        this.gpxParserService = gpxParserService;
        this.geometryFactory = geometryFactory;
    }

    @Transactional
    public Post createPost(
            CreatePostRequest request,
            String username
    ) throws IOException {

        validateRequest(request);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Post post = new Post();

        post.setUser(user);
        post.setContent(request.getContent());
        post.setStartTime(request.getStartDateTime());
        post.setEndTime(request.getEndDateTime());
        post.setRouteColor(request.getRouteColor());
        post.setCreatedAt(LocalDateTime.now());

        boolean isUsingExistingRoute = request.getRouteId() != null;
        if (isUsingExistingRoute) {
            createFromExistingRoute(post, request.getRouteId());
        } else {
            createFromGpx(post, request.getGpxFile());
        }

        return postRepository.save(post);
    }

    private void createFromExistingRoute(
            Post post,
            UUID routeId
    ) {

        CyclingRoute route = cyclingRouteRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found."));

        post.setRouteSource(RouteSource.EXISTING_ROUTE);
        post.setRoute(route);

        if (route.getRouteGeometry() != null) {

            LineString routeGeometry = (LineString) route
                    .getRouteGeometry()
                    .copy();
            routeGeometry.setSRID(4326);
            post.setRouteGeometry(routeGeometry);
        }

        // Reuse the statistics already calculated when the CyclingRoute was created.
        post.setDistance(route.getDistance());
        post.setElevationGain(route.getElevationGain());

        // Existing route already owns its GPX.
        post.setGpxData(null);
    }

    private void createFromGpx(
            Post post,
            MultipartFile gpxFile
    ) throws IOException {
        if (gpxFile == null || gpxFile.isEmpty()) {
            throw new IllegalArgumentException("GPX file is required.");
        }

        byte[] gpxBytes = gpxFile.getBytes();

        GpxData gpxData = gpxParserService.parseGpx(gpxBytes);

        post.setRouteSource(RouteSource.UPLOADED_GPX);
        // Store the original GPX incase user wants to download original gpx file
        post.setGpxData(gpxBytes);

        // Create LineString from GPX coordinates.
        LineString routeGeometry = geometryFactory.createLineString(
                gpxData.coordinates()
                        .toArray(new Coordinate[0])
        );
        post.setRouteGeometry(routeGeometry);

        // Distance, elevation derived from GPX file
        post.setDistance(gpxData.distance());
        post.setElevationGain(gpxData.elevationGain());

        // There is no CyclingRoute association for a directly uploaded GPX.
        post.setRoute(null);
    }

    private void validateRequest(CreatePostRequest request) {

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalArgumentException("Post content is required.");
        }

        boolean hasRouteId = request.getRouteId() != null;

        boolean hasGpx = request.getGpxFile() != null && !request.getGpxFile().isEmpty();

        // Exactly one route source.
        if (!hasRouteId && !hasGpx) {
            throw new IllegalArgumentException("Either routeId or gpxFile is required.");
        }

        if (hasRouteId && hasGpx) {
            throw new IllegalArgumentException("Provide either routeId or gpxFile, not both.");
        }

        if (request.getStartDateTime() == null || request.getEndDateTime() == null) {
            throw new IllegalArgumentException("Start and end times are required.");
        }

        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        if (request.getRouteColor() == null ||
                !request.getRouteColor().matches("^#[0-9A-Fa-f]{6}$")) {
            throw new IllegalArgumentException("Route color must be a valid hex color.");
        }
    }
}