package com.ppjk.workouttracker.domain;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "exercises")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "exercises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    private String id;

    @Field(type = FieldType.Text)
    private String name;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private MuscleGroup primaryMuscle;

    @Field(type = FieldType.Keyword)
    private List<MuscleGroup> secondaryMuscles;

    @Field(type = FieldType.Keyword)
    private ExerciseType type;
}
