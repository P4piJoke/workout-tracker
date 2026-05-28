package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.MuscleGroup;
import com.ppjk.workouttracker.domain.WorkoutSet;
import com.ppjk.workouttracker.dto.OverloadRecommendation;
import com.ppjk.workouttracker.dto.ProgressTrend;
import com.ppjk.workouttracker.dto.RecommendationType;
import com.ppjk.workouttracker.repository.mongo.ExerciseMongoRepository;
import com.ppjk.workouttracker.repository.mongo.WorkoutRepository;
import com.ppjk.workouttracker.service.ProgressiveOverloadService;
import com.ppjk.workouttracker.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressiveOverloadServiceImpl implements ProgressiveOverloadService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseMongoRepository exerciseMongoRepository;
    private final UserPreferencesService preferencesService;
    private static final int    WINDOW      = 5;    // sessions to inspect for stall

    // kg to add when the user earns a weight increase, by muscle group
    private static final Map<MuscleGroup, Double> INCREMENT = Map.ofEntries(
            Map.entry(MuscleGroup.CHEST,     2.5),
            Map.entry(MuscleGroup.BACK,      2.5),
            Map.entry(MuscleGroup.SHOULDERS, 2.5),
            Map.entry(MuscleGroup.BICEPS,    2.5),
            Map.entry(MuscleGroup.TRICEPS,   2.5),
            Map.entry(MuscleGroup.FOREARMS,  2.5),
            Map.entry(MuscleGroup.LEGS,      5.0),
            Map.entry(MuscleGroup.GLUTES,    5.0),
            Map.entry(MuscleGroup.CALVES,    2.5),
            Map.entry(MuscleGroup.CORE,      0.0)
    );

    @Override
    public List<OverloadRecommendation> recommendations() {
        var prefs    = preferencesService.getOrDefault();  // ← per-user
        int targetMin = prefs.getTargetRepsMin();
        int targetMax = prefs.getTargetRepsMax();
        var workouts = workoutRepository
                .findByUserIdOrderByDateDesc(SecurityUtils.currentUserId());

        // group sessions chronologically per exercise (desc from query, so index 0 = latest)
        Map<String, List<SessionSnapshot>> byExercise = new LinkedHashMap<>();
        for (var workout : workouts) {
            for (var entry : workout.getEntries()) {
                byExercise
                        .computeIfAbsent(entry.getExerciseId(), k -> new ArrayList<>())
                        .add(new SessionSnapshot(
                                workout.getDate(), entry.getExerciseName(), entry.getSets()));
            }
        }

        // batch-load exercises for muscle-group-aware increments
        Map<String, Exercise> exerciseById = exerciseMongoRepository
                .findAllById(byExercise.keySet()).stream()
                .collect(Collectors.toMap(Exercise::getId, e -> e));

        return byExercise.entrySet().stream()
                .map(e -> analyze(
                        e.getKey(), e.getValue(),
                        incrementFor(exerciseById.get(e.getKey())), targetMin, targetMax))
                .sorted(Comparator.comparingInt(r -> r.trend().ordinal()))  // IMPROVING first
                .toList();
    }

    // ── Core analysis ────────────────────────────────────────────
    private OverloadRecommendation analyze(
            String exerciseId,
            List<SessionSnapshot> sessions,   // index 0 = most recent
            double increment,
            int targetMin,      // ← was TARGET_MIN
            int targetMax){

        var last = sessions.get(0);
        String name     = last.exerciseName();
        double lastMaxW = maxWeight(last);
        int    avgReps  = avgReps(last);
        int    sets     = last.sets().size();

        if (sessions.size() == 1) {
            return rec(exerciseId, name, RecommendationType.BASELINE, ProgressTrend.NEW,
                    lastMaxW, lastMaxW, avgReps, targetMax, sets, 0,
                    "First session recorded — use this as your baseline.");
        }

        var prev       = sessions.get(1);
        double prevMaxW = maxWeight(prev);

        // detect trend
        ProgressTrend trend;
        long          stallCount = 0;
        if (lastMaxW > prevMaxW) {
            trend = ProgressTrend.IMPROVING;
        } else if (lastMaxW < prevMaxW) {
            trend = ProgressTrend.DECLINING;
        } else {
            // same weight — count how many recent sessions share it
            stallCount = sessions.stream()
                    .limit(WINDOW)
                    .filter(s -> maxWeight(s) == lastMaxW)
                    .count();
            trend = stallCount >= 2 ? ProgressTrend.STALLING : ProgressTrend.IMPROVING;
        }

        return switch (trend) {

            case IMPROVING -> {
                if (avgReps >= targetMax) {
                    // earned a weight jump
                    yield rec(exerciseId, name,
                            RecommendationType.INCREASE_WEIGHT, trend,
                            lastMaxW, lastMaxW + increment,
                            avgReps, targetMin, sets, 0,
                            String.format(
                                    "Averaging %d reps at %.1f kg — bump to %.1f kg " +
                                            "and target %d reps next session.",
                                    avgReps, lastMaxW, lastMaxW + increment, targetMin));
                } else {
                    // still room to add reps at current load
                    int targetReps = Math.min(avgReps + 1, targetMax);
                    yield rec(exerciseId, name,
                            RecommendationType.INCREASE_REPS, trend,
                            lastMaxW, lastMaxW,
                            avgReps, targetReps, sets, 0,
                            String.format(
                                    "Keep %.1f kg — push for %d reps per set this session.",
                                    lastMaxW, targetReps));
                }
            }

            case STALLING -> {
                // round deload to nearest 2.5 kg plate
                double deload = Math.round((lastMaxW * 0.9) / 2.5) * 2.5;
                yield rec(exerciseId, name,
                        RecommendationType.DELOAD, trend,
                        lastMaxW, deload,
                        avgReps, targetMax, sets, stallCount,
                        String.format(
                                "Stuck at %.1f kg for %d sessions. " +
                                        "Deload to %.1f kg, rebuild to %d reps, then push past the plateau.",
                                lastMaxW, stallCount, deload, targetMax));
            }

            case DECLINING -> {
                yield rec(exerciseId, name,
                        RecommendationType.MAINTAIN, trend,
                        lastMaxW, prevMaxW,
                        avgReps, targetMin, sets, 0,
                        String.format(
                                "Weight dropped %.1f → %.1f kg. " +
                                        "Return to %.1f kg and focus on controlled reps.",
                                prevMaxW, lastMaxW, prevMaxW));
            }

            default -> rec(exerciseId, name,
                    RecommendationType.MAINTAIN, trend,
                    lastMaxW, lastMaxW, avgReps, avgReps, sets, 0, "Keep going.");
        };
    }

    // ── Helpers ──────────────────────────────────────────────────
    private double maxWeight(SessionSnapshot s) {
        return s.sets().stream().mapToDouble(WorkoutSet::getWeightKg).max().orElse(0);
    }

    private int avgReps(SessionSnapshot s) {
        return (int) Math.round(
                s.sets().stream().mapToInt(WorkoutSet::getReps).average().orElse(0));
    }

    private double incrementFor(Exercise ex) {
        if (ex == null) return 2.5;
        return INCREMENT.getOrDefault(ex.getPrimaryMuscle(), 2.5);
    }

    private OverloadRecommendation rec(
            String id, String name, RecommendationType type, ProgressTrend trend,
            double lastW, double suggestedW, int lastReps, int targetReps,
            int sets, long stall, String rationale) {
        return new OverloadRecommendation(
                id, name, type, trend, lastW, suggestedW,
                lastReps, targetReps, sets, stall, rationale);
    }

    // package-private snapshot — not a DTO
    private record SessionSnapshot(
            LocalDate date, String exerciseName, List<WorkoutSet> sets) {}
}
