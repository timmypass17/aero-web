package com.example.aero.controller;

import com.example.aero.dto.CreatePostRequest;
import com.example.aero.dto.CreatePostResponse;
import com.example.aero.dto.GetPostResponse;
import com.example.aero.model.Post;
import com.example.aero.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<CreatePostResponse> createPost(
            @ModelAttribute CreatePostRequest request,
            Authentication authentication
    ) throws IOException {
        Post post = postService.createPost(
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CreatePostResponse.fromEntity(post));
    }

    @GetMapping
    public ResponseEntity<Page<GetPostResponse>> getPosts(
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        return ResponseEntity.ok(postService.getPosts(pageable));
    }
}