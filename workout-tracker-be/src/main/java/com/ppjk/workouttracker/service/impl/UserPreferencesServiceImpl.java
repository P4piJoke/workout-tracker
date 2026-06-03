package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.CacheConfig;
import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.UserPreferences;
import com.ppjk.workouttracker.dto.UserPreferencesRequest;
import com.ppjk.workouttracker.repository.mongo.UserPreferencesRepository;
import com.ppjk.workouttracker.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserPreferencesServiceImpl implements UserPreferencesService {

    private final UserPreferencesRepository repository;

    @Override
    public UserPreferences getOrDefault() {
        return repository
                .findByUserId(SecurityUtils.currentUserId())
                .orElseGet(this::defaults);
    }

    @Override
    @CacheEvict(value = CacheConfig.OVERLOAD,
            key = "@securityUtils.currentUserId()")
    public UserPreferences update(UserPreferencesRequest req) {
        if (req.targetRepsMin() >= req.targetRepsMax())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Min reps must be less than max reps");

        var prefs = repository
                .findByUserId(SecurityUtils.currentUserId())
                .orElseGet(this::defaults);

        prefs.setTargetRepsMin(req.targetRepsMin());
        prefs.setTargetRepsMax(req.targetRepsMax());
        prefs.setDefaultSets(req.defaultSets());
        return repository.save(prefs);
    }

    private UserPreferences defaults() {
        return UserPreferences.builder()
                .userId(SecurityUtils.currentUserId())
                .targetRepsMin(8)
                .targetRepsMax(12)
                .defaultSets(3)
                .build();
    }
}
