package com.example.jtracker.support;

import com.example.jtracker.user.User;
import com.example.jtracker.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class SupportRequestService {

    private final SupportRequestRepository repository;
    private final UserRepository users;

    public SupportRequestService(SupportRequestRepository repository, UserRepository users) {
        this.repository = repository;
        this.users = users;
    }

    private User me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;

        if (email == null) {
            throw new RuntimeException("Unauthenticated");
        }

        return users.findByEmail(email).orElseThrow();
    }

    public void create(SupportRequestDto dto) {
    User user = me();                     // get current user once

    SupportRequest entity = new SupportRequest();
    entity.setOwner(user);
    entity.setType(dto.getType());
    entity.setSubject(dto.getSubject());
    entity.setMessage(dto.getMessage());
    entity.setEmail(user.getEmail());     // 👈 use user email, not dto
    entity.setCreatedAt(Instant.now());
    entity.setStatus("OPEN");

    repository.save(entity);

    System.out.println("New support request:");
    System.out.println("  owner   = " + user.getEmail());
    System.out.println("  type    = " + dto.getType());
    System.out.println("  subject = " + dto.getSubject());
    System.out.println("  email   = " + user.getEmail());
}

}
