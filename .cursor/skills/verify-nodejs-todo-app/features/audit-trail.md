# Audit trail

Audit trail is a user-facing part of nodejs-todo-app.

## Sub-features

- `audit-trail`: Helper requires three lifecycle entries and INTEGRITY_VERIFIED; UI log navigation is a separate unverified route.

## How to get to it (user POV)

Open Audit Log or GET /audit-logs and /audit-logs/verify.

## Driving it with verify-nodejs-todo-app

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Helper requires three lifecycle entries and INTEGRITY_VERIFIED; UI log navigation is a separate unverified route. Run `node .cursor/skills/verify-nodejs-todo-app/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

Use disposable DB only. API audit proof does not prove Temporal Center replay UI.
