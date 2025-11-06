package be.bugbounty.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @ManyToOne
    @JoinColumn(name = "report_id", nullable = false, unique = false) // l'unicité est assurée par l'index DB
    private Report report;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "proof_url")
    private String proofUrl;

    @PrePersist
    void ensureDates() {
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
    }
}
