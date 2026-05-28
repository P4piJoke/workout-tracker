package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.dto.ExerciseProgressPoint;
import com.ppjk.workouttracker.dto.MuscleBalanceEntry;
import com.ppjk.workouttracker.dto.OverloadRecommendation;
import com.ppjk.workouttracker.dto.PersonalRecord;
import com.ppjk.workouttracker.service.ProgressiveOverloadService;
import com.ppjk.workouttracker.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// controller/StatsController.java
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;
    private final ProgressiveOverloadService overloadService;   // inject alongside statsService

    @GetMapping("/overload")
    public List<OverloadRecommendation> overloadRecommendations() {
        return overloadService.recommendations();
    }

    @GetMapping("/personal-records")
    public List<PersonalRecord> personalRecords() {
        return statsService.personalRecords();
    }

    @GetMapping("/exercise-progress")
    public List<ExerciseProgressPoint> exerciseProgress(
            @RequestParam String exerciseId) {
        return statsService.exerciseProgress(exerciseId);
    }

    @GetMapping("/muscle-balance")
    public List<MuscleBalanceEntry> muscleBalance() {
        return statsService.muscleBalance();
    }
}
