package com.ppjk.workouttracker.dto;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, property = "@class")
public record OverloadRecommendationResponse(List<OverloadRecommendation> recommendations) {
}
