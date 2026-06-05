package com.ppjk.workouttracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class BodyMetricsDtos {

    // ── Inbound ──────────────────────────────────────────────────────────────

    public record LogMetricRequest(
            @NotNull LocalDate date,
            @DecimalMin("20.0") @NotNull Double weightKg,
            Double bodyFatPct,   // optional
            String notes
    ) {
    }

    // ── Outbound — one point on the chart ────────────────────────────────────

    public record MetricPoint(
            String date,         // ISO string — easier for Recharts
            Double weightKg,
            Double bodyFatPct
    ) {
    }

    // ── Outbound — summary for the metrics page header ───────────────────────

    public record MetricsSummary(
            Double latestWeight,
            Double latestBodyFat,
            Double weightChangeLast30Days,  // negative = lost, positive = gained
            int totalEntries
    ) {
    }
}