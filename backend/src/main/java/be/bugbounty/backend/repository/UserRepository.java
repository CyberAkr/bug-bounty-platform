package be.bugbounty.backend.repository;

import be.bugbounty.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    org.springframework.data.domain.Page<User> findByRole(String role, org.springframework.data.domain.Pageable pageable);
    List<User> findTop10ByRoleOrderByPointDesc(String role);
}
