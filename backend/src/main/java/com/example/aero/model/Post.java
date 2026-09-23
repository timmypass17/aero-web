package com.example.aero.model;

import jakarta.persistence.*;
import org.locationtech.jts.geom.LineString;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /*
     * The user who created the post.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /*
     * Text body of the post.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /*
     * Determines where the route came from:
     *
     * EXISTING_ROUTE
     * UPLOADED_GPX
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "route_source", nullable = false)
    private RouteSource routeSource;

    /*
     * Existing saved route selected by the user.
     *
     * NULL when the user uploaded a GPX.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private CyclingRoute route;

    /*
     * Original GPX file.
     *
     * NULL when the user selected an existing route.
     */
    @Column(
            name = "gpx_data",
            columnDefinition = "bytea"
    )
    private byte[] gpxData;

    /*
     * Snapshot of the route geometry at the time
     * the post was created.
     *
     * PostGIS:
     * geography(LineString, 4326)
     */
    @Column(
            name = "route_geometry",
            columnDefinition = "geography(LineString, 4326)"
    )
    private LineString routeGeometry;

    /*
     * Color selected for displaying the route
     * on the post.
     */
    @Column(
            name = "route_color",
            nullable = false,
            length = 7
    )
    private String routeColor;

    /*
     * Total route distance in meters.
     */
    @Column(nullable = false)
    private Double distance;

    /*
     * Total positive elevation gain in meters.
     */
    @Column(name = "elevation_gain", nullable = false)
    private Double elevationGain;

    /*
     * When the ride started.
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /*
     * When the ride ended.
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /*
     * When this post was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Post() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public RouteSource getRouteSource() {
        return routeSource;
    }

    public void setRouteSource(RouteSource routeSource) {
        this.routeSource = routeSource;
    }

    public CyclingRoute getRoute() {
        return route;
    }

    public void setRoute(CyclingRoute route) {
        this.route = route;
    }

    public byte[] getGpxData() {
        return gpxData;
    }

    public void setGpxData(byte[] gpxData) {
        this.gpxData = gpxData;
    }

    public LineString getRouteGeometry() {
        return routeGeometry;
    }

    public void setRouteGeometry(LineString routeGeometry) {
        this.routeGeometry = routeGeometry;
    }

    public String getRouteColor() {
        return routeColor;
    }

    public void setRouteColor(String routeColor) {
        this.routeColor = routeColor;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Double getElevationGain() {
        return elevationGain;
    }

    public void setElevationGain(Double elevationGain) {
        this.elevationGain = elevationGain;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}