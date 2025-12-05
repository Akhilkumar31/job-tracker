package com.example.jtracker.support;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
public class SupportRequestController {

    private final SupportRequestService service;

    public SupportRequestController(SupportRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody SupportRequestDto dto) {
        service.create(dto);
        // No response body needed – frontend just checks res.ok
        return ResponseEntity.noContent().build();
    }
}
