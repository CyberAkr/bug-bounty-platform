package be.bugbounty.backend.service;

import be.bugbounty.backend.model.Report;
import be.bugbounty.backend.model.RewardPayment;
import be.bugbounty.backend.repository.ReportRepository;
import be.bugbounty.backend.repository.RewardPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RewardPaymentService {

    @Autowired
    private RewardPaymentRepository rewardPaymentRepository;

    @Autowired
    private ReportRepository reportRepository;

    public List<RewardPayment> findAll() {
        return rewardPaymentRepository.findAll();
    }

    public RewardPayment createReward(Long reportId, double amount) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Rapport introuvable"));

        RewardPayment payment = new RewardPayment();
        payment.setReport(report);
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());

        return rewardPaymentRepository.save(payment);
    }
}
