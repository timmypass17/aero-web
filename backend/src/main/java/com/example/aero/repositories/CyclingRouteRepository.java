package com.example.aero.repositories;

import com.example.aero.models.CyclingRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CyclingRouteRepository extends JpaRepository<CyclingRoute, UUID> {

    @Query(value = """
        SELECT *
        FROM cycling_routes
        WHERE ST_DWithin(
            route_geometry::geography,
            ST_SetSRID(
                ST_MakePoint(:longitude, :latitude),
                4326
            )::geography,
            :radius
        )
        """, nativeQuery = true)
    List<CyclingRoute> findNearbyRoutes(
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("radius") double radius
    );
}
