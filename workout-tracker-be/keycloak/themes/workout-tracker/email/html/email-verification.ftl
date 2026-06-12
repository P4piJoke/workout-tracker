<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirm your email — Workout Tracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', -apple-system, sans-serif;
      background: #0b0b0b;
      color: #f2f2f2;
    }
    .wrapper {
      max-width: 520px;
      margin: 48px auto;
      background: #141414;
      border: 1px solid #242424;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: #0f0f0f;
      border-bottom: 1px solid #1e1e1e;
      padding: 28px 32px;
    }
    .brand {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #f2f2f2;
    }
    .brand span { color: #c8ff3c; }
    .body { padding: 32px; }
    .title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.5rem;
    }
    .sub {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background: #c8ff3c;
      color: #0b0b0b;
      font-size: 0.9375rem;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      margin-bottom: 1.5rem;
    }
    .footer {
      font-size: 0.8rem;
      color: #444;
      border-top: 1px solid #242424;
      padding: 20px 32px;
      line-height: 1.6;
    }
    .footer a { color: #666; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">WORK<span>OUT</span></div>
  </div>
  <div class="body">
    <h1 class="title">Verify your email</h1>
    <p class="sub">
      Hey ${name!'Athlete'}, thanks for joining.<br/>
      Click the button below to confirm your email address and activate your account.
    </p>
    <a class="btn" href="${link}">Confirm email →</a>
    <p style="font-size: 0.8rem; color: #444;">
      This link expires in ${linkExpirationFormatter(linkExpiration)}.<br/>
      If you didn't create an account, ignore this email.
    </p>
  </div>
  <div class="footer">
    Or copy this link into your browser:<br/>
    <a href="${link}">${link}</a>
  </div>
</div>
</body>
</html>