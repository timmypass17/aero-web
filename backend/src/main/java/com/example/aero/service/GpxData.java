package com.example.aero.service;

import org.locationtech.jts.geom.Coordinate;

import java.util.List;

public record GpxData(
        List<Coordinate> coordinates,
        double distance,
        double elevationGain,
        Long durationSeconds
) {
}