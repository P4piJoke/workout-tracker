package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.ExerciseProgressPoint;
import com.ppjk.workouttracker.dto.MuscleBalanceEntry;
import com.ppjk.workouttracker.dto.PersonalRecord;

import java.util.List;

public interface StatsService {

    List<PersonalRecord> personalRecords();
    List<ExerciseProgressPoint> exerciseProgress(String exerciseId);
    List<MuscleBalanceEntry> muscleBalance();
}
