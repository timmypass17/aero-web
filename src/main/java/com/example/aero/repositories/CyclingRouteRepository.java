package com.example.aero.repositories;

import com.example.aero.models.CyclingRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CyclingRouteRepository extends JpaRepository<CyclingRoute, UUID> {
}
