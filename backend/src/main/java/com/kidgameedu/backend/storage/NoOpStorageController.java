package com.kidgameedu.backend.storage;

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

/**
 * Fallback controller when Cloudinary is disabled (cloudinary.enabled=false).
 * Returns HTTP 503 with a clear Vietnamese error message instead of crashing.
 */
@RestController
@RequestMapping("/api/admin/storage")
@ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpStorageController {

    private static final String MSG =
            "Upload ảnh chưa được bật. Để dùng tính năng này, hãy điền đủ " +
            "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào file .env " +
            "và đặt CLOUDINARY_ENABLED=true, sau đó khởi động lại backend.";

    @PostMapping("/upload")
    public ResponseEntity<ErrorBody> upload(@RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ErrorBody(MSG));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ErrorBody> delete(@PathVariable String publicId) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ErrorBody(MSG));
    }

    record ErrorBody(String error) {}
}
