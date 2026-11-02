package com.kidgameedu.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    private String id;

    private String imageUrl;

    private String targetBucketId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getTargetBucketId() {
        return targetBucketId;
    }

    public void setTargetBucketId(String targetBucketId) {
        this.targetBucketId = targetBucketId;
    }
}