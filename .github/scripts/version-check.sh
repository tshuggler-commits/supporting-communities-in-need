#!/usr/bin/env bash
# Pull request check: when a file the app loads changes, VERSION in know-your-loan/sw.js changes
# too. Phones keep the old copy of the app until it does (CLAUDE.md, lesson of 2026-11-05).
#
# Reads the changed file names from stdin, one per line. Takes two arguments:
#   1. sw.js as it is on the base branch
#   2. sw.js as it is on this branch
# Each copy must hold exactly one line of the form const VERSION = '...'; or the check fails.
# Files the app does not load do not count:
#   - anything in know-your-loan/docs/ or know-your-loan/test/
#   - know-your-loan/README.md and know-your-loan/NOTICE
#   - know-your-loan/LICENSE and know-your-loan/LICENSE-CONTENT.txt
#
# Run by .github/workflows/app-checks.yml. Tests: bash .github/scripts/version-check.test.sh

# Prints the VERSION in a copy of sw.js. Fails unless the copy holds exactly one VERSION line.
version() {
  [ "$(grep -c "^const VERSION = '[^']*';" "$1" 2>/dev/null)" = 1 ] || return 1
  sed -n "s/^const VERSION = '\([^']*\)';.*/\1/p" "$1"
}

app="$(sed '/^$/d' | grep '^know-your-loan/' |
  grep -Ev '^know-your-loan/(docs|test)/|^know-your-loan/(README\.md|NOTICE|LICENSE|LICENSE-CONTENT\.txt)$')"

if [ -z "$app" ]; then
  echo "No file the app loads changed."
  exit 0
fi

if ! old="$(version "$1")" || ! new="$(version "$2")"; then
  echo "::error title=VERSION not found::Could not read exactly one VERSION in know-your-loan/sw.js, on the base branch or on this one. Keep one line of the form const VERSION = '...';"
  exit 1
fi

if [ "$old" != "$new" ]; then
  echo "VERSION changed from $old to $new."
  exit 0
fi

# File names go on one line, so none of them can start a new workflow command.
names="$(printf '%s\n' "$app" | head -n 10 | tr '\r\n' '  ' | sed 's/ *$//')"
echo "::error title=VERSION did not change::Files the app loads changed ($names), and VERSION in know-your-loan/sw.js is still $new. Change it, so phones fetch the new copy."
exit 1
