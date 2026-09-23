package com.example.aero.service;

import com.example.aero.dto.CyclingRouteResponse;
import com.example.aero.model.CyclingRoute;
import com.example.aero.model.User;
import com.example.aero.repository.CyclingRouteRepository;
import com.example.aero.repository.UserRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class CyclingRouteService {

    private final CyclingRouteRepository cyclingRouteRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final GpxParserService gpxParserService;

    @Autowired
    public CyclingRouteService(
            CyclingRouteRepository cyclingRouteRepository,
            UserRepository userRepository,
            S3Service s3Service,
            GpxParserService gpxParserService
    ) {
        this.cyclingRouteRepository = cyclingRouteRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
        this.gpxParserService = gpxParserService;
    }

    public CyclingRoute createRoute(
            String name,
            String description,
            MultipartFile gpxFile,
            MultipartFile thumbnail,
            String username,
            String color,
            String difficulty
    ) throws IOException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String thumbnailKey = null;

        if (thumbnail != null && !thumbnail.isEmpty()) {
            thumbnailKey = s3Service.uploadThumbnail(
                    thumbnail,
                    user.getId().toString()
            );
        }

        byte[] gpxBytes = gpxFile.getBytes();

        // Parse GPX and calculate route information
        GpxData gpxData = gpxParserService.parseGpx(gpxBytes);

        // Create LineString
        GeometryFactory geometryFactory = new GeometryFactory();

        LineString routeGeometry = geometryFactory.createLineString(
                gpxData.coordinates().toArray(new Coordinate[0])
        );

        // WGS 84 longitude/latitude
        routeGeometry.setSRID(4326);

        // Create entity
        CyclingRoute route = new CyclingRoute();

        route.setName(name);
        route.setDescription(description);
        route.setGpxData(gpxBytes);
        route.setRouteGeometry(routeGeometry);
        route.setUser(user);
        route.setThumbnailKey(thumbnailKey);
        route.setColor(color);
        route.setDifficulty(difficulty);

        // Calculated from GPX
        route.setDistance(gpxData.distance());
        route.setElevationGain(gpxData.elevationGain());
        route.setDuration(gpxData.durationSeconds());

        return cyclingRouteRepository.save(route);
    }

    public List<CyclingRouteResponse> getRoutes(
            double latitude,
            double longitude,
            double radius
    ) {
        List<CyclingRoute> routes =
                cyclingRouteRepository.findNearbyRoutes(
                        latitude,
                        longitude,
                        radius
                );

        return routes.stream()
                .map(route -> {
                    CyclingRouteResponse response = new CyclingRouteResponse();

                    response.setId(route.getId());
                    response.setName(route.getName());
                    response.setDescription(route.getDescription());
                    response.setDistance(route.getDistance());
                    response.setDuration(route.getDuration());
                    response.setElevationGain(route.getElevationGain());
                    response.setColor(route.getColor());
                    response.setDifficulty(route.getDifficulty());
                    response.setCoordinates(route.getCoordinates());

                    if (route.getThumbnailKey() != null) {
                        response.setThumbnailUrl(
                                s3Service.generatePresignedUrl(
                                        route.getThumbnailKey()
                                )
                        );
                    }

                    return response;
                })
                .toList();
    }
}