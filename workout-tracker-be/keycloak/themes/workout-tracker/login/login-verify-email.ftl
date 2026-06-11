<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Workout Tracker — Check your email</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css"/>
</head>
<body>

<div class="shell">

  <aside class="panel panel--brand">
    <div class="brand">WORK<span>OUT</span></div>
    <p class="tagline">One step left.<br/>Check your inbox.</p>
    <div class="bg-word" aria-hidden="true">DONE</div>
  </aside>

  <main class="panel panel--form">
    <div class="form-card">

      <h1 class="form-title">Check your email</h1>
      <p class="form-sub">Almost there, athlete.</p>

      <div class="alert alert--success">
        We sent a confirmation link to
        <#if email?has_content>
          <strong>${email}</strong>
        <#else>
          your email address
        </#if>.
      </div>

      <p style="font-size: 0.875rem; color: #666; line-height: 1.7; margin-bottom: 1.5rem;">
        Didn't receive it? Check your spam folder.<br/>
        The link expires in 5 minutes.
      </p>

      <#-- Resend button — Keycloak provides this action when available -->
      <#if resendNode??>
        <form action="${url.loginAction}" method="post">
          <input type="hidden" name="resend" value="true"/>
          <button class="btn-submit" type="submit">
            Resend email <span class="btn-arrow">→</span>
          </button>
        </form>
      </#if>

      <p class="alt-link" style="margin-top: 1.5rem;">
        <#-- Redirect to React app — AuthProvider triggers a fresh login flow -->
        <a href="http://localhost:5173">← Back to sign in</a>
      </p>

    </div>
  </main>

</div>

</body>
</html>