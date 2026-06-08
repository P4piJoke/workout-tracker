package com.ppjk.workouttracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkoutTrackerApplication {

    static void main(String[] args) {
        SpringApplication.run(WorkoutTrackerApplication.class, args);
    }
}
