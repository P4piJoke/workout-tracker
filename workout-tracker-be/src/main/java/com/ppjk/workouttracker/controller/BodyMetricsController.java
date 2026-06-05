package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.dto.BodyMetricsDtos.LogMetricRequest;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.MetricPoint;
import com.ppjk.workouttracker.dto.BodyMetricsDtos.MetricsSummary;
import com.ppjk.workouttracker.service.BodyMetricsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class BodyMetricsController {

    private final BodyMetricsService service;

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void log(@Valid @RequestBody LogMetricRequest req) {
        service.log(req);
    }

    @GetMapping("/history")
    public List<MetricPoint> history() {
        return service.history();
    }

    @GetMapping("/summary")
    public MetricsSummary summary() {
        return service.summary();
    }

    @DeleteMapping("/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String date) {
        service.deleteByDate(date);
    }
}