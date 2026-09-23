package com.example.aero.dto;

import com.example.aero.model.Post;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

public class PostResponse {

    private UUID id;

    private String username;

    private String content;

    private String routeSource;

    private UUID routeId;

    private String routeColor;

    private Double distance;

    private Double elevationGain;

    private Long durationSeconds;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime createdAt;

    public PostResponse() {
    }

    public static PostResponse fromEntity(Post post) {

        PostResponse response = new PostResponse();

        response.id = post.getId();

        response.username =
                post.getUser().getUsername();

        response.content =
                post.getContent();

        response.routeSource =
                post.getRouteSource().name();

        if (post.getRoute() != null) {
            response.routeId =
                    post.getRoute().getId();
        }

        response.routeColor =
                post.getRouteColor();

        response.distance =
                post.getDistance();

        response.elevationGain =
                post.getElevationGain();

        response.startTime =
                post.getStartTime();

        response.endTime =
                post.getEndTime();

        response.createdAt =
                post.getCreatedAt();

        response.durationSeconds =
                Duration.between(
                        post.getStartTime(),
                        post.getEndTime()
                ).getSeconds();

        return response;
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getContent() {
        return content;
    }

    public String getRouteSource() {
        return routeSource;
    }

    public UUID getRouteId() {
        return routeId;
    }

    public String getRouteColor() {
        return routeColor;
    }

    public Double getDistance() {
        return distance;
    }

    public Double getElevationGain() {
        return elevationGain;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}