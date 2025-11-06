package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.RewardPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardPaymentRepository extends JpaRepository<RewardPayment, Long> {
    boolean existsByReport_ReportId(Long reportId);
}
