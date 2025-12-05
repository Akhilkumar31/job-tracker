package com.example.jtracker.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    // Display name shown in navbar / profile
    @Column
    private String displayName;

    // When this user joined JobTracker
    @Column
    private LocalDateTime createdAt = LocalDateTime.now();

    // Email where reminders are sent (defaults to login email)
    @Column
    private String reminderEmail;

    // Default reminder message text
    @Column(length = 2000)
    private String defaultReminderMessage;

    // Current job company name
    @Column
    private String currentCompany;

    // Date of birth
    @Column
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getReminderEmail() { return reminderEmail; }
    public void setReminderEmail(String reminderEmail) { this.reminderEmail = reminderEmail; }

    public String getDefaultReminderMessage() { return defaultReminderMessage; }
    public void setDefaultReminderMessage(String defaultReminderMessage) { this.defaultReminderMessage = defaultReminderMessage; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
