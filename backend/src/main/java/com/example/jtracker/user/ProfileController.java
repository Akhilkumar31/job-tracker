package com.example.jtracker.user;

import com.example.jtracker.app.JobApplicationRepository;
import com.example.jtracker.wishlist.WishlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

record ProfileResponse(
        String email,
        String displayName,
        String joinedAt,
        Long applicationsCount,
        Long wishlistCount,
        String reminderEmail,
        String defaultReminderMessage,
        String currentCompany,
        String dateOfBirth
) {}

record ProfileUpdateRequest(
        String displayName,
        String reminderEmail,
        String defaultReminderMessage,
        String currentCompany,
        String dateOfBirth
) {}

@RestController
@RequestMapping("/api/me/profile")
public class ProfileController {

    private final UserRepository users;
    private final JobApplicationRepository apps;
    private final WishlistRepository wishlist;

    public ProfileController(
            UserRepository users,
            JobApplicationRepository apps,
            WishlistRepository wishlist
    ) {
        this.users = users;
        this.apps = apps;
        this.wishlist = wishlist;
    }

    private User me() {
        var email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public ProfileResponse getProfile() {
        var u = me();
        long appsCount = apps.countByOwner(u);
        long wishlistCount = wishlist.countByOwner(u);

        String joinedAt = u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate().toString() : null;
        String dob = u.getDateOfBirth() != null ? u.getDateOfBirth().toString() : null;

        return new ProfileResponse(
                u.getEmail(),
                u.getDisplayName(),
                joinedAt,
                appsCount,
                wishlistCount,
                u.getReminderEmail(),
                u.getDefaultReminderMessage(),
                u.getCurrentCompany(),
                dob
        );
    }

    @PatchMapping
    public ProfileResponse updateProfile(@RequestBody ProfileUpdateRequest req) {
        var u = me();

        if (req.displayName() != null) {
            u.setDisplayName(req.displayName().isBlank() ? null : req.displayName());
        }

        if (req.reminderEmail() != null) {
            u.setReminderEmail(req.reminderEmail().isBlank() ? null : req.reminderEmail());
        }

        if (req.defaultReminderMessage() != null) {
            u.setDefaultReminderMessage(req.defaultReminderMessage());
        }

        if (req.currentCompany() != null) {
            u.setCurrentCompany(req.currentCompany());
        }

        if (req.dateOfBirth() != null) {
            if (req.dateOfBirth().isBlank()) {
                u.setDateOfBirth(null);
            } else {
                LocalDate parsed = LocalDate.parse(req.dateOfBirth());
                u.setDateOfBirth(parsed);
            }
        }

        users.save(u);
        return getProfile();
    }
}
