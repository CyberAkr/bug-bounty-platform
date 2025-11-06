package be.bugbounty.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @Value("${app.upload.max-bytes:5242880}") // 5MB par défaut (overridé par tes props)
    private long maxBytes;

    // ====== Profil (existant) ======
    public String storeProfilePhoto(MultipartFile file) throws IOException {
        return storeImage(file, profileSubDir);
    }

    // ====== Badge (NOUVEAU) ======
    public String storeBadgeImage(MultipartFile file) throws IOException {
        return storeImage(file, badgeSubDir); // /files/badges/xxx
    }

    // ====== Utilitaire commun ======
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
