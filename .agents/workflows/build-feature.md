# Workflow: /build-feature

## Trigger
User types `/build-feature {feature-name}` or asks to build a specific feature.

## Steps
1. Confirm which branch you're on (should be feat/{feature-name}).
2. Read AGENTS.md, the relevant rule files, and any spec sections for this feature.
3. Read the reference image for any screens involved.
4. Plan the changes needed (files to create/modify).
5. Build in small steps:
   a. Backend: migration → repository → validator → controller → route → test.
   b. Frontend: service layer → component → page → route → test.
6. After each file: run the relevant build or test command. Fix errors before continuing.
7. For screens: screenshot and compare to reference image.
8. Run the full test suite: npm run test (frontend), composer test (backend).
9. Run npm run build — confirm no errors.
10. Commit: `git add . && git commit -m "feat: {description}"`

## Definition of done
- [ ] Build passes
- [ ] Tests pass (including auth tests)
- [ ] Screen matches reference at 1440px and 360px
- [ ] No secrets in code
- [ ] api-contract.md updated
- [ ] README updated if new feature is user-visible
