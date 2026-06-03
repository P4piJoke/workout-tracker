package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.CacheConfig;
import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.ExercisePreferences;
import com.ppjk.workouttracker.dto.ExercisePreferencesRequest;
import com.ppjk.workouttracker.dto.ExercisePreferencesResponse;
import com.ppjk.workouttracker.repository.mongo.ExercisePreferencesRepository;
import com.ppjk.workouttracker.service.ExercisePreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExercisePreferencesServiceImpl implements ExercisePreferencesService {

    private final ExercisePreferencesRepository repository;

    @Override
    public List<ExercisePreferencesResponse> getAll() {
        return repository.findByUserId(SecurityUtils.currentUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @CacheEvict(value = CacheConfig.OVERLOAD,
            key = "@securityUtils.currentUserId()")
    public ExercisePreferencesResponse upsert(String exerciseId,
                                              ExercisePreferencesRequest req) {
        if (req.targetRepsMin() >= req.targetRepsMax())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Min reps must be less than max reps");

        var prefs = repository
                .findByUserIdAndExerciseId(SecurityUtils.currentUserId(), exerciseId)
                .orElseGet(() -> ExercisePreferences.builder()
                        .userId(SecurityUtils.currentUserId())
                        .exerciseId(exerciseId)
                        .build());

        prefs.setExerciseName(req.exerciseName());
        prefs.setTargetRepsMin(req.targetRepsMin());
        prefs.setTargetRepsMax(req.targetRepsMax());

        return toResponse(repository.save(prefs));
    }

    @Override
    @CacheEvict(value = CacheConfig.OVERLOAD,
            key = "@securityUtils.currentUserId()")
    public void delete(String exerciseId) {
        repository.deleteByUserIdAndExerciseId(
                SecurityUtils.currentUserId(), exerciseId);
    }

    @Override
    public Map<String, ExercisePreferences> getAllAsMap() {
        return repository.findByUserId(SecurityUtils.currentUserId())
                .stream()
                .collect(Collectors.toMap(
                        ExercisePreferences::getExerciseId,
                        p -> p));
    }

    private ExercisePreferencesResponse toResponse(ExercisePreferences p) {
        return new ExercisePreferencesResponse(
                p.getExerciseId(),
                p.getExerciseName(),
                p.getTargetRepsMin(),
                p.getTargetRepsMax());
    }
}
