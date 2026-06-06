package com.ppjk.workouttracker.controller;

import com.ppjk.workouttracker.dto.MacroGoalDtos.MacroGoalResponse;
import com.ppjk.workouttracker.dto.MacroGoalDtos.SaveMacroGoalRequest;
import com.ppjk.workouttracker.service.MacroGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/macro-goal")
@RequiredArgsConstructor
public class MacroGoalController {

    private final MacroGoalService service;

    @GetMapping
    public ResponseEntity<MacroGoalResponse> getCurrent() {
        return service.getCurrent()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    public MacroGoalResponse save(@Valid @RequestBody SaveMacroGoalRequest req) {
        return service.save(req);
    }
}