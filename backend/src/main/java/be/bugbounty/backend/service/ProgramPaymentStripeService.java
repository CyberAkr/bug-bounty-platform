package be.bugbounty.backend.service;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.ProgramPayment;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.AuditProgramRepository;
import be.bugbounty.backend.repository.ProgramPaymentRepository;
import be.bugbounty.backend.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ProgramPaymentStripeService {

    private final ProgramPaymentRepository paymentRepo;
    private final AuditProgramRepository programRepo;
    private final UserRepository userRepo;

    @Value("${stripe.program-price:10000}")
    private long priceInCents;

    @Value("${frontend.url:http://localhost:4200}")
    private String frontendUrl;

    public ProgramPaymentStripeService(
            ProgramPaymentRepository paymentRepo,
            AuditProgramRepository programRepo,
            UserRepository userRepo,
            @Value("${stripe.secret-key:${stripe.secret.key:}}") String secretKey
    ) {
        this.paymentRepo = paymentRepo;
        this.programRepo = programRepo;
        this.userRepo = userRepo;
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
        }
    }

    /** Crée une session Stripe Checkout AVANT création du programme */
    public String createCheckoutSessionBeforeCreation(String title, String description, User user) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/programs/return?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/programs/cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount(priceInCents)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Publication d’un programme d’audit")
                                        .build())
                                .build())
                        .build())
                .putMetadata("title", title)
                .putMetadata("description", description)
                .putMetadata("companyId", String.valueOf(user.getUserId()))
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    /** Rappel de Stripe → vérifier paiement et créer le programme en BDD */
    public AuditProgram confirmCheckoutSessionAndCreate(String sessionId) throws StripeException {
        System.out.println("➡️ [STRIPE] Vérification session Stripe ID=" + sessionId);
        Session session = Session.retrieve(sessionId);

        if (!"paid".equals(session.getPaymentStatus())) {
            System.out.println("❌ [STRIPE] Paiement non validé");
            throw new IllegalStateException("Paiement non validé");
        }

        String title = session.getMetadata().get("title");
        String description = session.getMetadata().get("description");
        String companyIdStr = session.getMetadata().get("companyId");

        System.out.println("✅ [STRIPE] Paiement OK :");
        System.out.println("   → titre = " + title);
        System.out.println("   → description = " + description);
        System.out.println("   → companyId = " + companyIdStr);

        Long companyId = Long.valueOf(companyIdStr);

        User company = userRepo.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable avec l'ID: " + companyId));

        AuditProgram program = new AuditProgram();
        program.setTitle(title);
        program.setDescription(description);
        program.setCompany(company);
        program.setStatus(AuditProgram.Status.APPROVED);
        program = programRepo.save(program);

        ProgramPayment payment = new ProgramPayment();
        payment.setProgram(program);
        payment.setAmount(priceInCents / 100.0);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(ProgramPayment.Status.COMPLETED);
        paymentRepo.save(payment);

        System.out.println("✅✅ [STRIPE] Programme enregistré ID=" + program.getProgramId());
        return program;
    }
}
