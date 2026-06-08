package com.ppjk.workouttracker.service.impl;

import com.ppjk.workouttracker.config.CacheConfig;
import com.ppjk.workouttracker.config.SecurityUtils;
import com.ppjk.workouttracker.domain.UserPreferences;
import com.ppjk.workouttracker.dto.UserPreferencesRequest;
import com.ppjk.workouttracker.repository.mongo.UserPreferencesRepository;
import com.ppjk.workouttracker.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserPreferencesServiceImpl implements UserPreferencesService {

    private final UserPreferencesRepository repository;

    @Override
    public UserPreferences getOrDefault() {
        var prefs = repository
                .findByUserId(SecurityUtils.currentUserId())
                .orElseGet(this::defaults);

        // Opportunistically sync email + username from the current JWT.
        // This ensures the digest scheduler always has fresh contact details
        // even if the user hasn't explicitly saved their preferences recently.
        syncEmailFromJwt(prefs);
        return repository.save(prefs);
    }

    @Override
    @CacheEvict(value = CacheConfig.OVERLOAD,
            key = "@securityUtils.currentUserId()")
    public UserPreferences update(UserPreferencesRequest req) {
        if (req.targetRepsMin() >= req.targetRepsMax())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Min reps must be less than max reps");

        var prefs = repository
                .findByUserId(SecurityUtils.currentUserId())
                .orElseGet(this::defaults);

        prefs.setTargetRepsMin(req.targetRepsMin());
        prefs.setTargetRepsMax(req.targetRepsMax());
        prefs.setDefaultSets(req.defaultSets());

        if (req.heightCm() != null)        prefs.setHeightCm(req.heightCm());
        if (req.sex() != null)             prefs.setSex(req.sex());
        if (req.activityLevel() != null)   prefs.setActivityLevel(req.activityLevel());

        // Only update the digest flag when the caller explicitly passes it.
        // Null means "don't change" — preserves backward compatibility with
        // older frontend versions that don't send this field yet.
        if (req.weeklyDigestEnabled() != null) {
            prefs.setWeeklyDigestEnabled(req.weeklyDigestEnabled());
        }

        // Always keep email/username fresh on every save
        syncEmailFromJwt(prefs);

        return repository.save(prefs);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private UserPreferences defaults() {
        return UserPreferences.builder()
                .userId(SecurityUtils.currentUserId())
                .targetRepsMin(8)
                .targetRepsMax(12)
                .defaultSets(3)
                .weeklyDigestEnabled(true)
                .build();
    }

    /**
     * Reads the email and preferred_username claims from the current request's
     * JWT and writes them into the preferences document.
     *
     * Analogy: every time the user "checks in" to the app (calls GET /preferences),
     * we update our address book with their latest contact details — no separate
     * sync job needed.
     */
    private void syncEmailFromJwt(UserPreferences prefs) {
        var jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        String email    = jwt.getClaimAsString("email");
        String username = jwt.getClaimAsString("preferred_username");

        if (email    != null) prefs.setEmail(email);
        if (username != null) prefs.setUsername(username);
    }
}