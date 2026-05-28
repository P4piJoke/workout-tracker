package com.ppjk.workouttracker.dto;

public record ExerciseProgressPoint(
        String date,
        double totalVolume,      // sum of reps × weight across all sets
        double maxWeight,
        int    totalSets
) {}
