package com.example.aero.dto;

import com.example.aero.model.Post;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

public class CreatePostResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String username;
    private String content;
    private String thumbnailUrl;
    private String routeSource;
    private UUID routeId;
    private String routeColor;
    private Double distance;
    private Double elevationGain;
    private Long durationSeconds;
    private Instant startTime;
    private Instant endTime;
    private Instant createdAt;

    public CreatePostResponse() {
    }

    public static CreatePostResponse fromEntity(Post post) {

        CreatePostResponse response = new CreatePostResponse();

        response.id = post.getId();

        response.firstName = post.getUser().getFirstName();

        response.lastName = post.getUser().getLastName();

        response.username =
                post.getUser().getUsername();

        response.content =
                post.getContent();

        response.thumbnailUrl = "thumbnail.jpg";

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

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getUsername() {
        return username;
    }

    public String getContent() {
        return content;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
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

    public Instant getStartTime() {
        return startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}