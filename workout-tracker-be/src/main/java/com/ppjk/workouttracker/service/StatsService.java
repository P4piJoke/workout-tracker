package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.ExerciseProgressResponse;
import com.ppjk.workouttracker.dto.MuscleBalanceResponse;
import com.ppjk.workouttracker.dto.PersonalRecordResponse;

public interface StatsService {

    PersonalRecordResponse personalRecords();
    ExerciseProgressResponse exerciseProgress(String exerciseId);
    MuscleBalanceResponse muscleBalance();
}
