# Ralph - PRD Task Implementation Skill

This skill implements the Ralph technique for autonomous, incremental task completion from a PRD (Product Requirements Document). It reads the PRD, finds the next incomplete task, implements it, commits, and updates progress.

## Usage

```
/ralph
```

Or with a specific PRD file:
```
/ralph PRD.md
```

Clear the current PRD.md and progress.txt

## Philosophy

**ONE TASK AT A TIME**: Ralph focuses on small, incremental progress. Each invocation:
1. Reads the PRD to understand the full scope
2. Reads progress.txt to see what's done
3. Picks the NEXT incomplete task (highest priority, unblocked)
4. Implements ONLY that task
5. Commits with a descriptive message
6. Updates progress.txt

**NEVER** implement multiple tasks in one iteration. Small commits are easier to review and rollback.

## Instructions

When this skill is invoked, follow these phases strictly:

---

## Phase 1: Read Context

### 1.1 Read the PRD

Read `PRD.md` (or the file specified) to understand:
- The overall project goal
- The complete list of tasks/phases
- Task dependencies (what blocks what)
- Technical requirements and constraints

### 1.2 Read Progress

Read `progress.txt` to understand:
- Which tasks are already completed
- Any notes from previous iterations
- Current state of implementation

If `progress.txt` doesn't exist or is empty, this is the first iteration.

### 1.3 Identify Next Task

Find the next task to implement based on:
1. **Not completed** - Task not marked done in progress.txt
2. **Unblocked** - Dependencies (if any) are satisfied
3. **Priority** - Earlier phases/tasks first
4. **Smallest scope** - Prefer atomic, well-defined tasks

Output your analysis:
```
RALPH ANALYSIS:
================
PRD: [filename]
Progress: [X of Y tasks completed]

NEXT TASK:
- Phase: [Phase name/number]
- Task: [Task description]
- Dependencies: [None / List of completed deps]
- Estimated scope: [Files to create/modify]
```

---

## Phase 2: Implement the Task

### 2.1 Plan the Implementation

Before writing code:
1. Identify exact files to create or modify
2. Understand existing patterns in the codebase
3. Check for any related code to reference

### 2.2 Execute Implementation

Implement the task following project conventions:
- Use existing patterns and styles
- Follow the project's architecture
- Add necessary imports/references
- Ensure code compiles

### 2.3 Verify Implementation

After implementing:
1. Build the project:
   - Backend: `cd backend && go build ./...`
   - Frontend: `cd frontend && npx tsc --noEmit`
2. Fix any compilation errors
3. Ensure the task is fully complete

---

## Phase 3: Commit Changes

### 3.1 Stage Relevant Files

Stage only files related to this task:
```bash
git add [specific files]
```

### 3.2 Commit with Descriptive Message

Use a clear commit message format:
```
[Ralph] Phase X: Task description

- Detail 1
- Detail 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 4: Update Progress

### 4.1 Append to progress.txt

Add an entry to `progress.txt`:
```
[YYYY-MM-DD HH:MM] Phase X - Task Name
  - Created: file1.go, file2.tsx
  - Modified: file3.go
  - Status: COMPLETED
  - Notes: Any relevant notes
```

### 4.2 Check for Completion

If ALL tasks in the PRD are complete, output:
```
RALPH: ALL TASKS COMPLETE
```

Otherwise, output:
```
RALPH ITERATION COMPLETE
========================
Task completed: [Task name]
Remaining tasks: [X]
Next suggested task: [Task name]

Run /ralph again to continue.
```

---

## Phase 5: Output Summary

Provide a concise summary of what was done:

```
RALPH SUMMARY
=============
Task: [Task description]
Files changed:
  + [new files created]
  ~ [files modified]
Commit: [commit hash]

Progress: [X/Y tasks] ([percentage]%)
```

---

## Error Handling

### If PRD.md doesn't exist:
```
ERROR: PRD.md not found.
Create a PRD.md file with your project requirements first.
Use plan mode (Shift+Tab) to generate one, or create manually.
```

### If task implementation fails:
1. Revert any partial changes
2. Document the failure in progress.txt
3. Suggest how to resolve the issue
4. Do NOT mark task as complete

### If build fails:
1. Attempt to fix compilation errors
2. If unable to fix, revert changes
3. Document the issue
4. Ask for user guidance

---

## PRD Format Guidelines

Ralph works best with PRDs that have:

### Clear Task Lists
```markdown
## Phase 1: Backend
- [ ] Task 1 description
- [ ] Task 2 description

## Phase 2: Frontend
- [ ] Task 3 description (depends on Phase 1)
```

### Checkboxes for Progress
- `[ ]` = Not started
- `[x]` = Completed

### Explicit Dependencies
```markdown
### Task: Create DashboardHub
**Depends on:** DashboardMetricsDto model
**Blocks:** Real-time updates feature
```

---

## Tips for Best Results

1. **Keep tasks atomic** - One feature per task
2. **Be specific** - "Create UserService with GetUser method" > "Add user service"
3. **Order by dependency** - Put foundation tasks first
4. **Include acceptance criteria** - How to verify task is complete
5. **Run frequently** - Small iterations = easy debugging

---

## Limitations

- Ralph cannot handle interactive prompts (tests requiring input)
- Ralph cannot deploy or run the server
- Ralph cannot access external services (APIs, databases)
- Ralph works best with well-defined, code-focused tasks

# Knowledge Management

## Purpose
Reduce token usage and prevent repeated problem-solving by maintaining a lightweight knowledge base.

## When to Use
- After solving a non-obvious problem
- When discovering undocumented behavior
- When finding workarounds for edge cases

## Instructions

1. **Create/Update KNOWLEDGE.md** at project root when you:
   - Struggle to locate something in the codebase
   - Discover a tricky solution worth remembering
   - Find unexpected behavior or gotchas

2. **Format entries concisely**:
```markdown
   ## [Category]

   **Q:** [Brief question/problem]
   **A:** [Concise solution]
```

3. **Consult KNOWLEDGE.md first** before deep codebase exploration

## Guidelines
- Keep entries atomic (one problem = one entry)
- Prefer file paths and method names over lengthy explanations
- Prune obsolete entries when refactoring