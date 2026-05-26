<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Workout Tracker — Create account</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css"/>
</head>
<body>

<div class="shell">

  <!-- ── Left panel: branding ──────────────────────── -->
  <aside class="panel panel--brand">
    <div class="brand">WORK<span>OUT</span></div>
    <p class="tagline">Start tracking.<br/>Start improving.</p>
    <div class="bg-word" aria-hidden="true">JOIN</div>
  </aside>

  <!-- ── Right panel: form ─────────────────────────── -->
  <main class="panel panel--form">
    <div class="form-card">

      <h1 class="form-title">Create account</h1>
      <p class="form-sub">Free. No cards. Just lifts.</p>

      <!-- Keycloak error / info messages -->
      <#if message?has_content>
        <div class="alert alert--${message.type}">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form action="${url.registrationAction}" method="post" novalidate>

        <!-- name row -->
        <div class="field-row">
          <div class="field">
            <label class="field-label" for="firstName">First name</label>
            <input
              class="input <#if messagesPerField.existsError('firstName')>input--error</#if>"
              id="firstName" name="firstName" type="text"
              value="${(register.firstName!'')}"
              autocomplete="given-name" tabindex="1"
            />
            <#if messagesPerField.existsError('firstName')>
              <span class="field-error">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
            </#if>
          </div>

          <div class="field">
            <label class="field-label" for="lastName">Last name</label>
            <input
              class="input <#if messagesPerField.existsError('lastName')>input--error</#if>"
              id="lastName" name="lastName" type="text"
              value="${(register.lastName!'')}"
              autocomplete="family-name" tabindex="2"
            />
            <#if messagesPerField.existsError('lastName')>
              <span class="field-error">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
            </#if>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="username">Username</label>
          <input
            class="input <#if messagesPerField.existsError('username')>input--error</#if>"
            id="username" name="username" type="text"
            value="${(register.username!'')}"
            autocomplete="username" tabindex="3" autofocus
          />
          <#if messagesPerField.existsError('username')>
            <span class="field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
          </#if>
        </div>

        <div class="field">
          <label class="field-label" for="email">Email</label>
          <input
            class="input <#if messagesPerField.existsError('email')>input--error</#if>"
            id="email" name="email" type="email"
            value="${(register.email!'')}"
            autocomplete="email" tabindex="4"
          />
          <#if messagesPerField.existsError('email')>
            <span class="field-error">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
          </#if>
        </div>

        <div class="field">
          <label class="field-label" for="password">Password</label>
          <input
            class="input <#if messagesPerField.existsError('password','password-confirm')>input--error</#if>"
            id="password" name="password" type="password"
            autocomplete="new-password" tabindex="5"
          />
          <#if messagesPerField.existsError('password')>
            <span class="field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
          </#if>
        </div>

        <div class="field">
          <label class="field-label" for="password-confirm">Confirm password</label>
          <input
            class="input <#if messagesPerField.existsError('password-confirm')>input--error</#if>"
            id="password-confirm" name="password-confirm" type="password"
            autocomplete="new-password" tabindex="6"
          />
          <#if messagesPerField.existsError('password-confirm')>
            <span class="field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
          </#if>
        </div>

        <button class="btn-submit" type="submit" tabindex="7">
          Create account <span class="btn-arrow">→</span>
        </button>

      </form>

      <p class="alt-link">
        Already have an account?
        <a href="${url.loginUrl}" tabindex="8">Sign in</a>
      </p>

    </div>
  </main>

</div>

</body>
</html>
