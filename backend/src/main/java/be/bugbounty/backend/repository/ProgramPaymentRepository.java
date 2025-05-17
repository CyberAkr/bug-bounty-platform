package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.ProgramPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramPaymentRepository extends JpaRepository<ProgramPayment, Long> {
}
