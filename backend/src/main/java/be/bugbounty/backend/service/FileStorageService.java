package be.bugbounty.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    @Value("${app.upload.dir:uploads}")
    private String baseUploadDir;

    @Value("${app.upload.profile-subdir:profile}")
    private String profileSubDir;

    @Value("${app.upload.badge-subdir:badges}")
    private String badgeSubDir;

    @Value("${app.upload.max-bytes:5242880}") // 5MB par défaut (pour IMAGES)
    private long maxBytes;

    // ========= Profil (PUBLIC)
    public String storeProfilePhoto(MultipartFile file) throws IOException {
        return storeImage(file, profileSubDir);
    }

    // ========= Badge (PUBLIC)
    public String storeBadgeImage(MultipartFile file) throws IOException {
        return storeImage(file, badgeSubDir);
    }

    // ========= Vérification ENTREPRISE (PRIVÉ) =========
    public String storeVerificationPdf(Long userId, MultipartFile file, long maxPdfBytes) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Fichier manquant");
        if (file.getSize() > maxPdfBytes) throw new IllegalArgumentException("Fichier trop volumineux");

        String ct = file.getContentType() == null ? "" : file.getContentType();
        if (!ct.equalsIgnoreCase(MediaType.APPLICATION_PDF_VALUE)) {
            throw new IllegalArgumentException("Seuls les PDF sont acceptés");
        }

        // Signature magique %PDF-
        try (InputStream in = file.getInputStream()) {
            byte[] head = in.readNBytes(5);
            String sig = new String(head, java.nio.charset.StandardCharsets.US_ASCII);
            if (!sig.startsWith("%PDF-")) {
                throw new IllegalArgumentException("Fichier invalide (signature PDF manquante)");
            }
        }

        Path root = Paths.get(baseUploadDir).toAbsolutePath().normalize();
        Path userDir = root.resolve("verification").resolve(String.valueOf(userId));
        Files.createDirectories(userDir);

        Path target = userDir.resolve("verification.pdf");
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        // ⚠️ Retourne un CHEMIN INTERNE (privé), pas une URL publique.
        return target.toString();
    }

    // ========= Utilitaire commun (IMAGES PUBLIQUES) =========
    private String storeImage(MultipartFile file, String subdir) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier manquant");
        }
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("Fichier trop volumineux (max " + (maxBytes / (1024*1024)) + " Mo)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME.contains(contentType)) {
            throw new IllegalArgumentException("Type de fichier non autorisé (jpeg/png/webp)");
        }

        Path targetDir = Paths.get(baseUploadDir, subdir).toAbsolutePath().normalize();
        Files.createDirectories(targetDir);

        String ext = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".png";
        };

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String filename = timestamp + "_" + UUID.randomUUID() + ext;

        Path target = targetDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // URL publique servie par WebConfig: /files/{subdir}/{filename}
        return "/files/" + subdir + "/" + filename;
    }
}
