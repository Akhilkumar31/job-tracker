package com.example.jtracker.app;

import com.example.jtracker.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByOwnerOrderByAppliedDateDesc(User owner);
    long countByOwner(User owner);
}
