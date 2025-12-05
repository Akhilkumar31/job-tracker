package com.example.jtracker.mail;

// Not a Spring bean
public class NoopMailer implements Mailer {

    @Override
    public void send(String to, String subject, String body) {
        // do nothing
    }
}
