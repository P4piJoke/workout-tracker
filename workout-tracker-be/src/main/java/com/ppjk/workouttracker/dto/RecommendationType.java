package com.ppjk.workouttracker.dto;

public enum RecommendationType {
    INCREASE_WEIGHT,   // ready to add load
    INCREASE_REPS,     // keep weight, push for more reps
    MAINTAIN,          // on track
    DELOAD,            // stalling — reset to 90%
    BASELINE           // first session, no history
}
