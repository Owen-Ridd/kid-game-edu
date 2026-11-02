package com.kidgameedu.backend.config;

import java.util.Map;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final MongoTemplate mongoTemplate;

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public Map<String, String> health() {
        mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
        return Map.of("status", "UP", "database", "UP");
    }
}