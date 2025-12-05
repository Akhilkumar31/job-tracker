package com.example.jtracker.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

record AiReq(String resumeText, String jobDescription) {}
record CoverLetterReq(String resumeText, String jobDescription) {}

@RestController
@RequestMapping("/api/ai")
public class ResumeAiController {

    private final ResumeAiService svc;
    private final ObjectMapper objectMapper;

    public ResumeAiController(ResumeAiService svc, ObjectMapper objectMapper) {
        this.svc = svc;
        this.objectMapper = objectMapper;
    }

    /**
     * Resume analyzer: used by ResumeMatch.tsx
     * Frontend: POST /ai/match with { resumeText, jobDescription }
     * Expects: { score: number, missing_keywords: string[], ... }
     */
    @PostMapping("/match")
    public Map<String, Object> match(@RequestBody AiReq req) {
        String raw = svc.score(req.resumeText(), req.jobDescription());

        try {
            // First attempt: parse as-is
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = objectMapper.readValue(raw, Map.class);
            return parsed;
        } catch (Exception primaryEx) {
            // Second attempt: try to extract the JSON object substring if there is extra text
            try {
                int start = raw.indexOf('{');
                int end = raw.lastIndexOf('}');
                if (start >= 0 && end > start) {
                    String jsonSlice = raw.substring(start, end + 1);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> parsed = objectMapper.readValue(jsonSlice, Map.class);
                    return parsed;
                }
            } catch (Exception ignored) {
                // fall through to error
            }

            // Final fallback: return a safe object the frontend can still render
            return Map.of(
                "score", 0,
                "missing_keywords", List.of(
                    "Failed to parse AI response.",
                    primaryEx.getMessage() != null ? primaryEx.getMessage() : "Unknown parsing error"
                ),
                "mode", "PARSER_ERROR",
                "raw", raw  // optional: lets you inspect/log the bad response
            );
        }
    }

    /**
     * Cover letter generator: used by CoverLetter.tsx
     * Frontend: POST /ai/cover-letter with { resumeText, jobDescription }
     * Expects: plain string (the letter)
     */
    @PostMapping("/cover-letter")
    public String coverLetter(@RequestBody CoverLetterReq req) {
        return svc.generateCoverLetter(req.resumeText(), req.jobDescription());
    }

    /**
     * Resume text extraction: used by both ResumeMatch.tsx and CoverLetter.tsx
     *
     * Frontend: POST /ai/extract-text (multipart/form-data, "file")
     * Expects: { text: "..." }
     */
    @PostMapping(
        path = "/extract-text",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Map<String, String> extractText(@RequestPart("file") MultipartFile file) {
        String text = svc.extractResumeText(file);
        return Map.of("text", text);
    }

    /**
     * Backwards-compatible alias for older code: /ai/extract-resume
     * Returns same shape as /extract-text so nothing breaks.
     */
    @PostMapping(
        path = "/extract-resume",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Map<String, String> extractResume(@RequestPart("file") MultipartFile file) {
        String text = svc.extractResumeText(file);
        return Map.of("text", text);
    }
}
