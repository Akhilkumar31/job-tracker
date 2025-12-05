package com.example.jtracker.support;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {
    // You can add query methods later if you want filtering by email/status/etc.
}
