package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findTop10ByRoleOrderByPointDesc(String role);
}
