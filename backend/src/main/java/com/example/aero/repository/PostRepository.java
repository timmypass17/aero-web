package com.example.aero.repository;

import com.example.aero.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Post> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT p
        FROM Post p
        JOIN FETCH p.user
        ORDER BY p.createdAt DESC
        """)
    List<Post> findAllWithUserNewestFirst();
}