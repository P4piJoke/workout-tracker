package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record WorkoutEntryRequest(
        @NotBlank String exerciseId,
        @NotBlank String exerciseName,
        @NotEmpty List<WorkoutSetRequest> sets
) {}
