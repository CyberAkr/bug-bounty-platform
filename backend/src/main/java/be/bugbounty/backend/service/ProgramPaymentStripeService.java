package be.bugbounty.backend.service;

import be.bugbounty.backend.model.AuditProgram;
import be.bugbounty.backend.model.ProgramPayment;
import be.bugbounty.backend.model.ProgramStatus;
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
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * 1) Crée un brouillon (PENDING) en BDD avec le HTML TinyMCE complet.
     *    Refuse si la société a déjà un programme PENDING/APPROVED non supprimé.
     */
    @Transactional
    public Long createDraftProgram(String title, String descriptionHtml, User company) {
        boolean hasActive = programRepo.findByCompanyAndIsDeletedFalse(company).stream().anyMatch(p ->
                p.getStatus() == ProgramStatus.PENDING || p.getStatus() == ProgramStatus.APPROVED
        );
        if (hasActive) {
            throw new IllegalStateException("Un programme de votre entreprise existe déjà (en cours/actif).");
        }

        AuditProgram p = new AuditProgram();
        p.setTitle(title);
        p.setDescription(descriptionHtml);   // HTML riche, colonne TEXT en BDD
        p.setCompany(company);
        p.setStatus(ProgramStatus.PENDING);
        p = programRepo.saveAndFlush(p);
        return p.getId();
    }

    /**
     * 2) Crée la session Stripe pour ce brouillon.
     *    Les metadata ne contiennent que des IDs (limite 500 chars contournée).
     */
    public String createCheckoutSessionForProgram(Long programId, User user) throws StripeException {
        AuditProgram p = programRepo.findById(programId)
                .orElseThrow(() -> new IllegalArgumentException("Programme introuvable: " + programId));

        if (!p.getCompany().getUserId().equals(user.getUserId())) {
            throw new IllegalStateException("Vous n'êtes pas autorisé à payer pour ce programme.");
        }
        if (p.getStatus() != ProgramStatus.PENDING) {
            throw new IllegalStateException("Ce programme n'est pas dans un état autorisant le paiement.");
        }

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
                // ✅ metadata compactes (pas de HTML ici)
                .putMetadata("programId", String.valueOf(programId))
                .putMetadata("companyId", String.valueOf(user.getUserId()))
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    /**
     * 3) Confirmation Stripe : vérifie paiement, passe le programme en APPROVED et enregistre le paiement.
     */
    @Transactional
    public AuditProgram confirmCheckoutSession(String sessionId) throws StripeException {
        System.out.println("➡️ [STRIPE] Vérification session Stripe ID=" + sessionId);
        Session session = Session.retrieve(sessionId);
        if (session == null) {
            throw new IllegalStateException("Session Stripe introuvable: " + sessionId);
        }

        String status = session.getPaymentStatus();
        if (!"paid".equalsIgnoreCase(status) && !"succeeded".equalsIgnoreCase(status)) {
            throw new IllegalStateException("Paiement non validé par Stripe (" + status + ")");
        }

        String programIdStr = session.getMetadata().get("programId");
        if (programIdStr == null || programIdStr.isBlank()) {
            throw new IllegalArgumentException("programId manquant dans la metadata Stripe");
        }
        Long programId = Long.valueOf(programIdStr);

        AuditProgram program = programRepo.findById(programId)
                .orElseThrow(() -> new IllegalArgumentException("Programme introuvable: " + programId));

        // sécurité supplémentaire : cohérence entreprise
        String companyIdStr = session.getMetadata().get("companyId");
        if (companyIdStr != null && !companyIdStr.isBlank()) {
            Long companyId = Long.valueOf(companyIdStr);
            if (!program.getCompany().getUserId().equals(companyId)) {
                throw new IllegalStateException("Incohérence programme/session Stripe (company mismatch).");
            }
        }

        // Valide le programme
        program.setStatus(ProgramStatus.APPROVED);
        program = programRepo.saveAndFlush(program);

        // Enregistre le paiement
        ProgramPayment payment = new ProgramPayment();
        payment.setProgram(program);
        payment.setAmount(priceInCents / 100.0);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(ProgramPayment.Status.COMPLETED);
        paymentRepo.save(payment);

        System.out.println("✅✅ [STRIPE] Programme validé ID=" + program.getId());
        return program;
    }
}
