package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.SetType;
import com.ppjk.workouttracker.domain.Workout;
import com.ppjk.workouttracker.domain.WorkoutEntry;
import com.ppjk.workouttracker.domain.WorkoutSet;
import com.ppjk.workouttracker.dto.WorkoutEntryRequest;
import com.ppjk.workouttracker.dto.WorkoutRequest;
import com.ppjk.workouttracker.dto.WorkoutResponse;
import com.ppjk.workouttracker.dto.WorkoutSetRequest;
import com.ppjk.workouttracker.repository.mongo.WorkoutRepository;
import com.ppjk.workouttracker.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutServiceImpl implements WorkoutService {

    private final WorkoutRepository workoutRepository;

    @Override
    public WorkoutResponse create(WorkoutRequest req) {
        String userId = SecurityUtils.currentUserId();

        var entries = req.entries().stream()
                .map(e -> WorkoutEntry.builder()
                        .exerciseId(e.exerciseId())
                        .exerciseName(e.exerciseName())
                        .sets(mapSets(e.sets()))
                        .build())
                .toList();

        var workout = Workout.builder()
                .userId(userId)
                .name(req.name())
                .date(req.date())
                .entries(entries)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return toResponse(workoutRepository.save(workout));
    }

    @Override
    public List<WorkoutResponse> findMyWorkouts() {
        return workoutRepository
                .findByUserIdOrderByDateDesc(SecurityUtils.currentUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public WorkoutResponse findById(String id) {
        return workoutRepository
                .findByIdAndUserId(id, SecurityUtils.currentUserId())  // scoped — no ID fishing
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Workout not found"));
    }

    @Override
    public WorkoutResponse update(String id, WorkoutRequest req) {
        var workout = workoutRepository
                .findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Workout not found"));

        workout.setName(req.name());
        workout.setDate(req.date());
        workout.setEntries(mapEntries(req.entries()));   // reuse existing private helper
        workout.setUpdatedAt(Instant.now());

        return toResponse(workoutRepository.save(workout));
    }

    @Override
    public void delete(String id) {
        var workout = workoutRepository
                .findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Workout not found"));

        workoutRepository.delete(workout);
    }

    // --- private helpers ---

    private List<WorkoutEntry> mapEntries(List<WorkoutEntryRequest> reqs) {
        return reqs.stream()
                .map(e -> WorkoutEntry.builder()
                        .exerciseId(e.exerciseId())
                        .exerciseName(e.exerciseName())
                        .sets(mapSets(e.sets()))
                        .build())
                .toList();
    }

    private List<WorkoutSet> mapSets(List<WorkoutSetRequest> reqs) {
        var sets = new ArrayList<WorkoutSet>();
        for (int i = 0; i < reqs.size(); i++) {
            var r = reqs.get(i);
            sets.add(WorkoutSet.builder()
                    .setNumber(i + 1)
                    .reps(r.reps())
                    .weightKg(r.weightKg())
                    .type(r.type() != null ? r.type() : SetType.WORKING)
                    .build());
        }

        return sets;
    }

    private WorkoutResponse toResponse(Workout w) {
        return new WorkoutResponse(
                w.getId(), w.getName(), w.getDate(),
                w.getEntries(), w.getCreatedAt());
    }
}
