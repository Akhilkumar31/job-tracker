package com.example.jtracker.mail;

public interface Mailer {
    void send(String to, String subject, String body);
}
