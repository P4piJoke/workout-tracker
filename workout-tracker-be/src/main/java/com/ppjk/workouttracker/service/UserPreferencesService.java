package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.domain.UserPreferences;
import com.ppjk.workouttracker.dto.UserPreferencesRequest;

public interface UserPreferencesService {

    public UserPreferences getOrDefault();

    public UserPreferences update(UserPreferencesRequest req);

}
