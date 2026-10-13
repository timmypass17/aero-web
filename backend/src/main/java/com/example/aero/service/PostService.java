package com.example.aero.service;

import com.example.aero.dto.CreatePostRequest;
import com.example.aero.dto.GetPostResponse;
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
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CyclingRouteRepository cyclingRouteRepository;
    private final GpxParserService gpxParserService;
    private final GeometryFactory geometryFactory;
    private final S3Service s3Service;

    public PostService(
            PostRepository postRepository,
            CyclingRouteRepository cyclingRouteRepository,
            UserRepository userRepository,
            GpxParserService gpxParserService,
            GeometryFactory geometryFactory,
            S3Service s3Service
    ) {
        this.postRepository = postRepository;
        this.cyclingRouteRepository = cyclingRouteRepository;
        this.userRepository = userRepository;
        this.gpxParserService = gpxParserService;
        this.geometryFactory = geometryFactory;
        this.s3Service = s3Service;
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

        String routeThumbnailKey = null;
        MultipartFile routeThumbnail = request.getRouteThumbnail();
        if (routeThumbnail != null && !routeThumbnail.isEmpty()) {
            routeThumbnailKey = s3Service.uploadFile(
                    routeThumbnail,
                    "route-thumbnails/" + user.getId().toString()
            );
        }

        Post post = new Post();

        post.setUser(user);
        post.setContent(request.getContent());
        post.setStartTime(request.getStartDateTime());
        post.setEndTime(request.getEndDateTime());
        post.setRouteColor(request.getRouteColor());
        post.setCreatedAt(Instant.now());
        post.setRouteThumbnailKey(routeThumbnailKey);

        boolean isUsingExistingRoute = request.getRouteId() != null;
        if (isUsingExistingRoute) {
            createFromExistingRoute(post, request.getRouteId());
        } else {
            createFromGpx(post, request.getGpxFile());
        }

        return postRepository.save(post);
    }

    public List<GetPostResponse> getPosts() {
        return postRepository.findAllWithUserNewestFirst()
                .stream()
                .map(this::toResponse)  // map Post to GetPostResponse
                .toList();
    }

    private GetPostResponse toResponse(Post post) {
        User user = post.getUser();

        GetPostResponse response = new GetPostResponse();

        response.setId(post.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setUsername(user.getUsername());

        response.setProfilePictureUrl(
                user.getPfpKey() == null
                        ? null
                        : s3Service.generatePresignedUrl(user.getPfpKey())
        );

        response.setContent(post.getContent());

        response.setThumbnailUrl(
                post.getRouteThumbnailKey() == null
                        ? null
                        : s3Service.generatePresignedUrl(post.getRouteThumbnailKey())
        );


        response.setRouteId(post.getRoute() != null ? post.getRoute().getId() : null);
        response.setRouteColor(post.getRouteColor());
        response.setRouteSource(post.getRouteSource().name());
        response.setDistance(post.getDistance());
        response.setElevationGain(post.getElevationGain());

        Long durationSeconds = null;

        if (post.getStartTime() != null && post.getEndTime() != null) {
            durationSeconds = Duration.between(
                    post.getStartTime(),
                    post.getEndTime()
            ).getSeconds();
        }

        response.setDurationSeconds(durationSeconds);

        response.setStartTime(post.getStartTime());
        response.setEndTime(post.getEndTime());
        response.setCreatedAt(post.getCreatedAt());

        return response;
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