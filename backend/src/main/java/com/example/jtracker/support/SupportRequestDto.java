package com.example.jtracker.support;

/**
 * Incoming payload from the Support form.
 * Frontend should send: { type, subject, message, email }
 */
public class SupportRequestDto {

    private String type;
    private String subject;
    private String message;

    public SupportRequestDto() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

}
