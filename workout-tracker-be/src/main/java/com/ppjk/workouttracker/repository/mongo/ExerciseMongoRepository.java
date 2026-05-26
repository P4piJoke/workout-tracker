package com.ppjk.workouttracker.repository.mongo;

import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.ExerciseType;
import com.ppjk.workouttracker.domain.MuscleGroup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseMongoRepository extends MongoRepository<Exercise, String> {

    List<Exercise> findByPrimaryMuscle(MuscleGroup primaryMuscle);

    List<Exercise> findByType(ExerciseType type);

    List<Exercise> findByPrimaryMuscleAndType(MuscleGroup muscle, ExerciseType type);
}
