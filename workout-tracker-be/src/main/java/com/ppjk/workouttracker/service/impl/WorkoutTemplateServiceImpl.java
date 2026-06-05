package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.WorkoutTemplate;
import com.ppjk.workouttracker.domain.WorkoutTemplate.TemplateEntry;
import com.ppjk.workouttracker.dto.TemplateDtos.CreateTemplateRequest;
import com.ppjk.workouttracker.dto.TemplateDtos.TemplateEntryResponse;
import com.ppjk.workouttracker.dto.TemplateDtos.TemplateResponse;
import com.ppjk.workouttracker.repository.mongo.WorkoutTemplateRepository;
import com.ppjk.workouttracker.service.WorkoutTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutTemplateServiceImpl implements WorkoutTemplateService {

    private final WorkoutTemplateRepository repository;

    @Override
    public List<TemplateResponse> listVisible() {
        String userId = SecurityUtils.currentUserId();
        return repository.findVisibleToUser(userId).stream()
                .map(t -> toResponse(t, userId))
                .toList();
    }

    @Override
    public TemplateResponse create(CreateTemplateRequest req, boolean isAdmin) {
        String userId = SecurityUtils.currentUserId();

        /*
         * Ownership rule:
         *   - Admin + isPublic=true  →  ownerId = "SYSTEM" (shared for all)
         *   - Everything else        →  ownerId = userId    (private)
         *
         * Analogy: think of it like posting in a forum. Admins can post to
         * the pinned/shared board; everyone else posts to their own board.
         */
        String ownerId = (isAdmin && req.isPublic())
                ? WorkoutTemplate.SYSTEM_OWNER
                : userId;

        var template = WorkoutTemplate.builder()
                .ownerId(ownerId)
                .name(req.name())
                .description(req.description())
                .entries(mapEntries(req))
                .isPublic(isAdmin && req.isPublic())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return toResponse(repository.save(template), userId);
    }

    @Override
    public TemplateResponse clone(String templateId) {
        String userId = SecurityUtils.currentUserId();

        var original = fetchVisible(templateId, userId);

        // Deep-copy the entries; the clone is a new private document
        var cloned = WorkoutTemplate.builder()
                .ownerId(userId)
                .name(original.getName() + " (copy)")
                .description(original.getDescription())
                .entries(original.getEntries().stream()
                        .map(e -> TemplateEntry.builder()
                                .exerciseId(e.getExerciseId())
                                .exerciseName(e.getExerciseName())
                                .defaultSets(e.getDefaultSets())
                                .defaultReps(e.getDefaultReps())
                                .notes(e.getNotes())
                                .build())
                        .toList())
                .isPublic(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return toResponse(repository.save(cloned), userId);
    }

    @Override
    public void delete(String templateId, boolean isAdmin) {
        String userId = SecurityUtils.currentUserId();
        var template = repository.findById(templateId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template not found"));

        boolean isOwner = userId.equals(template.getOwnerId());
        boolean isSystemAndAdmin = WorkoutTemplate.SYSTEM_OWNER.equals(template.getOwnerId())
                && isAdmin;

        if (!isOwner && !isSystemAndAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You cannot delete this template");
        }

        repository.delete(template);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private WorkoutTemplate fetchVisible(String templateId, String userId) {
        return repository.findById(templateId)
                .filter(t -> userId.equals(t.getOwnerId())
                        || WorkoutTemplate.SYSTEM_OWNER.equals(t.getOwnerId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template not found"));
    }

    private List<TemplateEntry> mapEntries(CreateTemplateRequest req) {
        return req.entries().stream()
                .map(e -> TemplateEntry.builder()
                        .exerciseId(e.exerciseId())
                        .exerciseName(e.exerciseName())
                        .defaultSets(e.defaultSets())
                        .defaultReps(e.defaultReps())
                        .notes(e.notes())
                        .build())
                .toList();
    }

    private TemplateResponse toResponse(WorkoutTemplate t, String userId) {
        var entries = t.getEntries().stream()
                .map(e -> new TemplateEntryResponse(
                        e.getExerciseId(), e.getExerciseName(),
                        e.getDefaultSets(), e.getDefaultReps(), e.getNotes()))
                .toList();

        return new TemplateResponse(
                t.getId(),
                t.getName(),
                t.getDescription(),
                entries,
                t.isPublic(),
                userId.equals(t.getOwnerId()),
                WorkoutTemplate.SYSTEM_OWNER.equals(t.getOwnerId()),
                t.getCreatedAt());
    }
}