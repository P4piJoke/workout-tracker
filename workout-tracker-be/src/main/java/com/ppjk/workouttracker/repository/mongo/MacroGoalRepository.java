package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.UserMacroGoal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MacroGoalRepository extends MongoRepository<UserMacroGoal, String> {
    Optional<UserMacroGoal> findByUserId(String userId);
}