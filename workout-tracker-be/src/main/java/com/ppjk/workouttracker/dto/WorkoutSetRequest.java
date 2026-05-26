package com.ppjk.workouttracker.dto;

import com.ppjk.workouttracker.domain.SetType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

public record WorkoutSetRequest(
        @Min(1) int reps,
        @DecimalMin("0.0") double weightKg,
        SetType type
) {}
