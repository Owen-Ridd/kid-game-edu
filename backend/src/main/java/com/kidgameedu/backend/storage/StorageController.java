package com.kidgameedu.backend.storage;

import java.io.IOException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/storage")
@ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "true")
public class StorageController {

    private final FileStorageService fileStorageService;

    public StorageController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorBody("File must not be empty"));
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(fileStorageService.upload(file));
        } catch (IOException | RuntimeException ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : "Upload failed";
            if (msg.length() > 250) msg = msg.substring(0, 250) + "...";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorBody("Cloudinary upload lỗi: " + msg
                            + " | Kiểm tra CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / CLOUDINARY_CLOUD_NAME trong .env"));
        }
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<?> delete(@PathVariable String publicId) {
        try {
            fileStorageService.delete(publicId);
            return ResponseEntity.noContent().build();
        } catch (IOException | RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorBody("Cloudinary delete lỗi: " + ex.getMessage()));
        }
    }

    record ErrorBody(String error) {}
}