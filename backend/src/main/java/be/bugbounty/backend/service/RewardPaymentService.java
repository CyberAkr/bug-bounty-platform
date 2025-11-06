package be.bugbounty.backend.service;

import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.RewardPayment;
import be.bugbounty.backend.repository.ReportRepository;
import be.bugbounty.backend.repository.RewardPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RewardPaymentService {

    @Autowired
    private RewardPaymentRepository rewardPaymentRepository;

    @Autowired
    private ReportRepository reportRepository;

    public List<RewardPayment> findAll() {
        return rewardPaymentRepository.findAll();
    }

    /**
     * Crée une reward uniquement si:
     *  le report existe et est APPROVED
     *  aucune reward n'existe déjà pour ce report
     * La date de paiement est forcée côté serveur.
     */
    public RewardPayment createReward(Long reportId, double amount) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));

        if (report.getStatus() != Report.Status.APPROVED) {
            throw new IllegalStateException("Le rapport doit être APPROVED pour créer une récompense.");
        }

        if (rewardPaymentRepository.existsByReport_ReportId(reportId)) {
            throw new IllegalStateException("Une récompense existe déjà pour ce rapport.");
        }

        RewardPayment payment = new RewardPayment();
        payment.setReport(report);
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now()); // doublé par @PrePersist

        return rewardPaymentRepository.save(payment);
    }
    public Optional<RewardPayment> findByReportId(Long reportId) {
        return rewardPaymentRepository.findByReport_ReportId(reportId);
    }

    /**
     * Attache/Remplace l'URL de preuve à une reward existante.
     */
    public RewardPayment attachProof(Long paymentId, String proofUrl) {
        RewardPayment rp = rewardPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Reward introuvable"));
        rp.setProofUrl(proofUrl);
        return rewardPaymentRepository.save(rp);
    }
}
