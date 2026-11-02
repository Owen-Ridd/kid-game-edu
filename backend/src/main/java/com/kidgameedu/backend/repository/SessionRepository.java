package com.kidgameedu.backend.repository;

import java.util.Optional;

import com.kidgameedu.backend.model.Session;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SessionRepository extends MongoRepository<Session, ObjectId> {

    Optional<Session> findByPinCodeAndIsActiveTrue(String pinCode);

    Optional<Session> findByPinCode(String pinCode);

    boolean existsByPinCode(String pinCode);
}