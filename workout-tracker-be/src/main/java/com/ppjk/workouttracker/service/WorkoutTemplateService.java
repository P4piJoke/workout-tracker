package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.TemplateDtos.CreateTemplateRequest;
import com.ppjk.workouttracker.dto.TemplateDtos.TemplateResponse;

import java.util.List;

public interface WorkoutTemplateService {

    /**
     * All templates visible to the current user (own + SYSTEM).
     */
    List<TemplateResponse> listVisible();

    /**
     * Create a new template. Admin can set isPublic=true to mark as SYSTEM.
     */
    TemplateResponse create(CreateTemplateRequest req, boolean isAdmin);

    /**
     * Clone any visible template into the current user's library.
     * Returns the new user-owned copy.
     */
    TemplateResponse clone(String templateId);

    /**
     * Delete a template — only the owner (or admin for SYSTEM) can delete.
     */
    void delete(String templateId, boolean isAdmin);
}