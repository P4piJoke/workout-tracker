package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.BodyMetricsDtos.LogMetricRequest;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.MetricPoint;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.MetricsSummary;

import java.util.List;

public interface BodyMetricsService {

    /**
     * Append a measurement into the week's bucket (upsert).
     */
    void log(LogMetricRequest req);

    /**
     * All daily points ordered by date asc — for chart rendering.
     */
    List<MetricPoint> history();

    /**
     * Lightweight header stats.
     */
    MetricsSummary summary();

    /**
     * Delete a single measurement by date.
     */
    void deleteByDate(String isoDate);
}