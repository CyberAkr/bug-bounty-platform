package be.bugbounty.backend.service;

import be.bugbounty.backend.model.ProgramPayment;
import be.bugbounty.backend.repository.ProgramPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgramPaymentService {

    @Autowired
    private ProgramPaymentRepository repository;

    public List<ProgramPayment> getAll() {
        return repository.findAll();
    }

    public ProgramPayment save(ProgramPayment payment) {
        return repository.save(payment);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public ProgramPayment getById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
