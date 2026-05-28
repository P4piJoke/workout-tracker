package com.ppjk.workouttracker.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {

    @Id
    private String id;
    private String userId;
    private int targetRepsMin;  // default 8
    private int targetRepsMax;  // default 12
    private int defaultSets;    // pre-fills set count when adding exercise
}
