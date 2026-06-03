package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ExercisePreferencesRequest(
        @NotBlank String exerciseName,
        @Min(1) int targetRepsMin,
        @Min(2) int targetRepsMax
) {
}