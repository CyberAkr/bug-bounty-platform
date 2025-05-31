package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_badge")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserBadgeId.class)
public class UserBadge {

    @Id
    @ManyToOne
    @JoinColumn(name = "researcher_id", nullable = false)
    private User researcher;

    @Id
    @ManyToOne
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;
}
