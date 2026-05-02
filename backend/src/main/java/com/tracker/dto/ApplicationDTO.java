package com.tracker.dto;

import com.tracker.model.ApplicationStatus;
import com.tracker.model.Contact;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDTO {

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Role is required")
    private String role;

    private String jobUrl;
    private String location;
    private String salaryRange;

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    private LocalDate dateApplied;
    private List<String> tags;
    private List<String> notes;
    private List<Contact> contacts;
}
