#!/usr/bin/env bash
# Stop hook: keeps CLAUDE.md current (Tanya, 2026-11-06 ET: "Make sure it is getting updated as
# changes are made").
#
# It reminds a session once for each file that changed after CLAUDE.md last changed, and asks the
# session to update CLAUDE.md or say why nothing applies. A file counts when it changed in a commit
# on this branch after CLAUDE.md's latest commit, or when the change is not committed yet. Files
# that came in by merging main do not count.
# It stays quiet in these cases:
#   - the session is already continuing because of a Stop hook (so it cannot loop)
#   - CLAUDE.md has changes that are not committed yet (it is being updated now)
#   - every changed file was already named in a reminder since CLAUDE.md last changed
#   - anything goes wrong (it never stops a session from working)
#
# Run by .claude/settings.json. Tests: bash .claude/hooks/claude-md-reminder.test.sh

input="$(cat 2>/dev/null)"
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
g() { git -c core.quotePath=false "$@" 2>/dev/null; }

# CLAUDE.md is being updated right now: it has changes that are not committed yet.
[ -z "$(g status --porcelain -- CLAUDE.md)" ] || exit 0

# Where this branch left main. Empty when there is no main to compare with.
base="$(g merge-base HEAD origin/main || g merge-base HEAD main)"

# The commit where CLAUDE.md was last updated on this branch.
if [ -n "$base" ]; then range="$base..HEAD"; else range="HEAD"; fi
last="$(g log -1 --format=%H "$range" -- CLAUDE.md)"
ref="${last:-$base}"

# Committed changes after that point. With a base, keep only files that still differ from main,
# so files that came in by merging main do not count.
committed=""
if [ -n "$last" ] && [ -n "$base" ]; then
  committed="$(comm -12 <(g diff --name-only "$last" HEAD | sort -u) <(g diff --name-only "$base" HEAD | sort -u))"
elif [ -n "$ref" ]; then
  committed="$(g diff --name-only "$ref" HEAD)"
fi

changed="$(
  {
    printf '%s\n' "$committed"
    g diff --name-only --cached
    g diff --name-only
    g ls-files --others --exclude-standard
  } | sed '/^$/d' | sort -u
)"
[ -n "$changed" ] || exit 0

# Remember which files were already named, separately for each point where CLAUDE.md was updated,
# so switching branches and back does not repeat a reminder.
git_dir="$(g rev-parse --git-dir)" || exit 0
state_dir="$git_dir/claude-md-reminder"
state="$state_dir/${ref:-none}"
new="$(comm -23 <(printf '%s\n' "$changed") <(sort -u "$state" 2>/dev/null))"
[ -n "$new" ] || exit 0
{ mkdir -p "$state_dir" && printf '%s\n' "$changed" >> "$state"; } 2>/dev/null || exit 0

count="$(printf '%s\n' "$new" | wc -l | tr -d ' ')"
# File names go inside JSON, so drop any character that would break it first. JSON must also be
# valid UTF-8. Where iconv exists, a trip through UTF-16 drops just the bytes that break that,
# including some a straight UTF-8 pass keeps. Elsewhere every non-ASCII byte drops out.
utf8() {
  if command -v iconv >/dev/null 2>&1; then
    iconv -f UTF-8 -t UTF-16LE -c 2>/dev/null | iconv -f UTF-16LE -t UTF-8 -c 2>/dev/null
  else
    LC_ALL=C tr -d '\200-\377'
  fi
}
names="$(printf '%s\n' "$new" | head -n 5 | utf8 | tr -d '\000-\011\013-\037"\\' | tr '\n' ' ' | sed 's/ *$//')"
if [ "$count" -gt 5 ]; then names="$names and $((count - 5)) more"; fi

reason="CLAUDE.md reminder. $count file(s) changed after CLAUDE.md last changed: $names. Read the 'Keep this file current' section of CLAUDE.md, and update CLAUDE.md if any of its triggers apply. If a lesson is general, add it to BUILD-RULES.md too. Everything in this repo is public. This reminder asks for edits only. Commit and push only as CLAUDE.md allows, never because of this reminder. If nothing applies, or you stopped to ask Tanya something, say so in one line and stop."

printf '{"decision":"block","reason":"%s"}\n' "$reason"
exit 0
