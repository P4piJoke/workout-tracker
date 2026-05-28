package com.ppjk.workouttracker.dto;

import java.time.LocalDate;

public record PersonalRecord(
        String exerciseId,
        String exerciseName,
        double estimatedOneRM,   // Epley: weight × (1 + reps / 30)
        double weight,
        int    reps,
        LocalDate date
) {}
