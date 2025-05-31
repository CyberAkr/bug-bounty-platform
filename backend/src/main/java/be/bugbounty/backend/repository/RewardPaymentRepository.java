package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.RewardPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardPaymentRepository extends JpaRepository<RewardPayment, Long> {
}
