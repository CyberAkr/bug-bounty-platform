package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.UserRankingDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final UserRepository userRepository;
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping
    public List<UserRankingDTO> getTopResearchers() {
        // rôle en minuscule pour matcher tes données
        return userRepository.findTop10ByRoleOrderByPointDesc("researcher")
                .stream()
                .map(this::toRankingDTO)
                .toList();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));
        sendSnapshot(emitter);
        return emitter;
    }

    // Appelle ceci quand les points changent (validation rapport, reward, …)
    public void broadcastRanking() {
        List<UserRankingDTO> snapshot = currentSnapshot();
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().name("ranking").data(snapshot));
            } catch (IOException e) {
                emitter.complete();
                emitters.remove(emitter);
            }
        });
    }

    private UserRankingDTO toRankingDTO(User u) {
        return new UserRankingDTO(u.getUserId(), u.getUsername(), u.getPoint(), u.getProfilePhoto());
    }

    private List<UserRankingDTO> currentSnapshot() {
        return userRepository.findTop10ByRoleOrderByPointDesc("researcher")
                .stream()
                .map(this::toRankingDTO)
                .toList();
    }

    private void sendSnapshot(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("ranking").data(currentSnapshot()));
        } catch (IOException e) {
            emitter.complete();
            emitters.remove(emitter);
        }
    }
}
