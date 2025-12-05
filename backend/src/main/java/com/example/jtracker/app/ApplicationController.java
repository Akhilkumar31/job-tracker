package com.example.jtracker.app;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import java.util.List;

@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                   RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
@RestController
@RequestMapping("/api/apps")
public class ApplicationController {

    private final ApplicationService svc;

    public ApplicationController(ApplicationService s) {
        this.svc = s;
    }

    @GetMapping
    public List<JobApplication> list() {
        return svc.listMine();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public JobApplication createWithFiles(
            @RequestParam("company") String company,
            @RequestParam("position") String position,
            @RequestParam("status") ApplicationStatus status,
            @RequestParam(value = "jobLink", required = false) String jobLink,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "nextActionDate", required = false) String nextActionDate,
            @RequestPart("resume") MultipartFile resume,
            @RequestPart(value = "coverLetter", required = false) MultipartFile coverLetter
    ) {
        return svc.createWithFiles(
                company,
                position,
                status,
                jobLink,
                notes,
                nextActionDate,
                resume,
                coverLetter
        );
    }

    @PatchMapping("/{id}")
    public JobApplication update(@PathVariable Long id, @RequestBody JobApplication patch) {
        return svc.update(id, patch);
    }

    @PatchMapping(path = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public JobApplication updateFiles(
            @PathVariable Long id,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "coverLetter", required = false) MultipartFile coverLetter
    ) {
        return svc.updateFiles(id, resume, coverLetter);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        svc.delete(id);
    }
}
