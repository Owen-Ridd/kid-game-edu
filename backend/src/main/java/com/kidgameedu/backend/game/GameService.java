package com.kidgameedu.backend.game;

import java.util.List;

import com.kidgameedu.backend.exception.ResourceNotFoundException;
import com.kidgameedu.backend.model.Game;
import com.kidgameedu.backend.model.GameStatus;
import com.kidgameedu.backend.repository.GameRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public List<Game> findAll() {
        return gameRepository.findAll();
    }

    public Game findById(String id) {
        return gameRepository.findById(toObjectId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
    }

    public Game create(Game game) {
        game.setId(null);
        if (game.getStatus() == null) {
            game.setStatus(GameStatus.DRAFT);
        }
        return gameRepository.save(game);
    }

    public Game update(String id, Game changes) {
        Game game = findById(id);
        game.setTitle(changes.getTitle());
        game.setBuckets(changes.getBuckets());
        game.setItems(changes.getItems());
        if (changes.getStatus() != null) {
            game.setStatus(changes.getStatus());
        }
        return gameRepository.save(game);
    }

    public Game publish(String id) {
        Game game = findById(id);
        game.setStatus(GameStatus.PUBLISHED);
        return gameRepository.save(game);
    }

    public void delete(String id) {
        ObjectId objectId = toObjectId(id);
        if (!gameRepository.existsById(objectId)) {
            throw new ResourceNotFoundException("Game not found");
        }
        gameRepository.deleteById(objectId);
    }

    private ObjectId toObjectId(String id) {
        if (!ObjectId.isValid(id)) {
            throw new IllegalArgumentException("Invalid game id");
        }
        return new ObjectId(id);
    }
}