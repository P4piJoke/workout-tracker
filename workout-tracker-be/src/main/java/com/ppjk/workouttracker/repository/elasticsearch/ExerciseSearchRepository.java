package com.ppjk.workouttracker.repository.elasticsearch;

import com.ppjk.workouttracker.domain.Exercise;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseSearchRepository
        extends ElasticsearchRepository<Exercise, String> {

    // Used in the first iteration purpose, later it will be deleted
//    List<Exercise> findByNameContainingOrDescriptionContaining(String name, String description);

    @Query("""
        {
          "multi_match": {
            "query": "?0",
            "fields": ["name^2", "description"],
            "type":   "best_fields",
            "fuzziness": "AUTO"
          }
        }
        """)
    List<Exercise> search(String query);
}
