package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.Workout;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutRepository extends MongoRepository<Workout, String> {

    List<Workout> findByUserIdOrderByDateDesc(String userId);

    Optional<Workout> findByIdAndUserId(String id, String userId);
}
