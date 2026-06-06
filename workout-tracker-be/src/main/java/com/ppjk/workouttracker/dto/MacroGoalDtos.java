package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class MacroGoalDtos {

    public record SaveMacroGoalRequest(
            @Min(500) int targetCalories,
            @Min(0)   int targetProteinG,
            @Min(0)   int targetCarbsG,
            @Min(0)   int targetFatG,
            @NotBlank String fitnessGoal,
            double tdee
    ) {}

    public record MacroGoalResponse(
            int    targetCalories,
            int    targetProteinG,
            int    targetCarbsG,
            int    targetFatG,
            String fitnessGoal,
            double tdee,
            Instant updatedAt
    ) {}
}