package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.model.RewardPayment;
import be.bugbounty.backend.service.RewardPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rewards")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRewardController {

    @Autowired
    private RewardPaymentService rewardPaymentService;

    @GetMapping
    public ResponseEntity<List<RewardPayment>> getAllRewards() {
        return ResponseEntity.ok(rewardPaymentService.findAll());
    }

    @PostMapping("/{reportId}")
    public ResponseEntity<?> createReward(@PathVariable Long reportId, @RequestParam double amount) {
        try {
            RewardPayment payment = rewardPaymentService.createReward(reportId, amount);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
