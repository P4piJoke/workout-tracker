package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.OverloadRecommendation;

import java.util.List;

public interface ProgressiveOverloadService {

    List<OverloadRecommendation> recommendations();
}
