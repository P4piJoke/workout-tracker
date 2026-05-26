package com.ppjk.workouttracker.domain;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "workouts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workout {

    @Id
    private String id;

    private String userId;

    @NotBlank
    private String name;

    private LocalDate date;

    @Builder.Default
    private List<WorkoutEntry> entries = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;
}