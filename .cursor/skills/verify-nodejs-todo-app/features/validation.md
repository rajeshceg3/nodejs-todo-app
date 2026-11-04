# Input validation

Input validation is a user-facing part of nodejs-todo-app.

## Sub-features

- `validation`: Helper POSTs {} to /list and requires 400; original backend suite covers parser and invalid IDs.

## How to get to it (user POV)

Submit an empty API task or an invalid update.

## Driving it with verify-nodejs-todo-app

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Helper POSTs {} to /list and requires 400; original backend suite covers parser and invalid IDs. Run `node .cursor/skills/verify-nodejs-todo-app/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

Browser empty submit and every malformed metadata variant are not all exercised.
