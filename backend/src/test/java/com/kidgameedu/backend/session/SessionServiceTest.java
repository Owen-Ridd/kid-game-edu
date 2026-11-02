package com.kidgameedu.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.kidgameedu.backend.model.Game;
import com.kidgameedu.backend.model.Session;
import com.kidgameedu.backend.repository.GameRepository;
import com.kidgameedu.backend.repository.SessionRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private GameRepository gameRepository;

    private SessionService sessionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sessionService = new SessionService(sessionRepository, gameRepository);
    }

    @Test
    void createsUniqueSixDigitSessionPin() {
        ObjectId gameId = new ObjectId();
        when(gameRepository.existsById(gameId)).thenReturn(true);
        when(sessionRepository.existsByPinCode(any())).thenReturn(false);
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Session session = sessionService.create(gameId.toHexString(), "Sunflowers");

        assertThat(session.getPinCode()).matches("\\d{6}");
        assertThat(session.getGroupName()).isEqualTo("Sunflowers");
        assertThat(session.isActive()).isTrue();
    }

    @Test
    void incrementsMistakeCountForActiveSession() {
        Session session = new Session();
        session.setPinCode("123456");
        session.setMistakeCount(2);
        when(sessionRepository.findByPinCodeAndIsActiveTrue("123456")).thenReturn(Optional.of(session));
        when(sessionRepository.save(session)).thenReturn(session);

        Session updated = sessionService.incrementMistake("123456");

        assertThat(updated.getMistakeCount()).isEqualTo(3);
        verify(sessionRepository).save(session);
    }

    @Test
    void doesNotCreateSessionForUnknownGame() {
        ObjectId gameId = new ObjectId();
        when(gameRepository.existsById(gameId)).thenReturn(false);

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> sessionService.create(gameId.toHexString(), "Sunflowers"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Game not found");
        verify(sessionRepository, never()).save(any(Session.class));
    }
}