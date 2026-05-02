package com.tracker.service;

import com.tracker.dto.AnalyticsSummaryDTO;
import com.tracker.model.Application;
import com.tracker.model.ApplicationStatus;
import com.tracker.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.IsoFields;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ApplicationRepository applicationRepo;

    public AnalyticsSummaryDTO getSummary(String userId) {
        List<Application> apps = applicationRepo.findByUserIdOrderByUpdatedAtDesc(userId);
        long total = apps.size();

        // Count by status
        Map<String, Long> byStatus = Arrays.stream(ApplicationStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        s -> apps.stream().filter(a -> a.getStatus() == s).count(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        // Response rate: anything beyond APPLIED or WISHLIST
        long applied = apps.stream()
                .filter(a -> a.getStatus() != ApplicationStatus.WISHLIST)
                .count();
        long responded = apps.stream()
                .filter(a -> a.getStatus() != ApplicationStatus.WISHLIST
                        && a.getStatus() != ApplicationStatus.APPLIED)
                .count();
        double responseRate = applied > 0 ? (double) responded / applied * 100 : 0;

        // Group by week
        Map<String, Long> byWeek = apps.stream()
                .filter(a -> a.getDateApplied() != null)
                .collect(Collectors.groupingBy(
                        a -> {
                            LocalDate d = a.getDateApplied();
                            return d.getYear() + "-W" + String.format("%02d",
                                    d.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
                        },
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        // Group by tag
        Map<String, Long> byTag = apps.stream()
                .filter(a -> a.getTags() != null)
                .flatMap(a -> a.getTags().stream())
                .collect(Collectors.groupingBy(t -> t, Collectors.counting()));

        return AnalyticsSummaryDTO.builder()
                .totalApplications(total)
                .byStatus(byStatus)
                .responseRate(Math.round(responseRate * 10.0) / 10.0)
                .byWeek(byWeek)
                .byTag(byTag)
                .build();
    }
}
