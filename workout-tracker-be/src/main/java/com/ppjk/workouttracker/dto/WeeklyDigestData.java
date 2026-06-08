package com.ppjk.workouttracker.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * All data needed to render one user's weekly digest email.
 * Built once per user by WeeklyDigestServiceImpl, then handed to EmailService.
 *
 * Analogy: think of this as a "filled-in form" — the service gathers the
 * facts, stuffs them into this record, and the email renderer just reads it.
 * No database access happens during rendering.
 */
public record WeeklyDigestData(

        // ── Recipient ────────────────────────────────────────────────────
        String toEmail,
        String username,

        // ── Week window ───────────────────────────────────────────────────
        LocalDate weekStart,   // Monday
        LocalDate weekEnd,     // Sunday

        // ── Summary stats ─────────────────────────────────────────────────
        int    sessionsLogged,
        double totalVolumeKg,  // sum of reps × weight across all WORKING sets

        // ── PRs hit this week ─────────────────────────────────────────────
        List<PrHit> newPrs,

        // ── Muscle balance ────────────────────────────────────────────────
        List<MuscleWeekEntry> muscleVolume,   // all muscles trained this week
        List<String> undertrainedMuscles      // muscles below MEV threshold

) {
    /**
     * A single new personal record achieved this week.
     */
    public record PrHit(
            String exerciseName,
            double weightKg,
            int    reps,
            double estimatedOneRM   // Epley: weight × (1 + reps / 30)
    ) {}

    /**
     * How many WORKING sets a muscle group received this week.
     */
    public record MuscleWeekEntry(
            String muscle,
            int    sets
    ) {}
}