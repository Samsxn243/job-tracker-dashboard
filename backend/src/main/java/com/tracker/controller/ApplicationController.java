package com.tracker.controller;

import com.opencsv.CSVWriter;
import com.tracker.dto.ApplicationDTO;
import com.tracker.dto.StatusUpdateDTO;
import com.tracker.model.ActivityLog;
import com.tracker.model.Application;
import com.tracker.model.ApplicationStatus;
import com.tracker.service.ApplicationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // ── List & Filter ──

    @GetMapping
    public ResponseEntity<List<Application>> getAll(
            Authentication auth,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String search) {

        String userId = auth.getName();

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(applicationService.search(userId, search));
        }
        if (status != null) {
            return ResponseEntity.ok(applicationService.getByStatus(userId, status));
        }
        if (tag != null) {
            return ResponseEntity.ok(applicationService.getByTag(userId, tag));
        }
        if (from != null && to != null) {
            return ResponseEntity.ok(applicationService.getByDateRange(userId, from, to));
        }

        return ResponseEntity.ok(applicationService.getAllForUser(userId));
    }

    // ── Single Application ──

    @GetMapping("/{id}")
    public ResponseEntity<Application> getById(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(applicationService.getById(id, auth.getName()));
    }

    // ── Create ──

    @PostMapping
    public ResponseEntity<Application> create(@Valid @RequestBody ApplicationDTO dto, Authentication auth) {
        Application created = applicationService.create(dto, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── Update ──

    @PutMapping("/{id}")
    public ResponseEntity<Application> update(@PathVariable String id,
                                              @Valid @RequestBody ApplicationDTO dto,
                                              Authentication auth) {
        return ResponseEntity.ok(applicationService.update(id, dto, auth.getName()));
    }

    // ── Status Update (Kanban drag-drop) ──

    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable String id,
                                                    @Valid @RequestBody StatusUpdateDTO dto,
                                                    Authentication auth) {
        return ResponseEntity.ok(applicationService.updateStatus(id, dto.getStatus(), auth.getName()));
    }

    // ── Delete ──

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        applicationService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // ── Timeline ──

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<ActivityLog>> getTimeline(@PathVariable String id, Authentication auth) {
        // Verify ownership
        applicationService.getById(id, auth.getName());
        return ResponseEntity.ok(applicationService.getTimeline(id));
    }

    // ── CSV Export ──

    @GetMapping("/export/csv")
    public void exportCsv(Authentication auth, HttpServletResponse response) throws IOException {
        String userId = auth.getName();
        List<Application> apps = applicationService.getAllForUser(userId);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=applications.csv");

        try (CSVWriter writer = new CSVWriter(response.getWriter())) {
            writer.writeNext(new String[]{
                    "Company", "Role", "Status", "Date Applied",
                    "Location", "Salary Range", "Tags", "Job URL"
            });

            for (Application app : apps) {
                writer.writeNext(new String[]{
                        app.getCompany(),
                        app.getRole(),
                        app.getStatus().name(),
                        app.getDateApplied() != null ? app.getDateApplied().toString() : "",
                        app.getLocation() != null ? app.getLocation() : "",
                        app.getSalaryRange() != null ? app.getSalaryRange() : "",
                        app.getTags() != null ? String.join(", ", app.getTags()) : "",
                        app.getJobUrl() != null ? app.getJobUrl() : ""
                });
            }
        }
    }
}
