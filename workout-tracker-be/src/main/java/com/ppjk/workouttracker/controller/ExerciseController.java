package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.ExerciseType;
import com.ppjk.workouttracker.domain.MuscleGroup;
import com.ppjk.workouttracker.dto.ExerciseRequest;
import com.ppjk.workouttracker.service.ExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping("/search")
    public List<Exercise> search(@RequestParam String q) {
        return exerciseService.search(q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")           // only Keycloak 'admin' realm role
    public Exercise create(@Valid @RequestBody ExerciseRequest req) {
        return exerciseService.create(Exercise.builder()
                .name(req.name())
                .description(req.description())
                .primaryMuscle(req.primaryMuscle())
                .secondaryMuscles(req.secondaryMuscles() != null
                        ? req.secondaryMuscles() : List.of())
                .type(req.type())
                .build());
    }

    @GetMapping
    public List<Exercise> getAll(
            @RequestParam(required = false) MuscleGroup muscle,
            @RequestParam(required = false) ExerciseType type) {
        return exerciseService.getAll(muscle, type);
    }
}
