package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record WorkoutRequest(
        @NotBlank String name,
        @NotNull LocalDate date,
        @NotEmpty List<WorkoutEntryRequest> entries
) {}
