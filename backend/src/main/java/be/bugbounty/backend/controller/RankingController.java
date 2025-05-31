// Fichier : RankingController.java
package be.bugbounty.backend.controller;

import be.bugbounty.backend.dto.user.UserRankingDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final UserRepository userRepository;

    @GetMapping
    public List<UserRankingDTO> getTopResearchers() {
        return userRepository.findTop10ByRoleOrderByPointDesc("RESEARCHER")
                .stream()
                .map(user -> new UserRankingDTO(
                        user.getUserId(),       // ✅ 1. ID
                        user.getUsername(),     // ✅ 2. Username
                        user.getPoint()         // ✅ 3. Points
                ))
                .toList();
    }
}
