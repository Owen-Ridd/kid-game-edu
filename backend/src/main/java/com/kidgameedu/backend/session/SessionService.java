package com.kidgameedu.backend.session;

import java.security.SecureRandom;
import java.util.List;

import com.kidgameedu.backend.exception.ResourceNotFoundException;
import com.kidgameedu.backend.model.Game;
import com.kidgameedu.backend.model.Session;
import com.kidgameedu.backend.repository.GameRepository;
import com.kidgameedu.backend.repository.SessionRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    private static final int PIN_LENGTH = 6;
    private static final int PIN_BOUND = 1_000_000;

    private final SessionRepository sessionRepository;
    private final GameRepository gameRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public SessionService(SessionRepository sessionRepository, GameRepository gameRepository) {
        this.sessionRepository = sessionRepository;
        this.gameRepository = gameRepository;
    }

    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    public Session create(String gameId, String groupName) {
        ObjectId objectId = toObjectId(gameId);
        if (!gameRepository.existsById(objectId)) {
            throw new ResourceNotFoundException("Game not found");
        }

        Session session = new Session();
        session.setGameId(objectId);
        session.setGroupName(groupName);
        session.setPinCode(generateUniquePin());
        session.setMistakeCount(0);
        session.setActive(true);
        return sessionRepository.save(session);
    }

    public Session findActiveByPin(String pinCode) {
        return sessionRepository.findByPinCodeAndIsActiveTrue(pinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Active session not found"));
    }

    public Session incrementMistake(String pinCode) {
        Session session = findActiveByPin(pinCode);
        session.setMistakeCount(session.getMistakeCount() + 1);
        return sessionRepository.save(session);
    }

    public Session deactivate(String id) {
        if (!ObjectId.isValid(id)) {
            throw new IllegalArgumentException("Invalid session id");
        }
        Session session = sessionRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        session.setActive(false);
        return sessionRepository.save(session);
    }

    public Game gameForPin(String pinCode) {
        Session session = findActiveByPin(pinCode);
        return gameRepository.findById(session.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
    }

    private String generateUniquePin() {
        for (int attempt = 0; attempt < 20; attempt++) {
            String pin = String.format("%0" + PIN_LENGTH + "d", secureRandom.nextInt(PIN_BOUND));
            if (!sessionRepository.existsByPinCode(pin)) {
                return pin;
            }
        }
        throw new IllegalStateException("Unable to generate a unique session PIN");
    }

    private ObjectId toObjectId(String id) {
        if (!ObjectId.isValid(id)) {
            throw new IllegalArgumentException("Invalid game id");
        }
        return new ObjectId(id);
    }
}