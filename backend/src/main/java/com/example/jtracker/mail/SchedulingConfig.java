package com.example.jtracker.mail;

import com.example.jtracker.reminder.Reminder;
import com.example.jtracker.reminder.ReminderRepository;
import com.example.jtracker.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

@Configuration
@EnableScheduling
public class SchedulingConfig {

    private static final Logger log = LoggerFactory.getLogger(SchedulingConfig.class);

    private final ReminderRepository reminders;
    private final UserRepository users;
    private final Mailer mailer;

    public SchedulingConfig(ReminderRepository reminders,
                            UserRepository users,
                            Mailer mailer) {
        this.reminders = reminders;
        this.users = users;
        this.mailer = mailer;
    }

    // Runs every 60 seconds
    @Scheduled(fixedDelay = 60_000)
    public void sendDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Checking for due reminders at {}", now);

        users.findAll().forEach(user -> {
            var list = reminders.findByOwnerAndSentIsFalseAndRemindAtBefore(user, now);

            if (!list.isEmpty()) {
                log.info("Found {} due reminder(s) for user {}", list.size(), user.getEmail());
            }

            for (Reminder rem : list) {
                String to = (user.getReminderEmail() != null && !user.getReminderEmail().isBlank())
                        ? user.getReminderEmail()
                        : user.getEmail();

                log.info("Sending reminder id={} to {}", rem.getId(), to);
                try {
                    mailer.send(to, "Reminder", rem.getMessage());
                    rem.setSent(true);
                    reminders.save(rem);
                    log.info("Marked reminder id={} as sent", rem.getId());
                } catch (Exception ex) {
                    log.error("Failed to send reminder id=" + rem.getId() + " to " + to, ex);
                }
            }
        });
    }
}
