package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.model.RewardPayment;
import be.bugbounty.backend.service.RewardPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/rewards")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRewardController {

    @Autowired
    private RewardPaymentService rewardPaymentService;

    @GetMapping
    public ResponseEntity<List<RewardPayment>> getAllRewards() {
        return ResponseEntity.ok(rewardPaymentService.findAll());
    }

    /**
     * Création d'une reward (MVP):
     * POST /api/admin/rewards/{reportId}?amount=123.45
     */
    @PostMapping("/{reportId}")
    public ResponseEntity<?> createReward(@PathVariable Long reportId, @RequestParam double amount) {
        try {
            RewardPayment payment = rewardPaymentService.createReward(reportId, amount);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Upload / remplacement de la preuve (PDF/JPG/PNG) :
     * POST /api/admin/rewards/{paymentId}/proof  (multipart form-data, field "file")
     * Stockage: uploads/rewards-proofs (non exposé publiquement).
     */
    @PostMapping(path = "/{paymentId}/proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProof(@PathVariable Long paymentId,
                                         @RequestParam("file") MultipartFile file) {
        try {
            validateProofFile(file);
            String storedPath = storeProofFile(file); // ex: uploads/rewards-proofs/20251106_UUID.pdf
            RewardPayment updated = rewardPaymentService.attachProof(paymentId, storedPath);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Téléchargement de la preuve (ADMIN only).
     * GET /api/admin/rewards/{paymentId}/proof
     * Renvoie un attachment avec le bon content-type.
     */
    @GetMapping("/{paymentId}/proof")
    public ResponseEntity<Resource> downloadProof(@PathVariable Long paymentId) {
        RewardPayment rp = rewardPaymentService.findAll().stream()
                .filter(r -> r.getPaymentId().equals(paymentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reward introuvable"));

        String proof = rp.getProofUrl();
        if (proof == null || proof.isBlank()) {
            throw new RuntimeException("Aucune preuve disponible pour cette reward.");
        }

        try {
            Path path = Paths.get(proof).toAbsolutePath().normalize();
            if (!Files.exists(path)) {
                // tente chemin relatif si jamais on a un working dir différent
                Path rel = Paths.get(proof).normalize();
                if (Files.exists(rel)) path = rel;
            }
            if (!Files.exists(path)) {
                throw new RuntimeException("Fichier de preuve introuvable.");
            }

            String ct = Files.probeContentType(path);
            if (ct == null) ct = "application/octet-stream";
            String filename = path.getFileName().toString();

            InputStreamResource body = new InputStreamResource(Files.newInputStream(path));
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(ct))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(body);
        } catch (IOException e) {
            throw new RuntimeException("Erreur de lecture du fichier de preuve.");
        }
    }
    @GetMapping("/{paymentId}/proof/file")
    public ResponseEntity<Resource> downloadProofFile(@PathVariable Long paymentId) {
        RewardPayment rp = rewardPaymentService.findAll().stream()
                .filter(r -> r.getPaymentId().equals(paymentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reward introuvable"));

        String proof = rp.getProofUrl();
        if (proof == null || proof.isBlank()) {
            throw new RuntimeException("Aucune preuve disponible pour cette reward.");
        }

        try {
            Path path = Paths.get(proof).toAbsolutePath().normalize();
            if (!Files.exists(path)) {
                Path rel = Paths.get(proof).normalize();
                if (Files.exists(rel)) path = rel;
            }
            if (!Files.exists(path)) {
                throw new RuntimeException("Fichier de preuve introuvable.");
            }

            String ct = Files.probeContentType(path);
            if (ct == null) ct = "application/octet-stream";
            String filename = path.getFileName().toString();

            InputStreamResource body = new InputStreamResource(Files.newInputStream(path));
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(ct))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(body);
        } catch (IOException e) {
            throw new RuntimeException("Erreur de lecture du fichier de preuve.");
        }
    }


    private static void validateProofFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier de preuve manquant.");
        }
        long max = 10L * 1024 * 1024; // 10MB
        if (file.getSize() > max) {
            throw new IllegalArgumentException("Fichier trop volumineux (max 10MB).");
        }
        String ct = file.getContentType() != null ? file.getContentType() : "";
        if (!(ct.equals("application/pdf") || ct.equals("image/png") || ct.equals("image/jpeg"))) {
            throw new IllegalArgumentException("Type de fichier non autorisé (PDF, PNG, JPG).");
        }
    }

    private static String storeProofFile(MultipartFile file) throws IOException {
        String baseDir = "uploads/rewards-proofs";
        Path root = Paths.get(baseDir).toAbsolutePath().normalize();
        Files.createDirectories(root);

        String original = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot > -1 && dot < original.length() - 1) ext = original.substring(dot).toLowerCase();

        String filename = String.format("%tY%<tm%<td_%s%s", java.time.LocalDate.now(), UUID.randomUUID(), ext);
        Path dest = root.resolve(filename).normalize();
        if (!dest.startsWith(root)) throw new SecurityException("Chemin de fichier invalide.");

        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return baseDir + "/" + filename; // chemin relatif côté serveur (non public)
    }
}
