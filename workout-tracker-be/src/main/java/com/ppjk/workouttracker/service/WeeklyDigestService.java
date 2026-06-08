package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.WeeklyDigestData;

import java.time.LocalDate;
import java.util.Optional;

public interface WeeklyDigestService {

    /**
     * Aggregate one user's workout data for the given week window.
     *
     * Returns Optional.empty() if the user logged no sessions that week
     * (callers should skip sending the email in that case).
     *
     * @param userId    Keycloak subject (the user's unique ID in MongoDB)
     * @param toEmail   Email address extracted from the JWT / user record
     * @param username  Display name for the email greeting
     * @param weekStart Monday of the target week
     * @param weekEnd   Sunday of the target week
     */
    Optional<WeeklyDigestData> buildDigest(
            String userId,
            String toEmail,
            String username,
            LocalDate weekStart,
            LocalDate weekEnd
    );
}