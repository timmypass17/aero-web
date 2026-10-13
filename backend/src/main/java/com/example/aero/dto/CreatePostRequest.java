package com.example.aero.dto;

import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

public class CreatePostRequest {

    private String content;

    private UUID routeId;

    private MultipartFile gpxFile;

    private Instant startDateTime;

    private Instant endDateTime;

    private String routeColor;

    private MultipartFile routeThumbnail;

    public CreatePostRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public UUID getRouteId() {
        return routeId;
    }

    public void setRouteId(UUID routeId) {
        this.routeId = routeId;
    }

    public MultipartFile getGpxFile() {
        return gpxFile;
    }

    public void setGpxFile(MultipartFile gpxFile) {
        this.gpxFile = gpxFile;
    }

    public Instant getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(Instant startDateTime) {
        this.startDateTime = startDateTime;
    }

    public Instant getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(Instant endDateTime) {
        this.endDateTime = endDateTime;
    }

    public String getRouteColor() {
        return routeColor;
    }

    public void setRouteColor(String routeColor) {
        this.routeColor = routeColor;
    }

    public MultipartFile getRouteThumbnail() {
        return routeThumbnail;
    }

    public void setRouteThumbnail(MultipartFile routeThumbnail) {
        this.routeThumbnail = routeThumbnail;
    }
}