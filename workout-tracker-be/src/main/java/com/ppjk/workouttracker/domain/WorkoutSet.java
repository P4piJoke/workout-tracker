package com.ppjk.workouttracker.domain;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSet {

    private int setNumber;

    @Min(1)
    private int reps;

    @DecimalMin("0.0")
    private double weightKg;

    @Builder.Default
    private SetType type = SetType.WORKING;
}
