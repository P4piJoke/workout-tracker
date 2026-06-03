package com.ppjk.workouttracker.config;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component("securityUtils")
public final class SecurityUtils {

    public static String currentUserId() {
        var jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return jwt.getSubject();
    }
}
