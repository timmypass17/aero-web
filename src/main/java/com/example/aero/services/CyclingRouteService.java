package com.example.aero.services;

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
import org.w3c.dom.NodeList;

import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class CyclingRouteService {
    private final CyclingRouteRepository cyclingRouteRepository;
    private final UserRepository userRepository;

    @Autowired
    public CyclingRouteService(CyclingRouteRepository cyclingRouteRepository, UserRepository userRepository) {
        this.cyclingRouteRepository = cyclingRouteRepository;
        this.userRepository = userRepository;
    }

    public CyclingRoute saveRoute(
            MultipartFile file,
            String name,
            String username
    ) throws IOException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Parse GPX
        List<Coordinate> coordinates = parseGpx(file);

        // Create LineString
        GeometryFactory geometryFactory = new GeometryFactory();

        LineString routeGeometry = geometryFactory.createLineString(
                coordinates.toArray(new Coordinate[0])
        );

        // These coordinates are longitude/latitude coordinates using the WGS 84 coordinate system
        routeGeometry.setSRID(4326);

        // Create entity
        CyclingRoute route = new CyclingRoute();

        route.setName(name);
        route.setGpxData(file.getBytes());
        route.setRouteGeometry(routeGeometry);
        route.setUser(user);

        return cyclingRouteRepository.save(route);
    }

    private List<Coordinate> parseGpx(MultipartFile file) throws IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();

            Document document = builder.parse(file.getInputStream());

            NodeList trackPoints = document.getElementsByTagName("trkpt");

            List<Coordinate> coordinates = new ArrayList<>();

            for (int i = 0; i < trackPoints.getLength(); i++) {
                Element point = (Element) trackPoints.item(i);

                String lat = point.getAttribute("lat");
                String lon = point.getAttribute("lon");

                if (lat.isEmpty() || lon.isEmpty()) {
                    continue;
                }

                coordinates.add(
                        new Coordinate(
                                Double.parseDouble(lon),
                                Double.parseDouble(lat)
                        )
                );
            }

            if (coordinates.size() < 2) {
                throw new IllegalArgumentException(
                        "GPX file must contain at least two track points"
                );
            }

            return coordinates;

        } catch (ParserConfigurationException | SAXException e) {
            throw new IOException("Failed to parse GPX file", e);
        }
    }
}
