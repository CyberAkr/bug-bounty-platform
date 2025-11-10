package be.bugbounty.backend.dto.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForumMessageCreateRequest(
        @NotBlank @Size(min = 1, max = 2000) String content
) {}
