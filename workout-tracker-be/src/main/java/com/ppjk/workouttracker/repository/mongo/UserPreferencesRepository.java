package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.UserPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserPreferencesRepository extends MongoRepository<UserPreferences, String> {

    Optional<UserPreferences> findByUserId(String userId);

    /**
     * Used by the weekly digest scheduler to find all users who want the email.
     * Spring Data MongoDB derives the query from the method name:
     * weeklyDigestEnabled = true AND email is not null (handled in service).
     */
    List<UserPreferences> findByWeeklyDigestEnabledTrue();
}