package com.example.jtracker.app;

import com.example.jtracker.user.User;
import com.example.jtracker.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final JobApplicationRepository repo;
    private final UserRepository users;

    public ApplicationService(JobApplicationRepository repo, UserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    private User me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;
        if (email == null) {
            throw new RuntimeException("Unauthenticated");
        }
        return users.findByEmail(email).orElseThrow();
    }

    /** Root folder for uploads (relative to app working dir). */
    private Path uploadsRoot() throws IOException {
        Path root = Paths.get("uploads").toAbsolutePath().normalize();
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }
        return root;
    }

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private String saveFile(MultipartFile file, Path root) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum allowed size of 5 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only PDF and Word documents are allowed");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "file";
        }

        // Simple filename sanitization: remove path parts
        originalName = Paths.get(originalName).getFileName().toString();

        String storedName = UUID.randomUUID() + "-" + originalName;
        Path target = root.resolve(storedName);
        file.transferTo(target.toFile());
        return storedName;
    }

    // ------------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------------

    public List<JobApplication> listMine() {
        return repo.findByOwnerOrderByAppliedDateDesc(me());
    }

    public JobApplication create(JobApplication in) {
        in.setId(null);
        in.setOwner(me());
        return repo.save(in);
    }

public JobApplication createWithFiles(
        String company,
        String position,
        ApplicationStatus status,
        String jobLink,
        String notes,
        String nextActionDate,
        MultipartFile resume,
        MultipartFile coverLetter
) {
    JobApplication app = new JobApplication();
    app.setCompany(company);
    app.setPosition(position);
    app.setStatus(status);
    app.setJobLink(jobLink);
    app.setNotes(notes);
    app.setOwner(me());

    // ------------------------------------------------------------
    // Treat the supplied nextActionDate as our "applied date"
    // ------------------------------------------------------------
    LocalDate applied = null;

    if (nextActionDate != null && !nextActionDate.isBlank()) {
        try {
            applied = LocalDate.parse(nextActionDate);
        } catch (DateTimeParseException e) {
            throw new RuntimeException(
                    "Invalid nextActionDate format, expected ISO-8601 (yyyy-MM-dd)",
                    e
            );
        }
    }

    if (applied == null) {
        // If UI didn't send a date, default to today
        applied = LocalDate.now();
    }

    // Store both fields so frontend can use either in the future
    app.setAppliedDate(applied);
    app.setNextActionDate(applied);

    try {
        Path uploadDir = uploadsRoot();

        // Resume (required on the frontend)
        if (resume != null && !resume.isEmpty()) {
            String resumeName = saveFile(resume, uploadDir);
            app.setResumeUrl("/uploads/" + resumeName);
        }

        // Cover letter (optional)
        if (coverLetter != null && !coverLetter.isEmpty()) {
            String coverName = saveFile(coverLetter, uploadDir);
            app.setCoverLetterUrl("/uploads/" + coverName);
        }

        return repo.save(app);
    } catch (IOException e) {
        throw new RuntimeException("Failed to store uploaded files", e);
    }
}



    public JobApplication updateFiles(
            Long id,
            MultipartFile resume,
            MultipartFile coverLetter
    ) {
        var app = repo.findById(id).orElseThrow();
        var current = me();

        if (!app.getOwner().getId().equals(current.getId())) {
            throw new RuntimeException("Forbidden");
        }

        try {
            Path uploadDir = uploadsRoot();

            // Replace resume if a new one is provided
            if (resume != null && !resume.isEmpty()) {
                String resumeName = saveFile(resume, uploadDir);
                app.setResumeUrl("/uploads/" + resumeName);
            }

            // Replace cover letter if a new one is provided
            if (coverLetter != null && !coverLetter.isEmpty()) {
                String coverName = saveFile(coverLetter, uploadDir);
                app.setCoverLetterUrl("/uploads/" + coverName);
            }

            return repo.save(app);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded files", e);
        }
    }


    public JobApplication update(Long id, JobApplication patch) {
        var app = repo.findById(id).orElseThrow();
        var current = me();

        System.out.printf(
                "Attempting to update app %d | requester: %s | owner: %s%n",
                id,
                current.getEmail(),
                app.getOwner().getEmail()
        );

        if (!app.getOwner().getId().equals(current.getId())) {
            throw new RuntimeException("Forbidden");
        }

        if (patch.getCompany() != null) app.setCompany(patch.getCompany());
        if (patch.getPosition() != null) app.setPosition(patch.getPosition());
        if (patch.getStatus() != null) app.setStatus(patch.getStatus());
if (patch.getNextActionDate() != null) {
    app.setNextActionDate(patch.getNextActionDate());

    // Optionally: if appliedDate is missing, set it too
    if (app.getAppliedDate() == null) {
        app.setAppliedDate(patch.getNextActionDate());
    }
}

// if you later allow editing appliedDate explicitly from the UI:
if (patch.getAppliedDate() != null) {
    app.setAppliedDate(patch.getAppliedDate());
}
        if (patch.getNotes() != null) app.setNotes(patch.getNotes());
        if (patch.getJobLink() != null) app.setJobLink(patch.getJobLink());

        return repo.save(app);
    }

    public void delete(Long id) {
        var app = repo.findById(id).orElseThrow();
        var current = me();
        if (!app.getOwner().getId().equals(current.getId())) {
            throw new RuntimeException("Forbidden");
        }
        repo.delete(app);
    }
}
