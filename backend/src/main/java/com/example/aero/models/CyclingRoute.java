package com.example.aero.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.locationtech.jts.geom.LineString;

@Entity
@Table(name = "cycling_routes")
public class CyclingRoute {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "name")
    private String name;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "elevation_gain")
    private Double elevationGain;

    @Column(name = "color")
    private String color;

    @Column(name = "gpx_data", columnDefinition = "BYTEA", nullable = false)
    private byte[] gpxData; // store .gpx as bytes TODO: store somewhere else? file system? supabase storage?

    @Column(
            name = "route_geometry",
            columnDefinition = "geography(LineString, 4326)"
    )
    private LineString routeGeometry;   // object that contains an ordered list of coordinates

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public CyclingRoute() {
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    // Prevent Jackson from serializing this object
    // note: Jackson uses getters when serializing Java objects into JSON
    @JsonIgnore
    public LineString getRouteGeometry() {
        return routeGeometry;
    }

    public List<List<Double>> getCoordinates() {
        return Arrays.stream(routeGeometry.getCoordinates())
                .map(coordinate -> List.of(
                        coordinate.getX(), // longitude
                        coordinate.getY()  // latitude
                ))
                .toList();
    }

    public Double getDistance() {
        return distance;
    }

    public Double getElevationGain() {
        return elevationGain;
    }

    public UUID getUserId() {
        return user.getId();
    }

    public String getColor() {
        return color;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setGpxData(byte[] bytes) {
        this.gpxData = bytes;
    }

    public void setRouteGeometry(LineString routeGeometry) {
        this.routeGeometry = routeGeometry;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setColor(String color) {
        this.color = color;
    }
}