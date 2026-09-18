package com.example.aero.models;

import org.springframework.web.multipart.MultipartFile;

public class CyclingRouteRequest {

    private String name;
    private String description;
    private MultipartFile file;
    private String color;
    private String difficulty;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public MultipartFile getFile() {
        return file;
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

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}