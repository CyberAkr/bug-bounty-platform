package be.bugbounty.backend.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectProvider<be.bugbounty.backend.security.JwtAuthenticationFilter> jwtFilterProvider;
    private final ObjectProvider<AuthenticationProvider> authenticationProviderProvider;

    public SecurityConfig(
            ObjectProvider<be.bugbounty.backend.security.JwtAuthenticationFilter> jwtFilterProvider,
            ObjectProvider<AuthenticationProvider> authenticationProviderProvider
    ) {
        this.jwtFilterProvider = jwtFilterProvider;
        this.authenticationProviderProvider = authenticationProviderProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // API REST stateless ne conserve aucun état ou données entre les requêtes
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Règles d'autorisation
                .authorizeHttpRequests(auth -> auth
                        // ----- PUBLIC -----
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()

                        // Fichiers publics (exposés par WebConfig)
                        .requestMatchers(HttpMethod.GET, "/files/profile/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/files/badges/**").permitAll()

                        // (si tu places le modèle PDF côté backend/resources/static/docs)
                        .requestMatchers(HttpMethod.GET, "/docs/**").permitAll()

                        // Classement + SSE (public)
                        .requestMatchers(HttpMethod.GET, "/api/rankings", "/api/rankings/stream").permitAll()
                        // 👇 CHANGEMENT: rendre public le calcul de rang utilisateur
                        .requestMatchers(HttpMethod.GET, "/api/rankings/rank").permitAll()

                        // Profils publics + badges (lecture publique)
                        .requestMatchers(HttpMethod.GET, "/api/users/*/public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/*/badges").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/forum/stream").permitAll()

                        // ----- PROTÉGÉ -----
                        .anyRequest().authenticated()
                )

                // 401 / 403 propres
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
                )

                // Headers (H2 / iframes)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));

        // AuthenticationProvider optionnel
        AuthenticationProvider provider = authenticationProviderProvider.getIfAvailable();
        if (provider != null) {
            http.authenticationProvider(provider);
        }

        // Filtre JWT optionnel
        var jwtFilter = jwtFilterProvider.getIfAvailable();
        if (jwtFilter != null) {
            http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:4200"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
