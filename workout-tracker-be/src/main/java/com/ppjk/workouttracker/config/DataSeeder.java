package com.ppjk.workouttracker.config;

import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.ExerciseType;
import com.ppjk.workouttracker.domain.MuscleGroup;
import com.ppjk.workouttracker.repository.elasticsearch.ExerciseSearchRepository;
import com.ppjk.workouttracker.repository.mongo.ExerciseMongoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ExerciseMongoRepository exerciseMongoRepository;
    private final ExerciseSearchRepository searchRepository;

    @Override
    public void run(String... args) {
        boolean mongoHasData = exerciseMongoRepository.count() > 0;
        boolean esHasData = searchRepository.count() > 0;

        if (mongoHasData && esHasData) {
            log.info("Both stores seeded — skipping.");
            return;
        }

        List<Exercise> exercises;

        if (mongoHasData) {
            exercises = exerciseMongoRepository.findAll();
            log.info("Re-syncing {} exercises from MongoDB → Elasticsearch.", exercises.size());
        } else {
            exercises = buildExercises();
            exerciseMongoRepository.saveAll(exercises);
            log.info("Seeded {} exercises into MongoDB.", exercises.size());
        }

        searchRepository.saveAll(exercises);
        log.info("Elasticsearch index populated with {} exercises.", exercises.size());
    }

    private List<Exercise> buildExercises() {
        return List.of(
                exercise("Barbell Bench Press", "Horizontal push — primary chest builder",
                        MuscleGroup.CHEST, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS)),
                exercise("Incline Dumbbell Press", "Upper chest emphasis with dumbbells",
                        MuscleGroup.CHEST, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.SHOULDERS)),
                exercise("Pull-Up", "Bodyweight vertical pull, wide grip",
                        MuscleGroup.BACK, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.BICEPS)),
                exercise("Barbell Row", "Horizontal pull — upper and mid back",
                        MuscleGroup.BACK, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.BICEPS, MuscleGroup.CORE)),
                exercise("Overhead Press", "Vertical push — shoulder strength and mass",
                        MuscleGroup.SHOULDERS, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.TRICEPS)),
                exercise("Barbell Squat", "Compound lower body — quads, glutes, core",
                        MuscleGroup.LEGS, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.GLUTES, MuscleGroup.CORE)),
                exercise("Romanian Deadlift", "Hip hinge — hamstrings and glutes",
                        MuscleGroup.GLUTES, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.LEGS, MuscleGroup.CORE)),
                exercise("Plank", "Isometric core stability hold",
                        MuscleGroup.CORE, ExerciseType.STRENGTH, List.of()),
                exercise("Bicep Curl", "Isolation — elbow flexion",
                        MuscleGroup.BICEPS, ExerciseType.STRENGTH,
                        List.of(MuscleGroup.FOREARMS)),
                exercise("Tricep Pushdown", "Cable isolation — elbow extension",
                        MuscleGroup.TRICEPS, ExerciseType.STRENGTH, List.of())
        );
    }

    private Exercise exercise(String name, String desc,
                              MuscleGroup primary, ExerciseType type,
                              List<MuscleGroup> secondary) {
        return Exercise.builder()
                .name(name)
                .description(desc)
                .primaryMuscle(primary)
                .type(type)
                .secondaryMuscles(secondary)
                .build();
    }
}
