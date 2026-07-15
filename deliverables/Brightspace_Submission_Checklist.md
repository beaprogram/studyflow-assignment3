# Brightspace Submission Checklist

## Submit this file

- `StudyFlow_Assignment3_Report.pdf` - primary Brightspace submission.

The report contains the required Git repository link, performance comparison,
security remediation evidence, and monitoring screenshot. The editable
`StudyFlow_Assignment3_Report.docx` is included as a backup; upload it only if
Brightspace or the instructor asks for a Word copy.

## Before clicking Submit

- Push the completed local repository to the `main` branch at
  `https://github.com/beaprogram/studyflow-assignment3`.
- Open the repository link in a private browser window and confirm it is
  accessible to the marker.
- Confirm the repository contains `client/`, `api/`, `jmeter/`, `zap/`,
  `monitoring/`, `PERFORMANCE_EVIDENCE.md`, and `deliverables/`.
- Confirm the report opens and the Grafana screenshot is readable.
- Do not submit `.env`, database passwords, `node_modules`, or build folders.
- Add any requested Brightspace text such as team member names or student IDs.

## Repository evidence included

- JMeter plans and four raw before/after CSV files.
- Two measured client optimizations and two measured server optimizations.
- OWASP ZAP baseline and final HTML/JSON reports plus remediation notes.
- Prometheus configuration, Grafana provisioning, dashboard JSON, and screenshot.
- API smoke tests, client build configuration, and reproduction instructions.
