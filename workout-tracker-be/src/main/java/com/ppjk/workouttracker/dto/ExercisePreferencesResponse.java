package com.ppjk.workouttracker.dto;

public record ExercisePreferencesResponse(
        String exerciseId,
        String exerciseName,
        int targetRepsMin,
        int targetRepsMax
) {
}
