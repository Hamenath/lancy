# Lancy Incident Response Plan

## Severity Classifications
- **SEV-1 (Critical)**: Platform outage, payment processing failure, data breach, or authorization bypass.
- **SEV-2 (High)**: Core feature degraded (e.g. messaging gateway failure, AI assistant timeout).
- **SEV-3 (Medium)**: Non-critical feature bug (e.g. analytics chart formatting issue).
- **SEV-4 (Low)**: Minor cosmetic UI defect.

## Incident Workflow
1. **Detection & Triage**: Identify failure via `/ready` probes or correlation ID logs.
2. **Containment**: Apply rate limiting, feature toggle degradation, or rollback if needed.
3. **Recovery**: Deploy hotfix via CI workflow (`.github/workflows/ci.yml`).
4. **Postmortem**: Document root cause, timeline, and preventive actions in `docs/incidents/`.
