package com.example.jtracker.analytics;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/analytics")
public class AnalyticsController {
  private final AnalyticsService svc;
  public AnalyticsController(AnalyticsService s){ this.svc=s; }
  @GetMapping("/status-counts") public Map<String, Long> statusCounts(){ return svc.statusCounts(); }
}
