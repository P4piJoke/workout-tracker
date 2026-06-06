package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UserPreferencesRequest(
        @Min(1) int targetRepsMin,
        @Min(2) int targetRepsMax,
        @Min(1) @Max(10) int defaultSets,

        // ── Optional body fields ────────────────────────────────────────
        Integer heightCm,      // null = not set yet
        String sex,           // "MALE" | "FEMALE" | null
        String activityLevel  // "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE" | null
) {
}