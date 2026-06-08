package com.ppjk.workouttracker.config;

import com.ppjk.workouttracker.domain.WorkoutTemplate;
import com.ppjk.workouttracker.domain.WorkoutTemplate.TemplateEntry;
import com.ppjk.workouttracker.repository.mongo.ExerciseMongoRepository;
import com.ppjk.workouttracker.repository.mongo.WorkoutTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Seeds starter SYSTEM templates on first boot.
 * Order(2) ensures it runs after DataSeeder (Order defaults to lowest precedence)
 * so exercises exist before we reference them by name.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TemplateSeeder implements CommandLineRunner {

    private final WorkoutTemplateRepository templateRepository;
    private final ExerciseMongoRepository exerciseRepository;

    @Override
    public void run(String... args) {
        long systemCount = templateRepository
                .findByOwnerIdOrderByCreatedAtDesc(WorkoutTemplate.SYSTEM_OWNER)
                .size();

        if (systemCount > 0) {
            log.info("System templates already seeded — skipping.");
            return;
        }

        // Build exercise name → id map for referencing
        Map<String, String> idByName = exerciseRepository.findAll().stream()
                .collect(Collectors.toMap(e -> e.getName(), e -> e.getId(),
                        (a, b) -> a));   // keep first on dupe name

        var templates = List.of(
                buildTemplate("Push Day",
                        "Classic horizontal + vertical push session",
                        idByName,
                        List.of(
                                entry("Barbell Bench Press", 4, 8, "Control the descent — 2s down"),
                                entry("Incline Dumbbell Press", 3, 10, "Elbows at 45°"),
                                entry("Overhead Press", 3, 8, "Brace the core throughout"),
                                entry("Tricep Pushdown", 3, 12, null)
                        )),

                buildTemplate("Pull Day",
                        "Vertical and horizontal pulls for back + biceps",
                        idByName,
                        List.of(
                                entry("Pull-Up", 4, 6, "Full hang at the bottom"),
                                entry("Barbell Row", 4, 8, "Chest to bar"),
                                entry("Bicep Curl", 3, 12, "No swinging")
                        )),

                buildTemplate("Leg Day",
                        "Compound lower body strength session",
                        idByName,
                        List.of(
                                entry("Barbell Squat", 4, 6, "Break parallel"),
                                entry("Romanian Deadlift", 3, 10, "Feel the hamstring stretch"),
                                entry("Plank", 3, 1, "60s hold per set")
                        ))
        );

        templateRepository.saveAll(templates);
        log.info("Seeded {} system templates.", templates.size());
    }

    private WorkoutTemplate buildTemplate(
            String name, String description,
            Map<String, String> idByName,
            List<TemplateEntry> entries) {

        entries.forEach(e -> e.setExerciseId(idByName.get(e.getExerciseName())));

        return WorkoutTemplate.builder()
                .ownerId(WorkoutTemplate.SYSTEM_OWNER)
                .name(name)
                .description(description)
                .entries(entries)
                .isPublic(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private TemplateEntry entry(String exerciseName, int sets, int reps, String notes) {
        return TemplateEntry.builder()
                .exerciseName(exerciseName)
                .defaultSets(sets)
                .defaultReps(reps)
                .notes(notes)
                .build();
    }
}