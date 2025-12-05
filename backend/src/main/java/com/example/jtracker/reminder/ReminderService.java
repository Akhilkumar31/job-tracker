package com.example.jtracker.reminder;

import com.example.jtracker.app.JobApplication;
import com.example.jtracker.app.JobApplicationRepository;
import com.example.jtracker.user.User;
import com.example.jtracker.user.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository reminders;
    private final JobApplicationRepository apps;
    private final UserRepository users;

    public ReminderService(ReminderRepository reminders, JobApplicationRepository apps, UserRepository users) {
        this.reminders = reminders;
        this.apps = apps;
        this.users = users;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow();
    }

    // New: match controller's expectation
    public List<Reminder> list() {
        return reminders.findByOwner(currentUser());
    }

    // New: match controller's expectation
    public Reminder create(Long appId, LocalDateTime at, String message) {
        User owner = currentUser();
        JobApplication app = apps.findById(appId).orElseThrow();
        Reminder rem = new Reminder();
        rem.setOwner(owner);
        rem.setApplication(app);
        rem.setRemindAt(at);
        rem.setMessage(message);
        return reminders.save(rem);
    }

    // Keep: the explicit variant (useful for tests/seeders)
    public Reminder createFor(Long appId, String email, LocalDateTime at, String message) {
        var owner = users.findByEmail(email).orElseThrow();
        JobApplication app = apps.findById(appId).orElseThrow();
        Reminder rem = new Reminder();
        rem.setOwner(owner);
        rem.setApplication(app);
        rem.setRemindAt(at);
        rem.setMessage(message);
        return reminders.save(rem);
    }
}
