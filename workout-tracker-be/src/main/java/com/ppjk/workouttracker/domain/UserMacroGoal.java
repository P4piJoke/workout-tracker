package com.ppjk.workouttracker.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Stores a user's calculated + accepted macro targets.
 * One document per user — upserted every time they "Save targets" in the
 * Health Calculators page.
 */
@Document(collection = "macro_goals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMacroGoal {

    @Id
    private String id;
    private String userId;

    // ── Calorie / macro targets ────────────────────────────────────────────
    private int    targetCalories;     // kcal/day
    private int    targetProteinG;     // grams
    private int    targetCarbsG;       // grams
    private int    targetFatG;         // grams

    // ── Goal context (what was selected when saving) ───────────────────────
    private String fitnessGoal;        // "CUT" | "MAINTAIN" | "BULK"
    private double tdee;               // total daily energy expenditure used

    private Instant updatedAt;
}