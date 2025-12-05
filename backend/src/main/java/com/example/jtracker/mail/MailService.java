package com.example.jtracker.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService implements Mailer {

    private final JavaMailSender sender;
    private final String fromAddress;

    public MailService(
            JavaMailSender sender,
            @Value("${jtracker.mail.from-address:}") String fromAddress
    ) {
        this.sender = sender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void send(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);

        if (fromAddress != null && !fromAddress.isBlank()) {
            msg.setFrom(fromAddress);
        }

        msg.setSubject(subject);
        msg.setText(body);

        sender.send(msg);
    }
}
