package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.MacroGoalDtos.MacroGoalResponse;
import com.ppjk.workouttracker.dto.MacroGoalDtos.SaveMacroGoalRequest;

import java.util.Optional;

public interface MacroGoalService {
    Optional<MacroGoalResponse> getCurrent();
    MacroGoalResponse save(SaveMacroGoalRequest req);
}