package be.bugbounty.backend.controller;

import be.bugbounty.backend.model.ProgramPayment;
import be.bugbounty.backend.service.ProgramPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/program-payments")
public class ProgramPaymentController {

    @Autowired
    private ProgramPaymentService service;

    @GetMapping
    public List<ProgramPayment> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ProgramPayment getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ProgramPayment create(@RequestBody ProgramPayment payment) {
        return service.save(payment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
}
