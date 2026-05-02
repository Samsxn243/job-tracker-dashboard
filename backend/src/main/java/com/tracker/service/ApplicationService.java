package com.tracker.service;

import com.tracker.dto.ApplicationDTO;
import com.tracker.exception.ResourceNotFoundException;
import com.tracker.model.ActivityLog;
import com.tracker.model.Application;
import com.tracker.model.ApplicationStatus;
import com.tracker.repository.ActivityLogRepository;
import com.tracker.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepo;
    private final ActivityLogRepository activityLogRepo;

    public List<Application> getAllForUser(String userId) {
        return applicationRepo.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public List<Application> getByStatus(String userId, ApplicationStatus status) {
        return applicationRepo.findByUserIdAndStatus(userId, status);
    }

    public List<Application> getByTag(String userId, String tag) {
        return applicationRepo.findByUserIdAndTagsContaining(userId, tag);
    }

    public List<Application> getByDateRange(String userId, LocalDate from, LocalDate to) {
        return applicationRepo.findByUserIdAndDateRange(userId, from, to);
    }

    public List<Application> search(String userId, String keyword) {
        return applicationRepo.searchByKeyword(userId, keyword);
    }

    public Application getById(String id, String userId) {
        return applicationRepo.findById(id)
                .filter(app -> app.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    public Application create(ApplicationDTO dto, String userId) {
        Application app = Application.builder()
                .company(dto.getCompany())
                .role(dto.getRole())
                .jobUrl(dto.getJobUrl())
                .location(dto.getLocation())
                .salaryRange(dto.getSalaryRange())
                .status(dto.getStatus())
                .dateApplied(dto.getDateApplied() != null ? dto.getDateApplied() : LocalDate.now())
                .tags(dto.getTags())
                .notes(dto.getNotes())
                .contacts(dto.getContacts())
                .userId(userId)
                .build();

        Application saved = applicationRepo.save(app);

        logActivity(saved.getId(), userId, "CREATED", null, null, saved.getStatus().name());
        return saved;
    }

    public Application update(String id, ApplicationDTO dto, String userId) {
        Application existing = getById(id, userId);

        existing.setCompany(dto.getCompany());
        existing.setRole(dto.getRole());
        existing.setJobUrl(dto.getJobUrl());
        existing.setLocation(dto.getLocation());
        existing.setSalaryRange(dto.getSalaryRange());
        existing.setDateApplied(dto.getDateApplied());
        existing.setTags(dto.getTags());
        existing.setNotes(dto.getNotes());
        existing.setContacts(dto.getContacts());

        // Log status change separately if it changed
        if (existing.getStatus() != dto.getStatus()) {
            logActivity(id, userId, "STATUS_CHANGED", "status",
                    existing.getStatus().name(), dto.getStatus().name());
            existing.setStatus(dto.getStatus());
        }

        logActivity(id, userId, "UPDATED", null, null, null);
        return applicationRepo.save(existing);
    }

    public Application updateStatus(String id, ApplicationStatus newStatus, String userId) {
        Application existing = getById(id, userId);
        String oldStatus = existing.getStatus().name();

        existing.setStatus(newStatus);
        Application saved = applicationRepo.save(existing);

        logActivity(id, userId, "STATUS_CHANGED", "status", oldStatus, newStatus.name());
        return saved;
    }

    public void delete(String id, String userId) {
        Application existing = getById(id, userId);
        applicationRepo.delete(existing);
        logActivity(id, userId, "DELETED", null, existing.getCompany(), null);
    }

    public List<ActivityLog> getTimeline(String applicationId) {
        return activityLogRepo.findByApplicationIdOrderByTimestampDesc(applicationId);
    }

    private void logActivity(String appId, String userId, String action,
                             String field, String oldVal, String newVal) {
        ActivityLog log = ActivityLog.builder()
                .applicationId(appId)
                .userId(userId)
                .action(action)
                .field(field)
                .oldValue(oldVal)
                .newValue(newVal)
                .build();
        activityLogRepo.save(log);
    }
}
