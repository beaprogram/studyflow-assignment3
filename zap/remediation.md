# Security Remediation Evidence

## Baseline findings

The baseline report (`zap-report-before-web.json`, July 15, 2026 at 17:44 UTC)
contained these medium-risk alerts:

1. Content Security Policy (CSP) Header Not Set - three instances.
2. Missing Anti-clickjacking Header - one instance.

## Remediation 1: Content Security Policy

The client now sends a restrictive CSP from both local Vite preview and Netlify
production configuration:

```text
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
connect-src 'self';
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none'
```

The only inline React style was replaced by an SVG presentation attribute, so
the policy does not require `style-src 'unsafe-inline'`. The configuration is
implemented in `client/vite.config.js`, `client/netlify.toml`, and
`client/serve.json`.

## Remediation 2: Clickjacking protection

The client now sends both modern and legacy frame protection:

```text
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
```

The same response also includes `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, and cross-origin isolation headers.

## Verification

The final after-scan (`zap-report-after-web.json`, July 15, 2026 at 19:19 UTC)
crawled six URLs successfully and reports no high- or medium-risk findings. The
two remaining entries are informational only: Modern Web Application and
Storable but Non-Cacheable Content.
