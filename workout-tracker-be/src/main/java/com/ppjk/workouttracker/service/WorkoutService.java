package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.WorkoutRequest;
import com.ppjk.workouttracker.dto.WorkoutResponse;

import java.util.List;

public interface WorkoutService {

    WorkoutResponse create(WorkoutRequest req);

    List<WorkoutResponse> findMyWorkouts();

    WorkoutResponse findById(String id);

    WorkoutResponse update(String id, WorkoutRequest req);

    void delete(String id);
}
