package be.bugbounty.backend.web.auth;

public record VerifyEmailRequest(String email, String code) {}
