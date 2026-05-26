<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Workout Tracker — Sign in</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css"/>
</head>
<body>

<div class="shell">

  <!-- ── Left panel: branding ──────────────────────── -->
  <aside class="panel panel--brand">
    <div class="brand">WORK<span>OUT</span></div>
    <p class="tagline">Track every rep.<br/>Own every session.</p>
    <div class="bg-word" aria-hidden="true">LIFT</div>
  </aside>

  <!-- ── Right panel: form ─────────────────────────── -->
  <main class="panel panel--form">
    <div class="form-card">

      <h1 class="form-title">Sign in</h1>
      <p class="form-sub">Welcome back, athlete.</p>

      <!-- Error / info messages from Keycloak -->
      <#if message?has_content>
        <div class="alert alert--${message.type}">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form action="${url.loginAction}" method="post" novalidate>

        <div class="field">
          <label class="field-label" for="username">Username or email</label>
          <input
            class="input"
            id="username"
            name="username"
            type="text"
            value="${(login.username!'')}"
            autofocus
            autocomplete="username"
            tabindex="1"
          />
        </div>

        <div class="field">
          <label class="field-label" for="password">Password</label>
          <input
            class="input"
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            tabindex="2"
          />
        </div>

        <!-- Required hidden field for Keycloak credential selection -->
        <input
          type="hidden"
          name="credentialId"
          <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>
        />

        <button class="btn-submit" type="submit" tabindex="3">
          Sign in <span class="btn-arrow">→</span>
        </button>

      </form>

      <#if realm.registrationAllowed?? && realm.registrationAllowed>
        <p class="alt-link">
          No account?
          <a href="${url.registrationUrl}" tabindex="4">Create one</a>
        </p>
      </#if>

      <#if realm.resetPasswordAllowed>
        <p class="alt-link">
          <a href="${url.loginResetCredentialsUrl}" tabindex="5">Forgot password?</a>
        </p>
      </#if>

    </div>
  </main>

</div>

</body>
</html>
