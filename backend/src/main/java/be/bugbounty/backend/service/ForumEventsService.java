// src/main/java/be/bugbounty/backend/service/ForumEventsService.java
package be.bugbounty.backend.service;

import be.bugbounty.backend.dto.forum.ForumMessageViewDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class ForumEventsService {

    public record ForumEvent(String type, Object payload) {} // type: CREATED | STATUS

    private final Set<SseEmitter> clients = new CopyOnWriteArraySet<>();

    public SseEmitter register() {
        SseEmitter emitter = new SseEmitter(0L); // pas de timeout
        clients.add(emitter);
        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> clients.remove(emitter));
        emitter.onError((e) -> clients.remove(emitter));

        // ping initial
        try { emitter.send(SseEmitter.event().name("ping").data("ok")); } catch (IOException ignored) {}
        return emitter;
    }

    public void broadcastCreated(ForumMessageViewDTO dto) {
        broadcast(new ForumEvent("CREATED", dto));
    }

    public void broadcastStatus(Long id, String status) {
        broadcast(new ForumEvent("STATUS", new StatusPayload(id, status)));
    }

    private void broadcast(ForumEvent evt) {
        clients.forEach(em -> {
            try {
                em.send(SseEmitter.event().name("message").data(evt));
            } catch (IOException e) {
                em.complete();
                clients.remove(em);
            }
        });
    }

    // petit payload pour STATUS
    public record StatusPayload(Long id, String status) {}
}
