package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.CacheConfig;
import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.WorkoutEntry;
import com.ppjk.workouttracker.domain.WorkoutSet;
import com.ppjk.workouttracker.dto.ExerciseProgressPoint;
import com.ppjk.workouttracker.dto.ExerciseProgressResponse;
import com.ppjk.workouttracker.dto.MuscleBalanceEntry;
import com.ppjk.workouttracker.dto.MuscleBalanceResponse;
import com.ppjk.workouttracker.dto.PersonalRecord;
import com.ppjk.workouttracker.dto.PersonalRecordResponse;
import com.ppjk.workouttracker.repository.mongo.ExerciseMongoRepository;
import com.ppjk.workouttracker.repository.mongo.WorkoutRepository;
import com.ppjk.workouttracker.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseMongoRepository exerciseMongoRepository;

    @Override
    @Cacheable(value = CacheConfig.PERSONAL_RECORDS,
            key = "@securityUtils.currentUserId()")
    public PersonalRecordResponse personalRecords() {
        var workouts = workoutRepository
                .findByUserIdOrderByDateDesc(SecurityUtils.currentUserId());

        Map<String, PersonalRecord> best = new HashMap<>();

        for (var workout : workouts) {
            for (var entry : workout.getEntries()) {
                for (var set : entry.getSets()) {
                    if (set.getWeightKg() <= 0 || set.getReps() <= 0) {
                        continue;
                    }

                    double e1rm = set.getWeightKg() * (1 + set.getReps() / 30.0);
                    double rounded = Math.round(e1rm * 10.0) / 10.0;

                    var current = best.get(entry.getExerciseId());
                    if (current == null || rounded > current.estimatedOneRM()) {
                        best.put(entry.getExerciseId(), new PersonalRecord(
                                entry.getExerciseId(),
                                entry.getExerciseName(),
                                rounded,
                                set.getWeightKg(),
                                set.getReps(),
                                workout.getDate()
                        ));
                    }
                }
            }
        }

        List<PersonalRecord> list = best.values().stream()
                .sorted(Comparator.comparing(PersonalRecord::exerciseName))
                .collect(Collectors.toCollection(ArrayList::new));
        return new PersonalRecordResponse(list);
    }

    @Override
    @Cacheable(value = CacheConfig.EXERCISE_PROGRESS,
            key = "@securityUtils.currentUserId() + ':' + #exerciseId")
    public ExerciseProgressResponse exerciseProgress(String exerciseId) {
        var workouts = workoutRepository
                .findByUserIdOrderByDateDesc(SecurityUtils.currentUserId());

        List<ExerciseProgressPoint> list = workouts.stream()
                .filter(w -> w.getEntries().stream()
                        .anyMatch(e -> exerciseId.equals(e.getExerciseId())))
                .map(w -> {
                    var entry = w.getEntries().stream()
                            .filter(e -> exerciseId.equals(e.getExerciseId()))
                            .findFirst().orElseThrow();

                    double vol = entry.getSets().stream()
                            .mapToDouble(s -> s.getReps() * s.getWeightKg()).sum();
                    double maxW = entry.getSets().stream()
                            .mapToDouble(WorkoutSet::getWeightKg).max().orElse(0);

                    return new ExerciseProgressPoint(
                            w.getDate().toString(),
                            Math.round(vol * 10.0) / 10.0,
                            maxW,
                            entry.getSets().size()
                    );
                })
                .sorted(Comparator.comparing(ExerciseProgressPoint::date))
                .collect(Collectors.toCollection(ArrayList::new));
        return new ExerciseProgressResponse(list);
    }

    @Override
    @Cacheable(value = CacheConfig.MUSCLE_BALANCE,
            key = "@securityUtils.currentUserId()")
    public MuscleBalanceResponse muscleBalance() {
        var workouts = workoutRepository
                .findByUserIdOrderByDateDesc(SecurityUtils.currentUserId());

        // batch-fetch exercises to resolve primaryMuscle — one query
        Set<String> ids = workouts.stream()
                .flatMap(w -> w.getEntries().stream())
                .map(WorkoutEntry::getExerciseId)
                .collect(Collectors.toSet());

        Map<String, String> muscleById = exerciseMongoRepository
                .findAllById(ids).stream()
                .collect(Collectors.toMap(
                        Exercise::getId,
                        e -> e.getPrimaryMuscle().name()
                ));

        Map<String, Integer> counts = new HashMap<>();
        workouts.forEach(w -> w.getEntries().forEach(e -> {
            String muscle = muscleById.get(e.getExerciseId());
            if (muscle != null)
                counts.merge(muscle, e.getSets().size(), Integer::sum);
        }));

        ArrayList<MuscleBalanceEntry> list = counts.entrySet().stream()
                .map(en -> new MuscleBalanceEntry(en.getKey(), en.getValue()))
                .sorted(Comparator.comparing(MuscleBalanceEntry::sets).reversed())
                .collect(Collectors.toCollection(ArrayList::new));
        return new MuscleBalanceResponse(list);
    }
}
