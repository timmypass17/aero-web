package com.example.aero.services;

import com.example.aero.dto.CyclingRouteResponse;
import com.example.aero.models.CyclingRoute;
import com.example.aero.models.User;
import com.example.aero.repositories.CyclingRouteRepository;
import com.example.aero.repositories.UserRepository;
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

    @Autowired
    public CyclingRouteService(
            CyclingRouteRepository cyclingRouteRepository,
            UserRepository userRepository,
            S3Service s3Service
    ) {
        this.cyclingRouteRepository = cyclingRouteRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
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

        // Parse GPX and calculate route information
        GpxData gpxData = parseGpx(gpxFile);

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
        route.setGpxData(gpxFile.getBytes());
        route.setRouteGeometry(routeGeometry);
        route.setUser(user);
        route.setThumbnailKey(thumbnailKey);
        route.setColor(color);
        route.setDifficulty(difficulty);

        // Calculated from GPX
        route.setDistance(gpxData.distance());
        route.setElevationGain(gpxData.elevationGain());
        route.setDuration(gpxData.duration());

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

    private GpxData parseGpx(MultipartFile file) throws IOException {

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();

            Document document = builder.parse(file.getInputStream());

            NodeList trackPoints = document.getElementsByTagName("trkpt");

            List<Coordinate> coordinates = new ArrayList<>();

            double totalDistance = 0.0;
            double elevationGain = 0.0;

            Instant startTime = null;
            Instant endTime = null;

            Coordinate previousCoordinate = null;
            Double previousElevation = null;

            for (int i = 0; i < trackPoints.getLength(); i++) {

                Element point = (Element) trackPoints.item(i);

                String lat = point.getAttribute("lat");
                String lon = point.getAttribute("lon");

                if (lat.isEmpty() || lon.isEmpty()) {
                    continue;
                }

                double latitude = Double.parseDouble(lat);
                double longitude = Double.parseDouble(lon);

                Coordinate coordinate = new Coordinate(
                        longitude,
                        latitude
                );

                coordinates.add(coordinate);

                // -------------------------
                // Distance
                // -------------------------

                if (previousCoordinate != null) {
                    totalDistance += calculateDistance(
                            previousCoordinate.y,
                            previousCoordinate.x,
                            coordinate.y,
                            coordinate.x
                    );
                }

                previousCoordinate = coordinate;

                // -------------------------
                // Elevation
                // -------------------------

                Element elevationElement = getChildElement(point, "ele");

                if (elevationElement != null) {
                    double elevation =
                            Double.parseDouble(elevationElement.getTextContent());

                    if (previousElevation != null && elevation > previousElevation) {
                        elevationGain += elevation - previousElevation;
                    }

                    previousElevation = elevation;
                }

                // -------------------------
                // Duration
                // -------------------------

                Element timeElement = getChildElement(point, "time");

                if (timeElement != null) {
                    Instant time = Instant.parse(timeElement.getTextContent());

                    if (startTime == null) {
                        startTime = time;
                    }

                    endTime = time;
                }
            }

            if (coordinates.size() < 2) {
                throw new IllegalArgumentException(
                        "GPX file must contain at least two track points"
                );
            }

            Long durationSeconds = null;

            if (startTime != null && endTime != null) {
                durationSeconds = Duration.between(
                        startTime,
                        endTime
                ).getSeconds();
            }

            return new GpxData(
                    coordinates,
                    totalDistance,
                    elevationGain,
                    durationSeconds
            );

        } catch (ParserConfigurationException | SAXException e) {
            throw new IOException("Failed to parse GPX file", e);
        }
    }

    private Element getChildElement(Element parent, String tagName) {

        NodeList nodes = parent.getElementsByTagName(tagName);

        if (nodes.getLength() == 0) {
            return null;
        }

        return (Element) nodes.item(0);
    }

    /**
     * Calculates distance between two latitude/longitude points
     * using the Haversine formula.
     *
     * @return distance in meters
     */
    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2
    ) {
        final double EARTH_RADIUS = 6_371_000;

        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);

        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                        + Math.cos(lat1Rad)
                        * Math.cos(lat2Rad)
                        * Math.sin(deltaLon / 2)
                        * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
        );

        return EARTH_RADIUS * c;
    }

    private record GpxData(
            List<Coordinate> coordinates,
            Double distance,
            Double elevationGain,
            Long duration
    ) {
    }
}