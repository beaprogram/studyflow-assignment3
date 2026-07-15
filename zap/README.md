# OWASP ZAP Security Scan

The client was scanned in headless mode with the official stable ZAP container.
The scan target was the production build served locally at
`http://host.docker.internal:4173`.

## Evidence

- `zap-report-before-web.html` and `.json` - baseline scan. It reports two
  medium findings: missing Content Security Policy and missing anti-clickjacking
  protection.
- `zap-report-after-web.html` and `.json` - verified scan after remediation,
  generated July 15, 2026 at 19:19 UTC. It contains no high- or medium-risk
  findings. Only informational observations remain.
- `remediation.md` - code/configuration evidence for both fixes.

## Reproduce the final scan

Build and start the client first:

```bash
cd client
npm run build
npm run preview -- --host 0.0.0.0
```

Then run ZAP from the repository root:

```bash
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -v "$PWD/zap:/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t http://host.docker.internal:4173 \
  -m 1 \
  -r zap-report-after-web.html \
  -J zap-report-after-web.json
```

ZAP may return exit code 2 for informational warnings. The JSON report is the
authoritative evidence: its remaining alerts have `riskcode` 0.
