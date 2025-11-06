package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.RewardPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RewardPaymentRepository extends JpaRepository<RewardPayment, Long> {
    boolean existsByReport_ReportId(Long reportId);
    Optional<RewardPayment> findByReport_ReportId(Long reportId);

}
