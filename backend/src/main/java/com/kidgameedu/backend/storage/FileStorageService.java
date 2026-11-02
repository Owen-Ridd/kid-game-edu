package com.kidgameedu.backend.storage;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    StoredFile upload(MultipartFile file) throws IOException;

    void delete(String publicId) throws IOException;

    record StoredFile(String url, String publicId) {
    }
}