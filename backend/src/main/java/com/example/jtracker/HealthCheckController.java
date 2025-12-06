package com.example.jtracker;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {

    @GetMapping("/")
    public String root() {
        return "OK";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
