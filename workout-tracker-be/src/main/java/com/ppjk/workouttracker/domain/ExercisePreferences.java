package com.ppjk.workouttracker.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "exercise_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExercisePreferences {

    @Id
    private String id;

    private String userId;
    private String exerciseId;
    private String exerciseName;   // denormalized — avoids a join just for display

    @Field("targetRepsMin")
    private int targetRepsMin;

    @Field("targetRepsMax")
    private int targetRepsMax;
}