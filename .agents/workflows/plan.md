# Workflow: /plan — Read and Plan

## Trigger
User types `/plan` or asks for a plan before building.

## Steps
1. Read AGENTS.md in full.
2. Read docs/spec/ files if present.
3. Read docs/api-contract.md if present.
4. List the screens from .agents/rules/10-design-system.md.
5. Produce a prioritised task list grouped by: Core → Stretch → Optional.
6. For each task: estimated time, dependencies, risks.
7. List any blockers or conflicts with shared-hosting requirements.
8. Present the plan and WAIT for user approval before building anything.

## Output format
```
## WhyWrong Build Plan

### Core (must ship)
- [ ] Task name — Xh — depends on: Y — risk: Z

### Stretch (ship if time allows)
- [ ] Task name — Xh

### Known risks
- Risk 1: mitigation
```
