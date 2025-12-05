package com.example.jtracker.analytics;

import com.example.jtracker.app.JobApplicationRepository;
import com.example.jtracker.user.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private final JobApplicationRepository apps;
    private final UserRepository users;

    public AnalyticsService(JobApplicationRepository a, UserRepository u) { apps = a; users = u; }

    public Map<String, Long> statusCounts() {
        var email = SecurityContextHolder.getContext().getAuthentication().getName();
        var me = users.findByEmail(email).orElseThrow();
        return apps.findByOwnerOrderByAppliedDateDesc(me).stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));
    }
}
