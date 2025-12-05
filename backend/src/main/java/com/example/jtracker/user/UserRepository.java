package com.example.jtracker.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // ✅ add this so SupportRequestService compiles
    Optional<User> findByEmailIgnoreCase(String email);
}
