package com.example.jtracker.reminder;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime; import java.util.List;

record CreateReminderReq(Long applicationId, LocalDateTime remindAt, String message){}

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {
  private final ReminderService svc;
  public ReminderController(ReminderService s){ this.svc=s; }
  @GetMapping public List<Reminder> list(){ return svc.list(); }
  @PostMapping public Reminder create(@RequestBody CreateReminderReq req){ return svc.create(req.applicationId(), req.remindAt(), req.message()); }
}
