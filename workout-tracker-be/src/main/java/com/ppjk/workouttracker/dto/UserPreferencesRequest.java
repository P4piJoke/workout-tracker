package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UserPreferencesRequest(
        @Min(1) int targetRepsMin,
        @Min(2) int targetRepsMax,
        @Min(1) @Max(10) int defaultSets
) {
}
