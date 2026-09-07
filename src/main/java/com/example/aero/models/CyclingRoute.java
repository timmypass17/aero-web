package com.example.aero.models;

import jakarta.persistence.*;

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
}