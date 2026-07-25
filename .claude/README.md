# .claude Directory

This directory contains project-specific context and configuration for working with Claude Code.

## Files

- **project-context.md** - Current state, decisions, session history
- **README.md** - This file

## Purpose

The `.claude/` directory helps maintain continuity across Claude Code sessions by:

1. **Preserving Context** - Documents current project state and recent decisions
2. **Tracking Changes** - Session history shows what was accomplished
3. **Guiding Future Work** - Next steps and patterns documented
4. **Decision Log** - Why choices were made (versions, architecture, etc.)

## Usage

When starting a new Claude Code session on this project:

1. Review `CLAUDE.md` for overall project understanding
2. Check `project-context.md` for current state and recent changes
3. Update session history when work is completed

## What to Commit

**DO commit:**
- project-context.md (shared project knowledge)
- README.md (this file)
- Any project-wide settings

**DON'T commit:**
- Personal preferences
- API keys or credentials
- Session-specific temporary files
- Local cache files

---

**See also:** `CLAUDE.md` in project root for comprehensive project documentation.
