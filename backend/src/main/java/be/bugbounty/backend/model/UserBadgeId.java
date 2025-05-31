package be.bugbounty.backend.model;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBadgeId implements Serializable {
    private Long researcher; // match le nom du champ dans UserBadge
    private Long badge;
}
