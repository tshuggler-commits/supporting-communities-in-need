#!/usr/bin/env bash
# Tests for claude-md-reminder.sh. It builds throwaway repos in a temporary folder and changes
# nothing in this repo. It needs node or python3 to check that the output is valid JSON.
# Usage: bash .claude/hooks/claude-md-reminder.test.sh [path-to-hook]
# Prove the tests can fail: point them at a broken copy of the hook and watch cases go red.

here="$(cd "$(dirname "$0")" && pwd)"
hook="${1:-$here/claude-md-reminder.sh}"
tmp="$(mktemp -d 2>/dev/null)" || { echo "cannot make a temporary folder"; exit 2; }
trap 'rm -rf "$tmp"' EXIT
pass=0
fail=0

# Both readers refuse bytes that are not valid UTF-8, as a strict JSON reader does.
if command -v node >/dev/null 2>&1; then
  valid_json() { node -e 'JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(require("fs").readFileSync(0)))' 2>/dev/null; }
elif command -v python3 >/dev/null 2>&1; then
  valid_json() { python3 -c 'import json,sys; json.loads(sys.stdin.buffer.read().decode("utf-8"))' 2>/dev/null; }
else
  echo "needs node or python3 to check JSON"; exit 2
fi

g() { git -c user.name=test -c user.email=test@example.com -c init.defaultBranch=main "$@"; }

# run DIR JSON: runs the hook and keeps what it printed along with its exit code.
run() {
  out="$(printf '%s' "$2" | CLAUDE_PROJECT_DIR="$1" bash "$hook" 2>"$tmp/err")"
  code=$?
  err="$(cat "$tmp/err")"
}
ok() { echo "PASS  $1"; pass=$((pass + 1)); }
bad() { echo "FAIL  $1 -> exit=$code out=[$out] err=[$err]"; fail=$((fail + 1)); }
quiet() { run "$2" "$3"; if [ "$code" = 0 ] && [ -z "$out" ] && [ -z "$err" ]; then ok "$1"; else bad "$1"; fi; }
# blocks NAME DIR JSON [TEXT THE REASON MUST CONTAIN] [TEXT IT MUST NOT CONTAIN]
blocks() {
  run "$2" "$3"
  local reason=""
  if [ "$code" = 0 ] && [ -z "$err" ] && printf '%s' "$out" | valid_json; then
    reason="$(printf '%s' "$out" | sed -n 's/^{"decision":"block","reason":"\(CLAUDE.md reminder.*\)"}$/\1/p')"
  fi
  if [ -n "$reason" ] && { [ -z "$4" ] || printf '%s' "$reason" | grep -qF -- "$4"; } &&
    { [ -z "$5" ] || ! printf '%s' "$reason" | grep -qF -- "$5"; }; then
    ok "$1"
  else
    bad "$1"
  fi
}

# A repo with main on a remote, and a work branch, like a real clone.
g init -q "$tmp/seed" && echo "start" > "$tmp/seed/README.md" && echo "keep" > "$tmp/seed/old.txt" &&
  g -C "$tmp/seed" add -A && g -C "$tmp/seed" commit -qm "start" &&
  git clone -q "$tmp/seed" "$tmp/r" && g -C "$tmp/r" checkout -q -b work || { echo "setup failed"; exit 2; }
R="$tmp/r"

quiet  "01 nothing changed: quiet" "$R" '{}'
echo "a" > "$R/notes.txt"
quiet  "02 continuing from a Stop hook, compact JSON as Claude Code sends it: quiet" "$R" '{"session_id":"x","stop_hook_active":true}'
quiet  "03 continuing from a Stop hook, spaced JSON: quiet" "$R" '{"stop_hook_active" : true}'
blocks "04 a new file, not continuing: blocks with a count of 1 and its name" "$R" '{"stop_hook_active":false}' "1 file(s) changed after CLAUDE.md last changed: notes.txt."
quiet  "05 asked again with nothing new: quiet" "$R" '{}'
echo "b" >> "$R/notes.txt"
quiet  "06 another edit to a file already named: quiet" "$R" '{}'
g -C "$R" add -A && g -C "$R" commit -qm "notes"
quiet  "07 committing it: quiet" "$R" '{}'
echo "ignored.txt" >> "$R/.git/info/exclude" && echo "i" > "$R/ignored.txt"
quiet  "07b a file git is told to ignore: quiet" "$R" '{}'
echo "ignored2.txt" > "$R/.gitignore" && echo "i" > "$R/ignored2.txt"
blocks "07c a file listed in .gitignore: only .gitignore itself is named" "$R" '{}' ".gitignore" "ignored2.txt"
echo "c" > "$R/second.txt"
blocks "08 a second new file: blocks and names only that one" "$R" '{}' "second.txt" "notes.txt"
echo "# rules" > "$R/CLAUDE.md"
quiet  "09 CLAUDE.md being written, not committed: quiet" "$R" '{}'
g -C "$R" add -A && g -C "$R" commit -qm "add CLAUDE.md"
quiet  "10 everything committed with CLAUDE.md: quiet" "$R" '{}'
echo "more rules" >> "$R/CLAUDE.md"
echo "x" >> "$R/README.md"
quiet  "11 an unstaged edit to a committed CLAUDE.md: quiet" "$R" '{}'
git -C "$R" checkout -q -- CLAUDE.md
blocks "12 after that edit is undone, the change waiting beside it: blocks" "$R" '{}' "README.md"
g -C "$R" add -A && g -C "$R" commit -qm "readme"
g -C "$R" rm -q old.txt
blocks "13 deleting a file: blocks and names it" "$R" '{}' "old.txt"
g -C "$R" commit -qm "remove old"

