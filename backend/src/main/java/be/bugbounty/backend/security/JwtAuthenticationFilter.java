package be.bugbounty.backend.security;

import be.bugbounty.backend.model.User;
import be.bugbounty.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String SECRET_KEY = "super_secret_key_for_dev_super_secret_key_for_dev";

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // lire le header

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.replace("Bearer ", "");
        // valider le jwt avec la clé

        try {
            Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            System.out.println(" Email extrait du token : " + email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                //        charge l'utilisateur
                User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);

                if (user != null) {
                    //        Il crée lauthority Spring Security à partir du rôle en base

                    String role = user.getRole().toUpperCase();
                    String authority = "ROLE_" + role;

                    System.out.println(" Rôle utilisateur en base : " + user.getRole());
                    System.out.println(" Authority injectée : " + authority);
                    //        injecte cela dans le seecurity context

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user, // principal = entité User (utilisé ensuite par ForumController)
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println(" Utilisateur injecté dans SecurityContext : " + user.getEmail());
                }
            }
        } catch (Exception e) {
            System.out.println(" Token invalide ou erreur : " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
