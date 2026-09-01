# Process Notes

## Local Development

1. Install dependencies for backend and frontend.
2. Configure `backend/.env`.
3. Run Prisma migrations and generate Prisma Client.
4. Seed demo tenant data.
5. Start backend, then frontend.

## Release Checklist

- Prisma schema and migrations are aligned.
- `npx prisma generate` succeeds.
- Backend syntax checks pass.
- Frontend build passes.
- Smoke test login for each role.
- Smoke test create KAO, client, company, compliance, approval, notification, and audit log.

## Quality Gates To Add

- API tests for auth, Compliance Master, approvals, notifications, and audit logs.
- Frontend smoke tests for role navigation and primary workflows.
- Seed script with realistic enterprise demo data.
- Error logging and monitoring.
- Role permission test matrix.

## Enterprise Workflow

1. Company creates or imports compliance records.
2. System writes an audit log and notification.
3. User submits a record for approval from Compliance Master.
4. Approver approves or rejects from Approval Workflow.
5. System writes notifications and audit logs for every decision.
6. Super Admin can review platform-wide audit activity.
