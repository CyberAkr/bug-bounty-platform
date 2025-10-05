package be.bugbounty.backend.config;

import be.bugbounty.backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;

@EnableMethodSecurity
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {}) // Active CORS via le bean en dessous
                .csrf(csrf -> csrf.disable()) // Désactive CSRF pour API REST
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless API

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()        // login/register publics
                        .requestMatchers("/api/challenge/**").authenticated() // ✅ ajoute cette ligne
                        .requestMatchers("/api/payments/programs/*/checkout").authenticated()
                        .requestMatchers("/api/payments/programs/*/confirm").authenticated()

                        .requestMatchers("/api/user/me").authenticated()    // nécessite token
                        .requestMatchers("/api/user/**").permitAll()

                        .anyRequest().authenticated()                       // tout le reste aussi
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // JWT filter

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Autoriser CORS pour Angular (localhost:4200)
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS") // ← AJOUTE PATCH
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}