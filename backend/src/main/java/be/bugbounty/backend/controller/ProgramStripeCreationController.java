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

    // 1) Crée une session Stripe à partir du formulaire sans créer de programme
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestParam @NotBlank String title,
            @RequestParam @NotBlank String description,
            @AuthenticationPrincipal User user
    ) {
        try {
            String url = service.createCheckoutSessionBeforeCreation(title, description, user);
            return ResponseEntity.ok(new CheckoutResponse(url));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Erreur Stripe: " + e.getMessage());
        }
    }

    // 2) Stripe redirige ici (depuis /programs/return), on confirme et crée le programme
    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam String sessionId) {
        try {
            AuditProgram program = service.confirmCheckoutSessionAndCreate(sessionId);
            return ResponseEntity.ok(new ConfirmResponse(program.getProgramId(), program.getTitle()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private record ConfirmResponse(Long id, String title) {}

    private record CheckoutResponse(String url) {}
}
