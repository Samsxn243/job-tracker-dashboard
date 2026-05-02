package com.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
    private long totalApplications;
    private Map<String, Long> byStatus;
    private double responseRate;       // % that moved past APPLIED
    private Map<String, Long> byWeek;  // "2026-W23" -> count
    private Map<String, Long> byTag;
}
