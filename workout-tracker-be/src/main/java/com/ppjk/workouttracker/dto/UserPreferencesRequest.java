package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UserPreferencesRequest(
        @Min(1) int targetRepsMin,
        @Min(2) int targetRepsMax,
        @Min(1) @Max(10) int defaultSets,

        // ── Optional body fields ────────────────────────────────────────
        Integer heightCm,
        String sex,
        String activityLevel,

        // ── Weekly digest opt-out ───────────────────────────────────────
        // Nullable so existing callers that don't send this field keep their
        // current preference. True/false when explicitly set by the user.
        Boolean weeklyDigestEnabled
) {}