package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.ExerciseType;
import com.ppjk.workouttracker.domain.MuscleGroup;

import java.util.List;

public interface ExerciseService {

    Exercise create(Exercise exercise);

    List<Exercise> search(String query);

    List<Exercise> getAll(MuscleGroup muscle, ExerciseType type);
}
