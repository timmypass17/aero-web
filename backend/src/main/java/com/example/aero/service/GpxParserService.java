package com.example.aero.service;

import org.locationtech.jts.geom.Coordinate;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class GpxParserService {
    private static final double EARTH_RADIUS_METERS = 6_371_000;

    public GpxData parseGpx(byte[] gpxBytes) throws IOException {

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new ByteArrayInputStream(gpxBytes));

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

                Coordinate coordinate = new Coordinate(longitude, latitude);
                coordinates.add(coordinate);

                // Increment distance
                if (previousCoordinate != null) {
                    totalDistance += calculateDistance(
                            previousCoordinate.y,
                            previousCoordinate.x,
                            coordinate.y,
                            coordinate.x
                    );
                }

                previousCoordinate = coordinate;

                // Increment elevation
                Element elevationElement = getChildElement(point, "ele");

                if (elevationElement != null) {
                    double elevation = Double.parseDouble(elevationElement.getTextContent());

                    if (previousElevation != null && elevation > previousElevation) {
                        elevationGain += elevation - previousElevation;
                    }

                    previousElevation = elevation;
                }

                // Increment time
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
                durationSeconds = Duration.between(startTime, endTime).getSeconds();
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

    /**
     * Calculates distance between two latitude/longitude points
     * using the Haversine formula.
     *
     * @return distance in meters
     */
    private double calculateDistance(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2
    ) {
        double lat1 = Math.toRadians(latitude1);
        double lat2 = Math.toRadians(latitude2);
        double deltaLat = Math.toRadians(latitude2 - latitude1);
        double deltaLon = Math.toRadians(longitude2 - longitude1);
        double a =
                Math.sin(deltaLat / 2)
                        * Math.sin(deltaLat / 2)
                        +
                        Math.cos(lat1)
                                * Math.cos(lat2)
                                * Math.sin(deltaLon / 2)
                                * Math.sin(deltaLon / 2);
        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS_METERS * c;
    }

    private Element getChildElement(
            Element parent,
            String name
    ) {
        NodeList children = parent.getElementsByTagName(name);

        if (children.getLength() == 0) {
            return null;
        }

        return (Element) children.item(0);
    }
}