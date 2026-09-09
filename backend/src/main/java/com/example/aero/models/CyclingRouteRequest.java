package com.example.aero.models;

import org.springframework.web.multipart.MultipartFile;

public class CyclingRouteRequest {

    private String name;
    private MultipartFile file;
    private String color;

    public String getName() {
        return name;
    }

    public MultipartFile getFile() {
        return file;
    }

    public String getColor() { return color; }

    public void setName(String name) {
        this.name = name;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public void setColor(String color) {
        this.color = color;
    }

}
