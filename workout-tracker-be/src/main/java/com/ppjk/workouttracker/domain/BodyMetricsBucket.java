package com.ppjk.workouttracker.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Weekly bucket document.
 * <p>
 * Bucketing pattern analogy: instead of one folder per day (365/year),
 * we use one folder per week (52/year). Each folder holds an array of
 * daily measurements. Queries for a date range touch far fewer documents,
 * and writes append into the current week's document via $push + upsert.
 * <p>
 * Compound index on (userId, weekStart) makes "find this user's bucket
 * for this week" a single index lookup.
 */
@Document(collection = "body_metrics_buckets")
@CompoundIndex(name = "user_week_idx", def = "{'userId': 1, 'weekStart': 1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricsBucket {

    @Id
    private String id;

    private String userId;
    private LocalDate weekStart;   // always the Monday of the week

    @Builder.Default
    private List<DailyMeasurement> measurements = new ArrayList<>();

    private int count;          // maintained incrementally — avoids array scans
    private double sumWeight;      // maintained incrementally for cheap avg computation
    private Double latestWeight;   // cached for the overload engine / chart tooltips

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMeasurement {
        private LocalDate date;
        private Double weightKg;
        private Double bodyFatPct;   // optional
        private String notes;        // optional free text
    }
}