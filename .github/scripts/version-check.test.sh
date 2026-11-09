#!/usr/bin/env bash
# Tests for version-check.sh. Changes nothing in this repo.
# Usage: bash .github/scripts/version-check.test.sh [path-to-check]
# Prove the tests can fail: point them at a broken copy of the check and watch cases go red.

here="$(cd "$(dirname "$0")" && pwd)"
check="${1:-$here/version-check.sh}"
tmp="$(mktemp -d 2>/dev/null)" || { echo "cannot make a temporary folder"; exit 2; }
trap 'rm -rf "$tmp"' EXIT
pass=0
fail=0

printf "const VERSION = 'kyl-v1';\nconst ASSETS = [];\n" > "$tmp/v1.js"
printf "/* note */\nconst VERSION = 'kyl-v2';\nconst ASSETS = [];\n" > "$tmp/v2.js"
printf "const ASSETS = [];\n" > "$tmp/none.js"
: > "$tmp/empty.js"
printf "/*\nconst VERSION = 'kyl-v2';\n*/\nconst VERSION = 'kyl-v1';\n" > "$tmp/two.js"
printf "const VERSION = \"kyl-v2\";\n" > "$tmp/quotes.js"

# expect NAME WANTED-EXIT FILES BASE-SW HEAD-SW
expect() {
  local out code errors lines
  out="$(printf '%s' "$3" | bash "$check" "$4" "$5" 2>&1)"
  code=$?
  errors="$(printf '%s\n' "$out" | grep -c '^::error ')"
  lines="$(printf '%s\n' "$out" | wc -l | tr -d ' ')"
  # A pass prints no error line. A failure prints exactly one line: an error with no carriage return.
  if [ "$code" = "$2" ] && { { [ "$2" = 0 ] && [ "$errors" = 0 ]; } ||
    { [ "$2" = 1 ] && [ "$errors" = 1 ] && [ "$lines" = 1 ] && ! printf '%s' "$out" | grep -q "$(printf '\r')"; }; }; then
    echo "PASS  $1"; pass=$((pass + 1))
  else
    echo "FAIL  $1 -> exit=$code out=[$out]"; fail=$((fail + 1))
  fi
}

nl='
'
K=know-your-loan
expect "01 no files changed: passes" 0 "" "$tmp/v1.js" "$tmp/v1.js"
expect "02 only files outside the app: passes" 0 "CLAUDE.md${nl}README.md${nl}.github/x.yml${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "03 only files the app does not load: passes" 0 \
  "$K/docs/TRANSLATING.md${nl}$K/test/calc.test.js${nl}$K/README.md${nl}$K/NOTICE${nl}$K/LICENSE${nl}$K/LICENSE-CONTENT.txt${nl}" \
  "$tmp/v1.js" "$tmp/v1.js"
expect "04 styles changed, VERSION the same: fails with one error line" 1 "$K/css/styles.css${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "05 styles changed, VERSION changed: passes" 0 "$K/css/styles.css${nl}" "$tmp/v1.js" "$tmp/v2.js"
expect "06 sw.js itself changed, VERSION the same: fails" 1 "$K/sw.js${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "07 a words file changed, VERSION the same: fails" 1 "$K/locales/es.js${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "08 an app file among others, VERSION the same: fails" 1 "CLAUDE.md${nl}$K/docs/a.md${nl}$K/index.html${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "08b an app file before a file outside the app, VERSION the same: fails" 1 "$K/index.html${nl}CLAUDE.md${nl}" "$tmp/v1.js" "$tmp/v1.js"
many="$(for i in $(seq 1 12); do printf 'docs/n%s.md\n' "$i"; done)"
expect "08c an app file after 12 files outside the app, VERSION the same: fails" 1 "${many}${nl}$K/index.html${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "09 a file named like docs but not in docs/: counts" 1 "$K/docs.html${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "10 a file named like the README but not it: counts" 1 "$K/README.md.bak${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "11 a test folder deeper in the app: counts" 1 "$K/js/test/x.js${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "11b an icon changed: counts" 1 "$K/assets/icon-192.png${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "11c the install file changed: counts" 1 "$K/manifest.webmanifest${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "11d a file named like test, outside test/: counts" 1 "$K/js/test.js${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "12 the base copy of sw.js cannot be read: fails" 1 "$K/index.html${nl}" "$tmp/missing.js" "$tmp/v1.js"
expect "13 an empty base copy of sw.js: fails" 1 "$K/index.html${nl}" "$tmp/empty.js" "$tmp/v2.js"
expect "13b two VERSION lines, one of them in a comment: fails" 1 "$K/index.html${nl}" "$tmp/v1.js" "$tmp/two.js"
expect "13c VERSION in double quotes on this branch: fails" 1 "$K/index.html${nl}" "$tmp/v1.js" "$tmp/quotes.js"
expect "13d VERSION in double quotes on the base branch: fails" 1 "$K/index.html${nl}" "$tmp/quotes.js" "$tmp/v2.js"
expect "14 VERSION missing on this branch: fails" 1 "$K/index.html${nl}" "$tmp/v1.js" "$tmp/none.js"
expect "15 VERSION missing on both: fails" 1 "$K/index.html${nl}" "$tmp/none.js" "$tmp/none.js"
expect "16 VERSION changed back to an older value: passes, since it differs" 0 "$K/app.css${nl}" "$tmp/v2.js" "$tmp/v1.js"
expect "17 names with workflow-command text stay on one error line" 1 \
  "$K/a::warning::x.css${nl}$K/b$(printf '\r')::error::y.css${nl}" "$tmp/v1.js" "$tmp/v1.js"
expect "18 Windows line ends in the file list: still counts" 1 "$K/index.html$(printf '\r')${nl}" "$tmp/v1.js" "$tmp/v1.js"

echo "TOTAL: $pass passed, $fail failed"
[ "$fail" = 0 ]
