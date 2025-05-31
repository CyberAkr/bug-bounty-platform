package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
}
