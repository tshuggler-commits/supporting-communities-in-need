#!/usr/bin/env bash
# Pull request check: keeps CLAUDE.md current (Tanya, 2026-11-06 ET: "Make sure it is getting
# updated as changes are made").
#
# Reads the changed file names from stdin, one per line. Reads the description from PR_BODY.
# It passes in any of these cases:
#   - the pull request changes no files
#   - the pull request changes CLAUDE.md
#   - the description has a line that starts with "CLAUDE.md: no update needed" and gives a reason
# Fails otherwise, and says how to fix it.
#
# Run by .github/workflows/claude-md-check.yml. Tests: bash .github/scripts/claude-md-check.test.sh

files="$(sed '/^$/d')"

if [ -z "$files" ]; then
  echo "No files changed."
  exit 0
fi

if printf '%s\n' "$files" | grep -qxF 'CLAUDE.md'; then
  echo "CLAUDE.md changed in this pull request."
  exit 0
fi

if printf '%s\n' "${PR_BODY:-}" | grep -Eiq '^[[:space:]]*CLAUDE\.md: no update needed[^[:alnum:]]*[[:alnum:]]'; then
  echo "The description says CLAUDE.md needs no update, and why."
  exit 0
fi

echo "::error title=CLAUDE.md is not current::This pull request changes files but not CLAUDE.md. Update CLAUDE.md as its 'Keep this file current' section says. If nothing in it applies, add a line to the pull request description that starts with 'CLAUDE.md: no update needed' and gives the reason."
exit 1
