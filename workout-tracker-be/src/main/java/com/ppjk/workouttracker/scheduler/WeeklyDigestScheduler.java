package com.ppjk.workouttracker.scheduler;

import com.ppjk.workouttracker.domain.UserPreferences;
import com.ppjk.workouttracker.repository.mongo.UserPreferencesRepository;
import com.ppjk.workouttracker.service.EmailService;
import com.ppjk.workouttracker.service.WeeklyDigestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

/**
 * Fires every Monday at 08:00 (configurable via digest.cron in application.yaml).
 *
 * Responsibility is narrow: determine the week window, find all opted-in users,
 * and delegate data gathering + sending to the appropriate services.
 *
 * Analogy: think of this as a Monday morning manager who hands each team member
 * (user) a personalised report card. The scheduler doesn't compile the report —
 * it just knows when to trigger the process and who to send it to.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class WeeklyDigestScheduler {

    private final UserPreferencesRepository preferencesRepository;
    private final WeeklyDigestService       digestService;
    private final EmailService              emailService;

    /**
     * Cron expression from application.yaml: "0 0 8 * * MON"
     * Meaning: second=0, minute=0, hour=8, any day-of-month, any month, Monday.
     */
    @Scheduled(cron = "${digest.cron}")
    public void sendWeeklyDigests() {
        // The digest fires on Monday morning and covers the PREVIOUS week:
        // Mon 2026-06-08 → covers Mon 2026-06-01 through Sun 2026-06-07
        LocalDate today     = LocalDate.now();
        LocalDate weekEnd   = today.minusDays(1);                                // last Sunday
        LocalDate weekStart = weekEnd.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        log.info("Weekly digest job started — covering {} to {}", weekStart, weekEnd);

        // Fetch all user preference documents where digest is enabled.
        // Each document contains userId + email preference flag.
        // Users who never set preferences (no document) have opted in by default —
        // but since we have no email for them yet, we only process stored records.
        var optedInUsers = preferencesRepository.findByWeeklyDigestEnabledTrue();

        log.info("Found {} opted-in users.", optedInUsers.size());

        int sent    = 0;
        int skipped = 0;

        for (var prefs : optedInUsers) {
            if (prefs.getEmail() == null || prefs.getEmail().isBlank()) {
                log.warn("User {} has no email stored — skipping.", prefs.getUserId());
                skipped++;
                continue;
            }

            try {
                var maybeDigest = digestService.buildDigest(
                        prefs.getUserId(),
                        prefs.getEmail(),
                        prefs.getUsername() != null ? prefs.getUsername() : "Athlete",
                        weekStart,
                        weekEnd
                );

                if (maybeDigest.isPresent()) {
                    emailService.sendWeeklyDigest(maybeDigest.get());
                    sent++;
                } else {
                    log.debug("User {} had no sessions this week — skipping email.",
                            prefs.getUserId());
                    skipped++;
                }
            } catch (Exception ex) {
                // Per-user failures must not abort the loop — other users still
                // deserve their digest even if one user's data is broken.
                log.error("Error processing digest for user {}: {}",
                        prefs.getUserId(), ex.getMessage(), ex);
                skipped++;
            }
        }

        log.info("Weekly digest job complete — sent: {}, skipped/failed: {}", sent, skipped);
    }
}