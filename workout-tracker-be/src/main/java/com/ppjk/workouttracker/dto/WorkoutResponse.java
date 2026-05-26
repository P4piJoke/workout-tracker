package com.ppjk.workouttracker.dto;

import com.ppjk.workouttracker.domain.WorkoutEntry;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record WorkoutResponse(
        String id,
        String name,
        LocalDate date,
        List<WorkoutEntry> entries,
        Instant createdAt
) {}
