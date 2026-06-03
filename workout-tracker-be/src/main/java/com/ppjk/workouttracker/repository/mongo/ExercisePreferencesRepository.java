package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.ExercisePreferences;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExercisePreferencesRepository
        extends MongoRepository<ExercisePreferences, String> {

    Optional<ExercisePreferences> findByUserIdAndExerciseId(String userId, String exerciseId);

    List<ExercisePreferences> findByUserId(String userId);

    void deleteByUserIdAndExerciseId(String userId, String exerciseId);
}
