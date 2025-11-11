package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.UserRankingDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
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

    // on garde la "taille désirée" par client pour le SSE
    private static class Client {
        final SseEmitter emitter;
        final int size;
        final String role;
        Client(SseEmitter emitter, int size, String role) {
            this.emitter = emitter; this.size = size; this.role = role;
        }
    }
    private final CopyOnWriteArrayList<Client> clients = new CopyOnWriteArrayList<>();

    /**
     * GET /api/rankings?page=0&size=50&role=researcher
     * Tri descendant par points, taille bornée [1..200]
     */
    @GetMapping
    public List<UserRankingDTO> getTopResearchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "researcher") String role
    ) {
        size = clamp(size, 1, 200);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "point"));
        return userRepository.findByRole(role, pageable)
                .getContent()
                .stream()
                .map(this::toRankingDTO)
                .toList();
    }

    /**
     * SSE initial + mises à jour
     * GET /api/rankings/stream?size=50&role=researcher
     */
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "researcher") String role
    ) {
        size = clamp(size, 1, 200);
        SseEmitter emitter = new SseEmitter(0L);
        Client client = new Client(emitter, size, role);
        clients.add(client);

        emitter.onTimeout(() -> clients.remove(client));
        emitter.onCompletion(() -> clients.remove(client));
        emitter.onError(e -> clients.remove(client));

        sendSnapshot(client);
        return emitter;
    }

    /** À appeler quand le classement change (ex: points modifiés) */
    public void broadcastRanking() {
        clients.forEach(c -> {
            try {
                List<UserRankingDTO> snapshot = currentSnapshot(c.size, c.role);
                c.emitter.send(SseEmitter.event().name("ranking").data(snapshot));
            } catch (IOException e) {
                c.emitter.complete();
                clients.remove(c);
            }
        });
    }

    // ===== Helpers =====

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    private UserRankingDTO toRankingDTO(User u) {
        return new UserRankingDTO(u.getUserId(), u.getUsername(), u.getPoint(), u.getProfilePhoto());
    }

    private List<UserRankingDTO> currentSnapshot(int size, String role) {
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "point"));
        return userRepository.findByRole(role, pageable)
                .getContent()
                .stream()
                .map(this::toRankingDTO)
                .toList();
    }

    private void sendSnapshot(Client client) {
        try {
            client.emitter.send(SseEmitter.event().name("ranking").data(currentSnapshot(client.size, client.role)));
        } catch (IOException e) {
            client.emitter.complete();
            clients.remove(client);
        }
    }
}
