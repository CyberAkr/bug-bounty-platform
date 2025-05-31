package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadgeId> {
    boolean existsByResearcherAndBadge(User researcher, Badge badge);
}
