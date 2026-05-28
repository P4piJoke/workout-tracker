package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.UserPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserPreferencesRepository extends MongoRepository<UserPreferences, String> {

    Optional<UserPreferences> findByUserId(String userId);
}
