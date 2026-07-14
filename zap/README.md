# OWASP ZAP Security Scan

Headless OWASP ZAP scan of the deployed application, plus evidence of fixes.

## Files (added as we go)

- `zap-report.html` (and/or `zap-report.json`) — the full scan report.
- `remediation.md` — the vulnerabilities chosen for fixing, with the before/
  after code or configuration snippets that address them.

## Method

1. Run ZAP in headless (baseline) mode against the deployed app URL.
2. Review all high- and medium-severity findings.
3. Fix at least two, with the change made in `api/` or `client/`.
4. Re-scan (or confirm the specific finding is gone) and record the evidence.

Example headless run (Docker):

```
docker run --rm -v "$(pwd)":/zap/wrk/:rw ghcr.io/zaproxy/zaproxy \
  zap-baseline.py -t https://YOUR-APP-URL -r zap-report.html
```
