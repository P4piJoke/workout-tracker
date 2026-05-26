package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.dto.WorkoutRequest;
import com.ppjk.workouttracker.dto.WorkoutResponse;
import com.ppjk.workouttracker.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
@Validated
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutResponse create(@Valid @RequestBody WorkoutRequest req) {
        return workoutService.create(req);
    }

    @GetMapping("/me")
    public List<WorkoutResponse> myWorkouts() {
        return workoutService.findMyWorkouts();
    }

    @GetMapping("/{id}")
    public WorkoutResponse getById(@PathVariable String id) {
        return workoutService.findById(id);
    }

    @PutMapping("/{id}")
    public WorkoutResponse update(
            @PathVariable String id,
            @Valid @RequestBody WorkoutRequest req) {
        return workoutService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        workoutService.delete(id);
    }
}