echo "from main" > "$tmp/seed/main-only.txt" && g -C "$tmp/seed" add -A && g -C "$tmp/seed" commit -qm "main work"
g -C "$R" fetch -q && g -C "$R" merge -q --no-edit origin/main
quiet  "14 merging main's own files into the branch: quiet" "$R" '{}'

echo "# main rules" > "$tmp/seed/CLAUDE.md" && g -C "$tmp/seed" add -A && g -C "$tmp/seed" commit -qm "main rules"
g -C "$R" fetch -q && g -C "$R" checkout -q -b second origin/main
echo "y" >> "$R/README.md"
blocks "15 a branch from a main that already has CLAUDE.md: a change blocks" "$R" '{}' "README.md"
g -C "$R" checkout -q -- README.md && g -C "$R" checkout -q work
quiet  "16 back on the first branch, nothing new: quiet" "$R" '{}'
g -C "$R" checkout -q second && echo "y" >> "$R/README.md"
quiet  "17 back on the second branch with the same change: quiet (no repeat)" "$R" '{}'

echo "x" > "$R/CLAUDE_md"
blocks "18 a file named CLAUDE_md: still blocks" "$R" '{}' "CLAUDE_md"
printf 'q' > "$R/we\"ird\\na	me.txt"
blocks "19 a name with special characters: valid JSON" "$R" '{}' "weird"
printf 'q' > "$R/guía.md"
# Without iconv the hook drops every non-ASCII byte, accents included.
if command -v iconv >/dev/null 2>&1; then shown="guía.md"; else shown="gua.md"; fi
blocks "20 a name with an accent: blocks and shows the name, with its accent where iconv exists" "$R" '{}' "$shown"
printf 'q' > "$R/$(printf 'bad\377name.txt')"
blocks "20b a name that is not valid UTF-8: valid JSON, with the rest of the name kept" "$R" '{}' "badname.txt"
printf 'q' > "$R/$(printf 'past\364\220\200\200max.txt')"
blocks "20c a name with a code above the Unicode range: valid JSON" "$R" '{}' "pastmax.txt"
printf 'q' > "$R/$(printf 'five\370\210\200\200\200bytes.txt')"
blocks "20d a name with a five-byte sequence: valid JSON" "$R" '{}' "fivebytes.txt"
printf 'q' > "$R/aa-good.txt" && printf 'q' > "$R/$(printf 'zz\377second.txt')"
blocks "20e two new names, the second not valid UTF-8: valid JSON, both named" "$R" '{}' "aa-good.txt zzsecond.txt"
printf 'q' > "$R/$(printf 'ab\377first.txt')" && printf 'q' > "$R/ac-good.txt"
blocks "20f two new names, the first not valid UTF-8: valid JSON, both named" "$R" '{}' "abfirst.txt ac-good.txt"
quiet  "21 no input at all, nothing new: quiet" "$R" ''
mv "$R/.git/claude-md-reminder" "$R/.git/state-saved" && touch "$R/.git/claude-md-reminder" && echo "z" > "$R/new.txt"
quiet  "22 the state cannot be written: quiet, and nothing on stderr" "$R" '{}'
rm -f "$R/.git/claude-md-reminder" "$R/new.txt" && mv "$R/.git/state-saved" "$R/.git/claude-md-reminder"
quiet  "23 not a git repo: quiet" "$tmp" '{}'
quiet  "24 the project folder is missing: quiet" "$tmp/missing" '{}'

g init -q "$tmp/fresh" && echo "a" > "$tmp/fresh/a.txt"
blocks "25 a new repo with no commits: a new file blocks" "$tmp/fresh" '{}' "a.txt"
g init -q "$tmp/fresh2" && echo "a" > "$tmp/fresh2/a.txt" && echo "r" > "$tmp/fresh2/CLAUDE.md" && g -C "$tmp/fresh2" add -A
quiet  "26 a new repo with CLAUDE.md staged: quiet" "$tmp/fresh2" '{}'

mkdir "$R/many" && for i in $(seq 1 2000); do echo "$i" > "$R/many/f$i.txt"; done
start=$(date +%s)
blocks "27 2,000 new files: blocks and says how many are not named" "$R" '{}' "and 1995 more"
secs=$(($(date +%s) - start))
named="$(printf '%s' "$out" | grep -o 'many/f[0-9]*\.txt' | wc -l | tr -d ' ')"
if printf '%s' "$out" | grep -qF '2000 file(s) changed' && [ "$named" = 5 ]; then
  ok "27b it counts all 2,000 and names exactly 5"
else
  code=0; err=""; bad "27b it counts all 2,000 and names exactly 5 (named $named)"
fi
code=0; out=""; err=""
if [ "$secs" -le 10 ]; then ok "28 2,000 new files take ${secs}s (limit 10s)"; else bad "28 2,000 new files take ${secs}s (limit 10s)"; fi

echo "TOTAL: $pass passed, $fail failed"
[ "$fail" = 0 ]
