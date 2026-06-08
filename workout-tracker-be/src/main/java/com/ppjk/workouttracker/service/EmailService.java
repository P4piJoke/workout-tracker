package com.ppjk.workouttracker.service;

import com.ppjk.workouttracker.dto.WeeklyDigestData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

/**
 * Renders the Thymeleaf HTML template and sends via JavaMailSender.
 *
 * Analogy: think of TemplateEngine as a mail-merge tool — it takes a template
 * with placeholders and a data object, and produces a finished HTML string.
 * JavaMailSender is the post office that actually delivers it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${digest.from-address}")
    private String fromAddress;

    /**
     * Renders the weekly-digest template and sends the email.
     * Logs a warning on failure rather than throwing — a broken digest email
     * should never crash the scheduler or affect other users.
     */
    public void sendWeeklyDigest(WeeklyDigestData data) {
        try {
            String html = renderTemplate(data);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(fromAddress);
            helper.setTo(data.toEmail());
            helper.setSubject(buildSubject(data));
            helper.setText(html, true);   // true = isHtml

            mailSender.send(message);
            log.info("Weekly digest sent to {} ({})", data.username(), data.toEmail());

        } catch (MessagingException ex) {
            log.error("Failed to send weekly digest to {}: {}",
                    data.toEmail(), ex.getMessage(), ex);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String renderTemplate(WeeklyDigestData data) {
        // Context is Thymeleaf's variable bag — everything put here becomes
        // accessible in the template as ${variableName}
        Context ctx = new Context();
        ctx.setVariable("digest", data);
        return templateEngine.process("email/weekly-digest", ctx);
    }

    private String buildSubject(WeeklyDigestData data) {
        String weekRange = data.weekStart() + " – " + data.weekEnd();

        if (!data.newPrs().isEmpty()) {
            return String.format("💪 Your weekly digest (%s) — %d new PR%s!",
                    weekRange,
                    data.newPrs().size(),
                    data.newPrs().size() > 1 ? "s" : "");
        }

        return String.format("🏋 Your weekly digest (%s) — %d session%s logged",
                weekRange,
                data.sessionsLogged(),
                data.sessionsLogged() > 1 ? "s" : "");
    }
}