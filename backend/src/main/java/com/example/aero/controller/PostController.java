package com.example.aero.controller;

import com.example.aero.dto.CreatePostRequest;
import com.example.aero.dto.PostResponse;
import com.example.aero.model.Post;
import com.example.aero.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @ModelAttribute CreatePostRequest request,
            Authentication authentication
    ) throws IOException {
        Post post = postService.createPost(
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(PostResponse.fromEntity(post));
    }
}