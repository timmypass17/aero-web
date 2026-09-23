package com.example.aero.model;

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

    @Column(name = "description")
    private String description;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "duration")
    private Long duration; // duration in seconds

    @Column(name = "elevation_gain")
    private Double elevationGain;

    @Column(name = "thumbnail_key")
    private String thumbnailKey;

    @Column(name = "color")
    private String color;

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "gpx_data", columnDefinition = "BYTEA", nullable = false)
    private byte[] gpxData; // store .gpx as bytes TODO: store somewhere else? file system? supabase storage?

    @Column(
            name = "route_geometry",
            columnDefinition = "geography(LineString, 4326)"
    )
    private LineString routeGeometry; // object that contains an ordered list of coordinates

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

    public String getDescription() {
        return description;
    }

    public Double getDistance() {
        return distance;
    }

    public Long getDuration() {
        return duration;
    }

    public Double getElevationGain() {
        return elevationGain;
    }

    public UUID getUserId() {
        return user.getId();
    }

    public String getThumbnailKey() {
        return thumbnailKey;
    }

    public String getColor() {
        return color;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public void setThumbnailKey(String thumbnailKey) {
        this.thumbnailKey = thumbnailKey;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public void setElevationGain(Double elevationGain) {
        this.elevationGain = elevationGain;
    }
}
