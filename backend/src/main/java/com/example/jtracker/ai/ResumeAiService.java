package com.example.jtracker.ai;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeAiService {

    private final RestClient client;
    private final String apiKey;
    private final boolean mockMode;

    public ResumeAiService(
        @Value("${openai.baseUrl:https://api.openai.com/v1}") String baseUrl,
        @Value("${openai.apiKey:}") String apiKey
    ) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.mockMode = this.apiKey.isEmpty();

        this.client = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
    }

    // ------------- Resume match scoring -------------

    /**
     * Returns a JSON string. Controller turns it into Map<String,Object>.
     *
     * Required JSON shape for the frontend:
     * {
     *   "score": number (0-100),
     *   "missing_keywords": string[],
     *   "summary": string
     * }
     */
    public String score(String resumeText, String jobDescription) {
        if (mockMode) {
            return buildMockScore(resumeText, jobDescription);
        }

        try {
            Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                // Ask OpenAI to return a proper JSON object
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                    Map.of(
                        "role", "system",
                        "content", """
                            You are a resume matcher. Compare the candidate resume with the job description.
                            Respond ONLY with a single JSON object with this exact shape:

                            {
                              "score": number,                // integer 0-100
                              "missing_keywords": string[],   // array of important skills/keywords not clearly present
                              "summary": string               // short explanation in 2-4 sentences
                            }

                            Do not include any extra keys, comments, markdown, code fences, or text outside JSON.
                            """
                    ),
                    Map.of(
                        "role", "user",
                        "content",
                            "RESUME:\n" + resumeText + "\n\n" +
                            "JOB DESCRIPTION:\n" + jobDescription
                    )
                )
            );

            ResponseEntity<Map> resp = client.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(Map.class);

            Map<String, Object> responseBody = resp.getBody();
            if (responseBody == null) {
                return jsonError("Empty response from OpenAI");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices =
                (List<Map<String, Object>>) responseBody.get("choices");

            if (choices == null || choices.isEmpty()) {
                return jsonError("No choices in OpenAI response");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> msg =
                (Map<String, Object>) choices.get(0).get("message");

            if (msg == null || msg.get("content") == null) {
                return jsonError("Missing message content from OpenAI");
            }

            // In JSON mode, content is already a JSON string; just return it.
            return msg.get("content").toString();
        } catch (Exception e) {
            return jsonError("AI service error: " + safe(e.getMessage()));
        }
    }

    // Simple mock scoring when no OPENAI_API_KEY is set
    private String buildMockScore(String resumeText, String jobDescription) {
        String resumeLower = opt(resumeText).toLowerCase(Locale.ROOT);
        String jdLower = opt(jobDescription).toLowerCase(Locale.ROOT);

        // crude keyword extraction from JD
        String[] tokens = jdLower.split("[^a-z0-9+]+");
        Set<String> ignore = Set.of(
            "and", "the", "with", "for", "you", "will", "this", "that",
            "job", "role", "we", "our", "your", "to", "in", "of", "on", "as", "be"
        );
        Set<String> jdKeywords = Arrays.stream(tokens)
            .filter(t -> t.length() > 3)
            .filter(t -> !ignore.contains(t))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        if (jdKeywords.isEmpty()) {
            return """
                {
                  "score": 0,
                  "missing_keywords": ["No meaningful keywords found in job description"],
                  "mode": "MOCK"
                }
                """;
        }

        List<String> missing = new ArrayList<>();
        int presentCount = 0;
        for (String kw : jdKeywords) {
            if (resumeLower.contains(kw)) {
                presentCount++;
            } else {
                missing.add(kw);
            }
        }

        int score = (int) Math.round(100.0 * presentCount / jdKeywords.size());

        return """
            {
              "score": %d,
              "missing_keywords": %s,
              "mode": "MOCK"
            }
            """.formatted(score, toJsonArray(missing));
    }

    // ------------- Cover letter generation -------------

    public String generateCoverLetter(String resumeText, String jobDescription) {
        if (mockMode) {
            return """
                Dear Hiring Manager,

                This is a mock cover letter generated because no OpenAI API key is configured.
                Once you set the OPENAI_API_KEY environment variable, JobTracker will generate a
                fully tailored cover letter based on your resume and the job description.

                In a real letter, this section would highlight how your skills and experience
                match the role, followed by a confident closing.

                Sincerely,
                JobTracker Mock AI
                """;
        }

        try {
            Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                    Map.of(
                        "role", "system",
                        "content", """
                            You write concise, professional cover letters for job applications.
                            Tone: friendly, confident, not overly formal. Length: 3–5 short paragraphs.
                            Output only the letter text, no JSON and no extra commentary.
                            """
                    ),
                    Map.of(
                        "role", "user",
                        "content",
                            "Here is the candidate's resume:\n" + resumeText +
                            "\n\nHere is the job description:\n" + jobDescription +
                            "\n\nWrite a tailored cover letter."
                    )
                )
            );

            ResponseEntity<Map> resp = client.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(Map.class);

            Map<String, Object> responseBody = resp.getBody();
            if (responseBody == null) {
                return "AI error: empty response from OpenAI";
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices =
                (List<Map<String, Object>>) responseBody.get("choices");

            if (choices == null || choices.isEmpty()) {
                return "AI error: no choices returned";
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> msg =
                (Map<String, Object>) choices.get(0).get("message");

            if (msg == null || msg.get("content") == null) {
                return "AI error: missing message content";
            }

            return msg.get("content").toString();
        } catch (Exception e) {
            return "AI service error: " + e.getMessage();
        }
    }

    // ------------- File text extraction -------------

    public String extractResumeText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Empty file");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new RuntimeException("Missing file name");
        }

        String lower = filename.toLowerCase(Locale.ROOT);

        try {
            if (lower.endsWith(".txt")) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } else if (lower.endsWith(".pdf")) {
                try (InputStream is = file.getInputStream();
                     PDDocument doc = PDDocument.load(is)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            } else if (lower.endsWith(".docx")) {
                try (InputStream is = file.getInputStream();
                     XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            } else {
                throw new RuntimeException("Unsupported file type: " + lower);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read resume file", e);
        }
    }

    // ------------- Helpers -------------

    private static String opt(String s) {
        return s == null ? "" : s;
    }

    private static String safe(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ");
    }

    private static String toJsonArray(List<String> items) {
        return items.stream()
            .map(s -> "\"" + safe(s) + "\"")
            .collect(Collectors.joining(",", "[", "]"));
    }

    private static String jsonError(String message) {
        return """
            {
              "score": 0,
              "missing_keywords": ["%s"],
              "mode": "ERROR"
            }
            """.formatted(safe(message));
    }
}
