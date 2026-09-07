package com.example.aero.models;

import org.springframework.web.multipart.MultipartFile;

public class CyclingRouteRequest {

    private String name;

    private MultipartFile file;

    public String getName() {
        return name;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}
