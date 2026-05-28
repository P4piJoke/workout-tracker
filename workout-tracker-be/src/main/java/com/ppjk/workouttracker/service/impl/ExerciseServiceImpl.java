package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.domain.Exercise;
import com.ppjk.workouttracker.domain.ExerciseType;
import com.ppjk.workouttracker.domain.MuscleGroup;
import com.ppjk.workouttracker.repository.elasticsearch.ExerciseSearchRepository;
import com.ppjk.workouttracker.repository.mongo.ExerciseMongoRepository;
import com.ppjk.workouttracker.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseMongoRepository exerciseMongoRepository;
    private final ExerciseSearchRepository searchRepository;

    @Override
    public Exercise create(Exercise exercise) {
        Exercise saved = exerciseMongoRepository.save(exercise);
        searchRepository.save(saved);

        return saved;
    }

    @Override
    public List<Exercise> search(String query) {
//        return searchRepository.findByNameContainingOrDescriptionContaining(query, query);
        return searchRepository.search(query);
    }

    @Override
    public List<Exercise> getAll(MuscleGroup muscle, ExerciseType type) {
        if (muscle != null && type != null) {
            return exerciseMongoRepository.findByPrimaryMuscleAndType(muscle, type);
        }
        if (muscle != null) {
            return exerciseMongoRepository.findByPrimaryMuscle(muscle);
        }
        if (type != null) {
            return exerciseMongoRepository.findByType(type);
        }

        return exerciseMongoRepository.findAll();
    }

    @Override
    public void delete(String id) {
        exerciseMongoRepository.deleteById(id);
        searchRepository.deleteById(id);    // remove from both stores
    }
}
