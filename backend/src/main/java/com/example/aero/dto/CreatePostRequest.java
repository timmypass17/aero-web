package com.example.aero.dto;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

public class CreatePostRequest {

    private String content;

    private UUID routeId;

    private MultipartFile gpxFile;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

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

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
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