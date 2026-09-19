package com.example.aero.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    private final String bucketName = "aero-route-images-timmy";

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadThumbnail(
            MultipartFile thumbnail,
            String userId
    ) throws IOException {

        String extension = "";

        if (thumbnail.getOriginalFilename() != null) {
            extension = thumbnail.getOriginalFilename()
                    .substring(thumbnail.getOriginalFilename().lastIndexOf("."));
        }

        String key =
                "route-thumbnails/"
                        + userId
                        + "/"
                        + UUID.randomUUID()
                        + extension;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(thumbnail.getContentType())
                .build();

        s3Client.putObject(
                request,
                RequestBody.fromInputStream(
                        thumbnail.getInputStream(),
                        thumbnail.getSize()
                )
        );

        return key;
    }
}