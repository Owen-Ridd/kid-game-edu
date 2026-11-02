package com.kidgameedu.backend.gameplay;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import com.kidgameedu.backend.model.Game;
import com.kidgameedu.backend.model.Session;
import com.kidgameedu.backend.session.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gameplay")
public class GameplayController {

    private final SessionService sessionService;

    public GameplayController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/sessions/{pinCode}")
    public Game gameForPin(@PathVariable String pinCode) {
        return sessionService.gameForPin(pinCode);
    }

    @PostMapping("/sessions/{pinCode}/mistakes")
    public Session recordMistake(@PathVariable String pinCode) {
        return sessionService.incrementMistake(pinCode);
    }

    @PostMapping("/sessions/validate")
    public ResponseEntity<GameplaySessionResponse> validate(@Valid @RequestBody PinRequest request) {
        Session session = sessionService.findActiveByPin(request.getPinCode());
        Game game = sessionService.gameForPin(request.getPinCode());
        return ResponseEntity.ok(new GameplaySessionResponse(session, game));
    }

    public static class PinRequest {
        @NotBlank
        private String pinCode;

        public String getPinCode() {
            return pinCode;
        }

        public void setPinCode(String pinCode) {
            this.pinCode = pinCode;
        }
    }

    public record GameplaySessionResponse(Session session, Game game) {
    }
}