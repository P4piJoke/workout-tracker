package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.domain.ExercisePreferences;
import com.ppjk.workouttracker.dto.ExercisePreferencesRequest;
import com.ppjk.workouttracker.dto.ExercisePreferencesResponse;

import java.util.List;
import java.util.Map;

public interface ExercisePreferencesService {

    List<ExercisePreferencesResponse> getAll();

    ExercisePreferencesResponse upsert(String exerciseId, ExercisePreferencesRequest req);

    void delete(String exerciseId);

    Map<String, ExercisePreferences> getAllAsMap();
}
