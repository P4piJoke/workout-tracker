package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.dto.ExercisePreferencesRequest;
import com.ppjk.workouttracker.dto.ExercisePreferencesResponse;
import com.ppjk.workouttracker.service.ExercisePreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/preferences/exercises")
@RequiredArgsConstructor
public class ExercisePreferencesController {

    private final ExercisePreferencesService service;

    @GetMapping
    public List<ExercisePreferencesResponse> getAll() {
        return service.getAll();
    }

    @PutMapping("/{exerciseId}")
    public ExercisePreferencesResponse upsert(
            @PathVariable String exerciseId,
            @Valid @RequestBody ExercisePreferencesRequest req) {
        return service.upsert(exerciseId, req);
    }

    @DeleteMapping("/{exerciseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String exerciseId) {
        service.delete(exerciseId);
    }
}
