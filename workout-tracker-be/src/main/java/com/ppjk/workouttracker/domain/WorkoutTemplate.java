package com.ppjk.workouttracker.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * A workout template — a reusable exercise structure without dates or actual
 * weights. When the user starts a session from a template, the LogWorkoutPage
 * is pre-filled with the template's exercises and default sets.
 * <p>
 * Ownership:
 * ownerId = user's Keycloak subject  →  user-created (private by default)
 * ownerId = "SYSTEM"                 →  admin-published (visible to all)
 * <p>
 * Users can clone any template. A clone gets their own ownerId and isPublic=false.
 */
@Document(collection = "workout_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutTemplate {

    /**
     * Sentinel owner ID for admin-published shared templates.
     */
    public static final String SYSTEM_OWNER = "SYSTEM";

    @Id
    private String id;

    @Indexed
    private String ownerId;       // userId or "SYSTEM"

    private String name;
    private String description;   // optional flavour text

    private List<TemplateEntry> entries;

    private boolean isPublic;     // true for SYSTEM templates; users control their own
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateEntry {
        private String exerciseId;
        private String exerciseName;
        private int defaultSets;
        private int defaultReps;
        private String notes;       // coaching cue, e.g. "pause at the bottom"
    }
}