package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.BodyMetricsBucket;
import com.ppjk.workouttracker.domain.BodyMetricsBucket.DailyMeasurement;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.LogMetricRequest;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.MetricPoint;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.MetricsSummary;
import com.ppjk.workouttracker.repository.mongo.BodyMetricsRepository;
import com.ppjk.workouttracker.service.BodyMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BodyMetricsServiceImpl implements BodyMetricsService {

    private final BodyMetricsRepository repository;
    private final MongoTemplate mongoTemplate;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * The core bucketing write.
     * <p>
     * Analogy: imagine each week is a piggy bank. We don't create a new coin
     * for every day — we drop this day's coin into the current week's bank.
     * If the bank doesn't exist yet, we create it on the spot (upsert: true).
     * <p>
     * MongoDB operation: findOneAndUpdate with $push (add measurement to array)
     * + $inc (bump count and sum) + $set (refresh latestWeight).
     * One network round-trip regardless of whether the bucket exists.
     */
    @Override
    public void log(LogMetricRequest req) {
        String userId = SecurityUtils.currentUserId();
        LocalDate weekStart = toMonday(req.date());

        var measurement = DailyMeasurement.builder()
                .date(req.date())
                .weightKg(req.weightKg())
                .bodyFatPct(req.bodyFatPct())
                .notes(req.notes())
                .build();

        Query query = Query.query(
                Criteria.where("userId").is(userId)
                        .and("weekStart").is(weekStart));

        Update update = new Update()
                // Drop today's coin into the weekly bank
                .push("measurements", measurement)
                // Maintain running count and sum for cheap avg queries
                .inc("count", 1)
                .inc("sumWeight", req.weightKg() != null ? req.weightKg() : 0)
                // Cache the latest weight for quick retrieval
                .set("latestWeight", req.weightKg())
                // Ensure userId and weekStart exist on first insert (upsert fields)
                .setOnInsert("userId", userId)
                .setOnInsert("weekStart", weekStart);

        mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                BodyMetricsBucket.class);
    }

    @Override
    public List<MetricPoint> history() {
        String userId = SecurityUtils.currentUserId();

        return repository.findByUserIdOrderByWeekStartDesc(userId)
                .stream()
                // Flatten bucket arrays into individual daily points
                .flatMap(bucket -> bucket.getMeasurements().stream())
                // Chronological order for Recharts
                .sorted(Comparator.comparing(DailyMeasurement::getDate))
                .map(m -> new MetricPoint(
                        m.getDate().toString(),
                        m.getWeightKg(),
                        m.getBodyFatPct()))
                .collect(Collectors.toList());
    }

    @Override
    public MetricsSummary summary() {
        String userId = SecurityUtils.currentUserId();
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);

        // All buckets — needed for latest values and total count
        var allBuckets = repository.findByUserIdOrderByWeekStartDesc(userId);

        if (allBuckets.isEmpty()) {
            return new MetricsSummary(null, null, null, 0);
        }

        // Flatten all measurements, newest first (buckets are already desc)
        var allMeasurements = allBuckets.stream()
                .flatMap(b -> b.getMeasurements().stream())
                .sorted(Comparator.comparing(DailyMeasurement::getDate).reversed())
                .toList();

        Double latestWeight = allMeasurements.stream()
                .filter(m -> m.getWeightKg() != null)
                .findFirst()
                .map(DailyMeasurement::getWeightKg)
                .orElse(null);

        Double latestBodyFat = allMeasurements.stream()
                .filter(m -> m.getBodyFatPct() != null)
                .findFirst()
                .map(DailyMeasurement::getBodyFatPct)
                .orElse(null);

        // 30-day weight delta — compare newest to oldest in the window
        var windowBuckets = repository.findByUserIdAndWeekStartBetween(
                userId, toMonday(thirtyDaysAgo), LocalDate.now());

        Double weightChange = computeWeightChange(windowBuckets, latestWeight);

        int totalEntries = allBuckets.stream()
                .mapToInt(BodyMetricsBucket::getCount)
                .sum();

        return new MetricsSummary(latestWeight, latestBodyFat, weightChange, totalEntries);
    }

    @Override
    public void deleteByDate(String isoDate) {
        String userId = SecurityUtils.currentUserId();
        LocalDate date = LocalDate.parse(isoDate);
        LocalDate weekStart = toMonday(date);

        // $pull removes the matching element from the measurements array
        Query query = Query.query(
                Criteria.where("userId").is(userId)
                        .and("weekStart").is(weekStart));

        Update update = new Update()
                .pull("measurements",
                        Query.query(Criteria.where("date").is(date)))
                .inc("count", -1);

        mongoTemplate.updateFirst(query, update, BodyMetricsBucket.class);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Truncate any date to its Monday — the canonical bucket key.
     */
    private LocalDate toMonday(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    private Double computeWeightChange(
            List<BodyMetricsBucket> windowBuckets, Double latestWeight) {

        if (latestWeight == null || windowBuckets.isEmpty()) return null;

        var oldestInWindow = windowBuckets.stream()
                .flatMap(b -> b.getMeasurements().stream())
                .filter(m -> m.getWeightKg() != null)
                .min(Comparator.comparing(DailyMeasurement::getDate))
                .map(DailyMeasurement::getWeightKg)
                .orElse(null);

        if (oldestInWindow == null) return null;
        return Math.round((latestWeight - oldestInWindow) * 10.0) / 10.0;
    }
}