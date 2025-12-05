package com.example.jtracker.auth;
import java.time.LocalDateTime;

import com.example.jtracker.user.User;
import com.example.jtracker.user.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

record LoginReq(@Email String email, @NotBlank String password) {}
record RegisterReq(@Email String email, @NotBlank String password) {}
record GoogleOAuthReq(@NotBlank String idToken) {} // idToken = access_token
record AuthRes(String token) {}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final RestTemplate rest = new RestTemplate();

    public AuthController(
            UserRepository users,
            PasswordEncoder encoder,
            JwtUtil jwt
    ) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq req) {
        if (users.findByEmail(req.email()).isPresent()) {
            // 409 Conflict is more semantically correct
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("User already exists");
        }

        var u = new User();
        u.setEmail(req.email());
        u.setPassword(encoder.encode(req.password()));

        // New profile defaults
        u.setDisplayName("User");
        u.setCreatedAt(LocalDateTime.now());
        u.setReminderEmail(req.email());
        u.setDefaultReminderMessage("Follow up on this application");
        // currentCompany and dateOfBirth left null until user fills them

        users.save(u);
        return ResponseEntity.ok(new AuthRes(jwt.generate(u.getEmail())));

    }


    @PostMapping("/login")
    public ResponseEntity<AuthRes> login(@RequestBody LoginReq req) {
        var user = users.findByEmail(req.email()).orElseThrow();
        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new RuntimeException("Bad credentials");
        }
        return ResponseEntity.ok(new AuthRes(jwt.generate(user.getEmail())));
    }

    // Google userinfo response shape
    static class GoogleUserInfo {
        public String sub;
        public String email;
        public Boolean email_verified;
        public String name;
        public String picture;
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleOAuthReq req) {

        String accessToken = req.idToken(); // frontend sends access token here
        if (accessToken == null || accessToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing Google access token");
        }

        GoogleUserInfo info;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<GoogleUserInfo> resp = rest.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    GoogleUserInfo.class
            );

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
            }

            info = resp.getBody();
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google token verification failed");
        }

        if (info.email == null || info.email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google account has no email");
        }

        // Find or create user
        User user = users.findByEmail(info.email).orElseGet(() -> {
            User u = new User();
            u.setEmail(info.email);
            u.setPassword(encoder.encode(UUID.randomUUID().toString()));

            // New profile defaults
            u.setDisplayName("User");
            u.setCreatedAt(LocalDateTime.now());
            u.setReminderEmail(info.email);
            u.setDefaultReminderMessage("Follow up on this application");

            return users.save(u);
        });


        return ResponseEntity.ok(new AuthRes(jwt.generate(user.getEmail())));
    }
}
