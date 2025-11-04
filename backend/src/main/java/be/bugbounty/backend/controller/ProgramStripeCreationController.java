package be.bugbounty.backend.controller;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.ProgramPaymentStripeService;
import com.stripe.exception.StripeException;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/programs")
public class ProgramStripeCreationController {

    private final ProgramPaymentStripeService service;

    public ProgramStripeCreationController(ProgramPaymentStripeService service) {
        this.service = service;
    }

    // Reçoit le contenu riche en JSON (pas de query string !)
    public static record CheckoutRequest(
            @NotBlank String title,
            @NotBlank String description
    ) {}

    // 1) Enregistrer un brouillon (PENDING) + créer la session Stripe
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CheckoutRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            Long programId = service.createDraftProgram(req.title(), req.description(), user);
            String url = service.createCheckoutSessionForProgram(programId, user);
            return ResponseEntity.ok(new CheckoutResponse(url));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Erreur Stripe: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur interne: " + e.getMessage());
        }
    }

    // 2) Stripe redirige → on valide le paiement et on APPROVE le programme déjà en base
    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam String sessionId) {
        try {
            AuditProgram program = service.confirmCheckoutSession(sessionId);
            return ResponseEntity.ok(new ConfirmResponse(program.getProgramId(), program.getTitle()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private record ConfirmResponse(Long id, String title) {}
    private record CheckoutResponse(String url) {}
}
