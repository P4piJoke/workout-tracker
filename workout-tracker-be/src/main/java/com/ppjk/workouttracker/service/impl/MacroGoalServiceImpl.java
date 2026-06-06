package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.UserMacroGoal;
import com.ppjk.workouttracker.dto.MacroGoalDtos.MacroGoalResponse;
import com.ppjk.workouttracker.dto.MacroGoalDtos.SaveMacroGoalRequest;
import com.ppjk.workouttracker.repository.mongo.MacroGoalRepository;
import com.ppjk.workouttracker.service.MacroGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MacroGoalServiceImpl implements MacroGoalService {

    private final MacroGoalRepository repository;

    @Override
    public Optional<MacroGoalResponse> getCurrent() {
        return repository.findByUserId(SecurityUtils.currentUserId())
                .map(this::toResponse);
    }

    @Override
    public MacroGoalResponse save(SaveMacroGoalRequest req) {
        String userId = SecurityUtils.currentUserId();

        var goal = repository.findByUserId(userId)
                .orElseGet(() -> UserMacroGoal.builder()
                        .userId(userId)
                        .build());

        goal.setTargetCalories(req.targetCalories());
        goal.setTargetProteinG(req.targetProteinG());
        goal.setTargetCarbsG(req.targetCarbsG());
        goal.setTargetFatG(req.targetFatG());
        goal.setFitnessGoal(req.fitnessGoal());
        goal.setTdee(req.tdee());
        goal.setUpdatedAt(Instant.now());

        return toResponse(repository.save(goal));
    }

    private MacroGoalResponse toResponse(UserMacroGoal g) {
        return new MacroGoalResponse(
                g.getTargetCalories(),
                g.getTargetProteinG(),
                g.getTargetCarbsG(),
                g.getTargetFatG(),
                g.getFitnessGoal(),
                g.getTdee(),
                g.getUpdatedAt()
        );
    }
}