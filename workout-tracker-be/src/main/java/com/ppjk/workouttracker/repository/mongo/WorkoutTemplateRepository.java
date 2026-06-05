package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.WorkoutTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutTemplateRepository extends MongoRepository<WorkoutTemplate, String> {

    /**
     * User's own templates, newest first.
     */
    List<WorkoutTemplate> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    /**
     * All templates visible to a user: their own + all SYSTEM templates.
     * Equivalent to: WHERE ownerId = :userId OR ownerId = 'SYSTEM'
     */
    @Query("{ '$or': [ { 'ownerId': ?0 }, { 'ownerId': 'SYSTEM' } ] }")
    List<WorkoutTemplate> findVisibleToUser(String userId);
}