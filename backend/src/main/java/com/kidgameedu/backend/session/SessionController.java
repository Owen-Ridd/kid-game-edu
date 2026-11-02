package com.kidgameedu.backend.session;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.kidgameedu.backend.model.Session;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public List<Session> findAll() {
        return sessionService.findAll();
    }

    @PostMapping
    public ResponseEntity<Session> create(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.create(request.getGameId(), request.getGroupName()));
    }

    @PostMapping("/{id}/deactivate")
    public Session deactivate(@PathVariable String id) {
        return sessionService.deactivate(id);
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CreateSessionRequest {
        @NotBlank
        private String gameId;

        @NotBlank
        private String groupName;

        public String getGameId() {
            return gameId;
        }

        public String getGroupName() {
            return groupName;
        }
    }
}