package com.ppjk.workouttracker.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.Instant;
import java.util.List;

public class TemplateDtos {

    // ── Inbound ──────────────────────────────────────────────────────────────

    public record TemplateEntryRequest(
            @NotBlank String exerciseId,
            @NotBlank String exerciseName,
            @Min(1) int defaultSets,
            @Min(1) int defaultReps,
            String notes
    ) {
    }

    public record CreateTemplateRequest(
            @NotBlank String name,
            String description,
            @NotEmpty @Valid List<TemplateEntryRequest> entries,
            boolean isPublic   // admins only; ignored for non-admins
    ) {
    }

    // ── Outbound ─────────────────────────────────────────────────────────────

    public record TemplateEntryResponse(
            String exerciseId,
            String exerciseName,
            int defaultSets,
            int defaultReps,
            String notes
    ) {
    }

    public record TemplateResponse(
            String id,
            String name,
            String description,
            List<TemplateEntryResponse> entries,
            boolean isPublic,
            boolean isOwn,      // true when the caller owns this template
            boolean isSystem,   // true for SYSTEM-owned templates
            Instant createdAt
    ) {
    }
}