package com.ppjk.workouttracker.dto;

public record OverloadRecommendation(
        String             exerciseId,
        String             exerciseName,
        RecommendationType type,
        ProgressTrend      trend,
        double             lastWeight,
        double             suggestedWeight,
        int                lastAvgReps,
        int                targetReps,
        int                lastSets,
        long               stallingSessions,  // 0 if not stalling
        String             rationale
) {}
