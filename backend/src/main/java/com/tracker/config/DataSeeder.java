package com.tracker.config;

import com.tracker.model.Application;
import com.tracker.model.ApplicationStatus;
import com.tracker.model.Contact;
import com.tracker.model.User;
import com.tracker.repository.ApplicationRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final ApplicationRepository appRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database with sample data...");

        // Create demo user
        User demo = userRepo.save(User.builder()
                .email("demo@jobtracker.dev")
                .password(passwordEncoder.encode("password123"))
                .displayName("Samson")
                .build());

        String uid = demo.getId();

        // Seed applications across all statuses
        List<Application> apps = List.of(
            app(uid, "Google", "Senior Software Engineer", ApplicationStatus.WISHLIST,
                    LocalDate.now().minusDays(1), List.of("remote", "big-tech"),
                    List.of(), List.of("$180k-$250k range")),

            app(uid, "Stripe", "Full Stack Engineer", ApplicationStatus.APPLIED,
                    LocalDate.now().minusDays(10), List.of("fintech", "remote"),
                    List.of(contact("Sarah Chen", "Eng Manager")), List.of("Applied via careers page")),

            app(uid, "Anthropic", "Platform Engineer", ApplicationStatus.APPLIED,
                    LocalDate.now().minusDays(8), List.of("ai", "startup"),
                    List.of(), List.of("Referral from Alex")),

            app(uid, "MongoDB", "Staff Engineer", ApplicationStatus.PHONE_SCREEN,
                    LocalDate.now().minusDays(20), List.of("database", "remote"),
                    List.of(contact("James Park", "Recruiter")),
                    List.of("Phone screen scheduled for next Tuesday")),

            app(uid, "Datadog", "Backend Engineer", ApplicationStatus.PHONE_SCREEN,
                    LocalDate.now().minusDays(18), List.of("observability", "hybrid"),
                    List.of(), List.of("Completed OA, waiting for results")),

            app(uid, "Confluent", "Streaming Platform Engineer", ApplicationStatus.INTERVIEW,
                    LocalDate.now().minusDays(30), List.of("kafka", "remote"),
                    List.of(contact("Maria Lopez", "Hiring Manager")),
                    List.of("System design round on Friday", "Prep distributed systems")),

            app(uid, "Notion", "Full Stack Engineer", ApplicationStatus.INTERVIEW,
                    LocalDate.now().minusDays(25), List.of("productivity", "hybrid"),
                    List.of(), List.of("Final round completed", "Waiting on decision")),

            app(uid, "Vercel", "Software Engineer", ApplicationStatus.OFFER,
                    LocalDate.now().minusDays(40), List.of("frontend", "remote"),
                    List.of(contact("Tom Wilson", "VP Eng")),
                    List.of("Offer: $195k base + equity", "Negotiating start date")),

            app(uid, "Palantir", "Forward Deployed Engineer", ApplicationStatus.REJECTED,
                    LocalDate.now().minusDays(35), List.of("big-tech", "onsite"),
                    List.of(), List.of("Rejected after onsite", "Feedback: more system design prep")),

            app(uid, "Shopify", "Senior Developer", ApplicationStatus.REJECTED,
                    LocalDate.now().minusDays(45), List.of("ecommerce", "remote"),
                    List.of(), List.of("No response after 3 weeks")),

            app(uid, "Supabase", "Backend Engineer", ApplicationStatus.APPLIED,
                    LocalDate.now().minusDays(5), List.of("database", "remote", "startup"),
                    List.of(), List.of()),

            app(uid, "Linear", "Product Engineer", ApplicationStatus.WISHLIST,
                    LocalDate.now(), List.of("productivity", "remote"),
                    List.of(), List.of("Check if they're hiring for backend")),

            app(uid, "Figma", "Full Stack Engineer", ApplicationStatus.APPLIED,
                    LocalDate.now().minusDays(12), List.of("design-tools", "hybrid"),
                    List.of(), List.of("Applied through LinkedIn")),

            app(uid, "Elastic", "Search Engineer", ApplicationStatus.PHONE_SCREEN,
                    LocalDate.now().minusDays(15), List.of("search", "remote"),
                    List.of(contact("Nina Patel", "Tech Lead")),
                    List.of("Great culture fit conversation")),

            app(uid, "Twilio", "API Platform Engineer", ApplicationStatus.WITHDRAWN,
                    LocalDate.now().minusDays(50), List.of("api", "remote"),
                    List.of(), List.of("Withdrew after accepting Vercel offer"))
        );

        appRepo.saveAll(apps);
        log.info("Seeded {} applications for demo user (email: demo@jobtracker.dev / pass: password123)", apps.size());
    }

    private Application app(String userId, String company, String role, ApplicationStatus status,
                            LocalDate dateApplied, List<String> tags,
                            List<Contact> contacts, List<String> notes) {
        return Application.builder()
                .userId(userId).company(company).role(role).status(status)
                .dateApplied(dateApplied).tags(tags).contacts(contacts).notes(notes)
                .jobUrl("https://careers." + company.toLowerCase().replaceAll("\\s+", "") + ".com")
                .location("Remote")
                .build();
    }

    private Contact contact(String name, String role) {
        return Contact.builder().name(name).role(role).build();
    }
}
