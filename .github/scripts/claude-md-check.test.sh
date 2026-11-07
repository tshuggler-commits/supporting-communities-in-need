#!/usr/bin/env bash
# Tests for claude-md-check.sh. Changes nothing in this repo.
# Usage: bash .github/scripts/claude-md-check.test.sh [path-to-check]
# Prove the tests can fail: point them at a broken copy of the check and watch cases go red.

here="$(cd "$(dirname "$0")" && pwd)"
check="${1:-$here/claude-md-check.sh}"
pass=0
fail=0

# expect NAME WANTED-EXIT FILES BODY
expect() {
  local out code
  out="$(printf '%s' "$3" | PR_BODY="$4" bash "$check" 2>&1)"
  code=$?
  if [ "$code" = "$2" ] && { [ "$2" = 0 ] || printf '%s' "$out" | grep -q '^::error '; }; then
    echo "PASS  $1"; pass=$((pass + 1))
  else
    echo "FAIL  $1 -> exit=$code out=[$out]"; fail=$((fail + 1))
  fi
}

nl='
'
# On every path through the check, some description carries commands that would make a marker
# file if anything ran them. Each description that carries commands starts and ends with one.
ran="$(mktemp -d 2>/dev/null)" || { ran="/tmp/claude-md-check-test.$$"; mkdir -p "$ran"; }
[ -d "$ran" ] || { echo "cannot make a marker folder"; exit 2; }
cmds="\$(touch $ran/a) \`touch $ran/b\`${nl}touch $ran/d${nl}\$(touch $ran/c)"

expect "01 no files changed: passes" 0 "" "$cmds"
expect "02 CLAUDE.md among the files: passes" 0 "README.md${nl}CLAUDE.md${nl}" "$cmds"
expect "03 files changed without CLAUDE.md: fails with an error line" 1 "README.md${nl}know-your-loan/sw.js${nl}" "$cmds"
expect "04 a file named CLAUDE.md.bak: still fails" 1 "CLAUDE.md.bak${nl}" ""
expect "05 a file in a folder named CLAUDE.md: still fails" 1 "docs/CLAUDE.md${nl}" ""
expect "06 the description says no update is needed, with a reason: passes" 0 "README.md${nl}" \
  "\$(touch $ran/e) Fixes a typo.${nl}CLAUDE.md: no update needed, only a typo changed. \$(touch $ran/f)${nl}$cmds"
expect "07 the same line in other letter case, Windows line ends: passes" 0 "README.md${nl}" "claude.md: No update needed: typo only.$(printf '\r')"
expect "08 the line with no reason: fails" 1 "README.md${nl}" "CLAUDE.md: no update needed"
expect "09 the words in the middle of a sentence: fails" 1 "README.md${nl}" "I think CLAUDE.md: no update needed here."
expect "10 an empty description: fails" 1 "README.md${nl}" ""
expect "11 a description made only of commands: fails" 1 "README.md${nl}" "$cmds"

if [ -z "$(ls -A "$ran" 2>/dev/null)" ]; then echo "PASS  12 no description ran as code, on any path"; pass=$((pass + 1))
else echo "FAIL  12 a description ran as code: $(ls "$ran" | tr '\n' ' ')"; fail=$((fail + 1)); fi
rm -rf "$ran"

echo "TOTAL: $pass passed, $fail failed"
[ "$fail" = 0 ]
