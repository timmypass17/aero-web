package com.example.aero.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public S3Service(S3Client s3Client, S3Presigner presigner) {
        this.s3Client = s3Client;
        this.presigner = presigner;
    }

    public String uploadFile(
            MultipartFile file,
            String keyPrefix
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        // S3 uses prefixes to organize objects into logical folders.
        String prefix = keyPrefix.replaceAll("^/+|/+$", "");
        String key = prefix + "/" + UUID.randomUUID();

        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

        try (var inputStream = file.getInputStream()) {
            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(
                            inputStream,
                            file.getSize()
                    )
            );
        }

        return key;
    }

    public String generatePresignedUrl(String key) {
        // I want to access this specific object in this specific S3 bucket.
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)   // stored in postgres, e.g. route-thumbnails/foo/bar.jpeg
                .build();

        // Create a temporary URL that allows someone to perform this GET operation for 10 minutes
        // URL works for 10 minutes, after thats, the url expires
        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(10))
                        // The temporary URL should give access to the object described by getObjectRequest
                        .getObjectRequest(getObjectRequest)
                        .build();

        // AWS SDK actually creates the signed URL
        PresignedGetObjectRequest presignedRequest =
                presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }
}