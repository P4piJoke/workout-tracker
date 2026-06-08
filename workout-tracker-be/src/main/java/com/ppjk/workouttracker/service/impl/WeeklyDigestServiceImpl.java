package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.domain.SetType;
import com.ppjk.workouttracker.domain.Workout;
import com.ppjk.workouttracker.domain.WorkoutEntry;
import com.ppjk.workouttracker.domain.WorkoutSet;
import com.ppjk.workouttracker.dto.WeeklyDigestData;
import com.ppjk.workouttracker.dto.WeeklyDigestData.MuscleWeekEntry;
import com.ppjk.workouttracker.dto.WeeklyDigestData.PrHit;
import com.ppjk.workouttracker.repository.mongo.ExerciseMongoRepository;
import com.ppjk.workouttracker.repository.mongo.WorkoutRepository;
import com.ppjk.workouttracker.service.WeeklyDigestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyDigestServiceImpl implements WeeklyDigestService {

    private final WorkoutRepository     workoutRepository;
    private final ExerciseMongoRepository exerciseMongoRepository;

    /**
     * All muscle groups the app tracks — used to detect which ones the user
     * completely skipped this week.
     */
    private static final Set<String> ALL_MUSCLES = Set.of(
            "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS",
            "LEGS", "GLUTES", "CORE", "CALVES", "FOREARMS"
    );

    @Override
    public Optional<WeeklyDigestData> buildDigest(
            String userId,
            String toEmail,
            String username,
            LocalDate weekStart,
            LocalDate weekEnd) {

        // ── 1. Fetch ALL workouts for the user ordered newest-first ───────────
        //
        // We need the full history (not just this week) because PR detection
        // requires comparing this week's best lifts against all previous bests.
        // Analogy: to know if you broke a record, you need the full scoreboard,
        // not just last week's scores.
        List<Workout> allWorkouts = workoutRepository
                .findByUserIdOrderByDateDesc(userId);

        List<Workout> thisWeek = allWorkouts.stream()
                .filter(w -> !w.getDate().isBefore(weekStart)
                        && !w.getDate().isAfter(weekEnd))
                .toList();

        if (thisWeek.isEmpty()) {
            log.debug("User {} logged no sessions in week {}-{} — skipping digest.",
                    userId, weekStart, weekEnd);
            return Optional.empty();
        }

        List<Workout> previousWeeks = allWorkouts.stream()
                .filter(w -> w.getDate().isBefore(weekStart))
                .toList();

        // ── 2. Total sessions + volume ────────────────────────────────────────
        int sessions = thisWeek.size();

        double totalVolume = thisWeek.stream()
                .flatMap(w -> w.getEntries().stream())
                .flatMap(e -> e.getSets().stream())
                .filter(s -> s.getType() == SetType.WORKING)
                .mapToDouble(s -> s.getReps() * s.getWeightKg())
                .sum();

        totalVolume = Math.round(totalVolume * 10.0) / 10.0;

        // ── 3. PR detection ───────────────────────────────────────────────────
        //
        // For each exercise done this week, compute the best estimated 1RM
        // achieved. Then compare against the best 1RM ever achieved in all
        // PREVIOUS sessions. If this week's best > previous best → new PR.
        Map<String, Double> bestPreviousOneRM = buildPreviousBestMap(previousWeeks);
        List<PrHit> newPrs = detectPrs(thisWeek, bestPreviousOneRM);

        // ── 4. Muscle balance (WORKING sets only) ─────────────────────────────
        //
        // We need exercise → primaryMuscle. Fetch in one batch query.
        Set<String> exerciseIds = thisWeek.stream()
                .flatMap(w -> w.getEntries().stream())
                .map(WorkoutEntry::getExerciseId)
                .collect(Collectors.toSet());

        Map<String, String> muscleById = exerciseMongoRepository
                .findAllById(exerciseIds).stream()
                .collect(Collectors.toMap(
                        e -> e.getId(),
                        e -> e.getPrimaryMuscle().name()
                ));

        Map<String, Integer> setsPerMuscle = new HashMap<>();
        thisWeek.stream()
                .flatMap(w -> w.getEntries().stream())
                .forEach(entry -> {
                    String muscle = muscleById.get(entry.getExerciseId());
                    if (muscle == null) return;
                    long workingSets = entry.getSets().stream()
                            .filter(s -> s.getType() == SetType.WORKING)
                            .count();
                    setsPerMuscle.merge(muscle, (int) workingSets, Integer::sum);
                });

        List<MuscleWeekEntry> muscleVolume = setsPerMuscle.entrySet().stream()
                .map(en -> new MuscleWeekEntry(en.getKey(), en.getValue()))
                .sorted(Comparator.comparing(MuscleWeekEntry::sets).reversed())
                .toList();

        // ── 5. Undertrained muscles ───────────────────────────────────────────
        //
        // A muscle is undertrained if the user trained it but stayed below 6
        // WORKING sets (MEV threshold), OR if they skipped it entirely.
        // We only flag muscles the user has historically trained — skipping
        // FOREARMS if you never do forearm work isn't a warning worth sending.
        Set<String> everTrained = buildEverTrainedMuscles(allWorkouts, muscleById,
                exerciseMongoRepository.findAllById(
                        allWorkouts.stream()
                                .flatMap(w -> w.getEntries().stream())
                                .map(WorkoutEntry::getExerciseId)
                                .collect(Collectors.toSet())
                ).stream().collect(Collectors.toMap(
                        e -> e.getId(),
                        e -> e.getPrimaryMuscle().name()
                )));

        List<String> undertrainedMuscles = everTrained.stream()
                .filter(muscle -> setsPerMuscle.getOrDefault(muscle, 0) < 6)
                .sorted()
                .toList();

        return Optional.of(new WeeklyDigestData(
                toEmail,
                username,
                weekStart,
                weekEnd,
                sessions,
                totalVolume,
                newPrs,
                muscleVolume,
                undertrainedMuscles
        ));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Build a map of exerciseId → best estimated 1RM ever achieved
     * across all workouts BEFORE this week.
     */
    private Map<String, Double> buildPreviousBestMap(List<Workout> previousWorkouts) {
        Map<String, Double> best = new HashMap<>();

        previousWorkouts.stream()
                .flatMap(w -> w.getEntries().stream())
                .forEach(entry ->
                        entry.getSets().stream()
                                .filter(s -> s.getType() == SetType.WORKING
                                        && s.getWeightKg() > 0
                                        && s.getReps() > 0)
                                .forEach(s -> {
                                    double e1rm = epley(s.getWeightKg(), s.getReps());
                                    best.merge(entry.getExerciseId(), e1rm, Math::max);
                                })
                );

        return best;
    }

    /**
     * For each exercise done this week, find the WORKING set with the highest
     * estimated 1RM. If it exceeds the previous all-time best, it's a new PR.
     */
    private List<PrHit> detectPrs(
            List<Workout> thisWeek,
            Map<String, Double> previousBest) {

        // exerciseId → best set achieved this week
        Map<String, WorkoutSet> bestSetThisWeek = new HashMap<>();
        Map<String, String>     exerciseNames   = new HashMap<>();

        thisWeek.stream()
                .flatMap(w -> w.getEntries().stream())
                .forEach(entry -> {
                    exerciseNames.put(entry.getExerciseId(), entry.getExerciseName());
                    entry.getSets().stream()
                            .filter(s -> s.getType() == SetType.WORKING
                                    && s.getWeightKg() > 0
                                    && s.getReps() > 0)
                            .forEach(s -> {
                                double e1rm = epley(s.getWeightKg(), s.getReps());
                                bestSetThisWeek.merge(
                                        entry.getExerciseId(), s,
                                        (existing, candidate) ->
                                                epley(candidate.getWeightKg(), candidate.getReps())
                                                        > epley(existing.getWeightKg(), existing.getReps())
                                                        ? candidate : existing
                                );
                            });
                });

        List<PrHit> prs = new ArrayList<>();
        bestSetThisWeek.forEach((exId, set) -> {
            double thisE1rm = epley(set.getWeightKg(), set.getReps());
            double prevBest = previousBest.getOrDefault(exId, 0.0);

            if (thisE1rm > prevBest) {
                prs.add(new PrHit(
                        exerciseNames.get(exId),
                        set.getWeightKg(),
                        set.getReps(),
                        Math.round(thisE1rm * 10.0) / 10.0
                ));
            }
        });

        prs.sort(Comparator.comparing(PrHit::exerciseName));
        return prs;
    }

    /**
     * Collect all muscles the user has EVER trained across their whole history.
     * We only warn about muscles the user actually cares about.
     */
    private Set<String> buildEverTrainedMuscles(
            List<Workout> allWorkouts,
            Map<String, String> thisWeekMuscleById,
            Map<String, String> allTimeMuscleById) {

        return allWorkouts.stream()
                .flatMap(w -> w.getEntries().stream())
                .map(e -> allTimeMuscleById.getOrDefault(
                        e.getExerciseId(),
                        thisWeekMuscleById.get(e.getExerciseId())))
                .filter(m -> m != null)
                .collect(Collectors.toSet());
    }

    /** Epley formula: weight × (1 + reps / 30) */
    private double epley(double weightKg, int reps) {
        return weightKg * (1 + reps / 30.0);
    }
}