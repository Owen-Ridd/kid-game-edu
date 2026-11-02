package com.kidgameedu.backend.config;

import java.util.List;

import com.kidgameedu.backend.model.Bucket;
import com.kidgameedu.backend.model.Game;
import com.kidgameedu.backend.model.GameStatus;
import com.kidgameedu.backend.model.Item;
import com.kidgameedu.backend.model.Session;
import com.kidgameedu.backend.repository.GameRepository;
import com.kidgameedu.backend.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataSeedConfig {

    @Bean
    CommandLineRunner seedDemoData(
            GameRepository gameRepository,
            SessionRepository sessionRepository,
            @Value("${app.demo-seed-enabled:false}") boolean enabled) {
        return args -> {
            if (!enabled) {
                return;
            }

            // Always ensure the Dry Ice Safety game exists
            Game game = gameRepository.findAll().stream()
                .filter(candidate -> "Bài học an toàn Đá Khô".equals(candidate.getTitle()) || "Fruit sorting".equals(candidate.getTitle()))
                .findFirst()
                .orElseGet(() -> gameRepository.save(createDemoGame()));

            // Update to latest dry ice structure if needed
            if (!"Bài học an toàn Đá Khô".equals(game.getTitle()) || game.getItems().size() != 6) {
                game.setTitle("Bài học an toàn Đá Khô");
                game.setStatus(GameStatus.PUBLISHED);
                game.setBuckets(List.of(bucket("basket-da-kho", "/images/da-kho.png")));
                game.setItems(List.of(
                    item("thuc-pham", "/images/bao-quan-thuc-pham.jpg", "basket-da-kho"),
                    item("kem", "/images/bao-quan-kem.jpg", "basket-da-kho"),
                    item("khoi", "/images/tao-khoi-san-khau.jpg", "basket-da-kho"),
                    item("vac-xin", "/images/bao-quan-vac-xin.jpg", "basket-da-kho"),
                    item("khong-cham", "/images/khong-cham-vao.jpg", "khong-thuoc-ro"),
                    item("khong-an", "/images/khong-duoc-an.jpg", "khong-thuoc-ro")
                ));
                game = gameRepository.save(game);
            }

            if (sessionRepository.findByPinCode("123456").isEmpty()) {
                Session session = new Session();
                session.setGameId(game.getId());
                session.setPinCode("123456");
                session.setGroupName("Lớp Khoa Học Khám Phá");
                session.setMistakeCount(0);
                session.setActive(true);
                sessionRepository.save(session);
            }
        };
    }

    private Game createDemoGame() {
        Game game = new Game();
        game.setTitle("Bài học an toàn Đá Khô");
        game.setStatus(GameStatus.PUBLISHED);
        game.setBuckets(List.of(bucket("basket-da-kho", "/images/da-kho.png")));
        game.setItems(List.of(
            item("thuc-pham", "/images/bao-quan-thuc-pham.jpg", "basket-da-kho"),
            item("kem", "/images/bao-quan-kem.jpg", "basket-da-kho"),
            item("khoi", "/images/tao-khoi-san-khau.jpg", "basket-da-kho"),
            item("vac-xin", "/images/bao-quan-vac-xin.jpg", "basket-da-kho"),
            item("khong-cham", "/images/khong-cham-vao.jpg", "khong-thuoc-ro"),
            item("khong-an", "/images/khong-duoc-an.jpg", "khong-thuoc-ro")
        ));
        return game;
    }

    private Bucket bucket(String id, String imageUrl) {
        Bucket bucket = new Bucket();
        bucket.setId(id);
        bucket.setImageUrl(imageUrl);
        return bucket;
    }

    private Item item(String id, String imageUrl, String targetBucketId) {
        Item item = new Item();
        item.setId(id);
        item.setImageUrl(imageUrl);
        item.setTargetBucketId(targetBucketId);
        return item;
    }
}
