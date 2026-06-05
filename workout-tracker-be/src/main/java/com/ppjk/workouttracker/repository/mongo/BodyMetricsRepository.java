package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.BodyMetricsBucket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BodyMetricsRepository extends MongoRepository<BodyMetricsBucket, String> {

    // All buckets for a user, newest first — used for chart data
    List<BodyMetricsBucket> findByUserIdOrderByWeekStartDesc(String userId);

    // Buckets in a date window — used for 30-day summary
    List<BodyMetricsBucket> findByUserIdAndWeekStartBetween(
            String userId, LocalDate from, LocalDate to);

    // Exact bucket lookup — used before the upsert to check existence
    Optional<BodyMetricsBucket> findByUserIdAndWeekStart(String userId, LocalDate weekStart);
}