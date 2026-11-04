# Task lifecycle

Task lifecycle is a user-facing part of nodejs-todo-app.

## Sub-features

- `task-lifecycle`: Helper creates metadata-bearing task via HTTP, reads it back, completes, deletes and confirms absence. Browser mode creates/completes at 390px then uses desktop hover Delete task at 1280px.

## How to get to it (user POV)

Open / and use Add a new mission...; toggle task completion. Desktop Delete task appears on hover.

## Driving it with verify-nodejs-todo-app

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Helper creates metadata-bearing task via HTTP, reads it back, completes, deletes and confirms absence. Browser mode creates/completes at 390px then uses desktop hover Delete task at 1280px. Run `node .cursor/skills/verify-nodejs-todo-app/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

Mobile deletion is swipe-only, not the hidden desktop Delete button. Mobile swipe is NOT verified by desktop deletion. Existing e2e clearAllMissions is destructive; never run it against shared data.
