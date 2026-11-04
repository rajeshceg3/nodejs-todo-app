# nodejs-todo-app verification map

Run from an isolated local checkout. Baseline: dependencies installed, no shared services or production data. Only the helper-owned processes may be driven. Evidence survives cleanup.

- [Task lifecycle](task-lifecycle.md)
- [Audit trail](audit-trail.md)
- [Temporal Center](temporal-center.md)
- [Input validation](validation.md)

## Proof boundaries

The generation proof covers the safe helper recipe, not every mapped feature. No production or paid provider calls, deploys, or shared mutations are implied. Screenshots require VERIFY_BROWSER=1. Report remaining features as unverified until driven.
