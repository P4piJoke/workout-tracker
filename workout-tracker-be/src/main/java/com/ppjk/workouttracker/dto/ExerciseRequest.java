package com.ppjk.workouttracker.dto;

import com.ppjk.workouttracker.domain.ExerciseType;
import com.ppjk.workouttracker.domain.MuscleGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ExerciseRequest(
        @NotBlank String name,
        String description,
        @NotNull MuscleGroup primaryMuscle,
        List<MuscleGroup> secondaryMuscles,
        @NotNull ExerciseType type
) {}
