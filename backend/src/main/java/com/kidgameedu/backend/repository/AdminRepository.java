package com.kidgameedu.backend.repository;

import java.util.Optional;

import com.kidgameedu.backend.model.Admin;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminRepository extends MongoRepository<Admin, ObjectId> {

    Optional<Admin> findByUsername(String username);
}