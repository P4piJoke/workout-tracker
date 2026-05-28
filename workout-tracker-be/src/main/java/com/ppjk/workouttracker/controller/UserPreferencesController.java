package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.domain.UserPreferences;
import com.ppjk.workouttracker.dto.UserPreferencesRequest;
import com.ppjk.workouttracker.service.UserPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// controller/UserPreferencesController.java
@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService service;

    @GetMapping
    public UserPreferences get() {
        return service.getOrDefault();
    }

    @PutMapping
    public UserPreferences update(@Valid @RequestBody UserPreferencesRequest req) {
        return service.update(req);
    }
}
