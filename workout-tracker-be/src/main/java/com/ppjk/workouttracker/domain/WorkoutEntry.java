package com.ppjk.workouttracker.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutEntry {

    private String exerciseId;
    private String exerciseName;

    @Builder.Default
    private List<WorkoutSet> sets = new ArrayList<>();
}
