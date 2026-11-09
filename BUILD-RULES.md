# Build rules

General rules for building and checking the tools in this repo. Follow each one, even when it
looks small.

This repo's `CLAUDE.md` wins over this file for anything about this repo.

## Before you build

- **Read the date in Eastern time first.** Records use Eastern time, read off the zone's name
  (`America/New_York`). A remembered offset breaks twice a year.
- **Convert any time read from a file or a log with the zone's name before writing it down.**
- **Commit with `TZ=America/New_York` set**, so commit times are Eastern.
- **Read the live state before you change it.** Take the branch from git and the files as they are.
  A handoff's account of them can be days old.
- **Check what the session can reach before saying something is out of reach.**
- **Branch first, and never commit to `main`.** Bring `main` in with a merge. Never rebase and
  force-push.
- **Write acceptance criteria before code, in their own commit.** Take them from the words of the
  person who asked, and mark each with its source.

## Verification

- **A reviewer who did not write the change checks it.** Hand them the criteria and the repo. Your
  own account of the work passes your blind spots along.
- **Report what reviewers find as they wrote it**, including what contradicts you. Check each finding
  against the code before you act on it.
- **Scale review to the change.** A small fix gets one reviewer. A new feature gets several.
- **Stop when a fresh reviewer finds nothing high or medium.** Put each low finding on a ranked
  backlog. Fix every security finding, whatever its rating.
- **When one area fails review twice, simplify it.** A fix that moves a bug somewhere else is a sign
  the design needs to change.

## What a passing check cannot see

- **Tests and a clean build can pass with the screen broken.** Keep them, and look at the screen too.
- **Screenshot every screen a change touches at phone width, before you push.**
- **Test what is drawn on the screen.** A check that reads code to prove what a screen shows keeps
  missing new shapes of the same bug.
- **Never fix a failing check by loosening it.**
- **Prove each check works.** Break the thing it guards and watch the check fail. A check that could
  not run is recorded as not met.
- **A test checks what it claims.** If it says output is valid, it parses the output.
- **Mark checks that need a real phone for a person to do.** A page that works in a desktop browser
  can still break on an iPhone.
- **A browser test waits for the screen to change** before it checks anything. Every wait has a time
  limit, so a broken app fails quickly in place of hanging. The whole run has a limit too.
- **A privacy check watches the network itself, and says what it cannot see.** Page events miss
  requests from offline code and requests sent as a page closes. Some routes, such as WebRTC, go
  around even the network watch.
- **Check what a page shows, along with how many pages print.** Read each line from the element
  that holds its words, since a row can show while the words inside it are hidden. List the ways
  past it that reviews find, and say there may be more.
- **Test layout in the longest language, on every paper size people use.**
- **On paper people keep, tighten spacing before shrinking text**, and only where the page needs it.

## Changes people can see

- **Name the screens each change touches, and test each one.**
- **Check that every screen on that list still does what it did before.**
- **Design for the fewest taps.** Explain in writing any flow that needs more than one.
- **Every label says what the tap does today.**
- **Every path through the code shows something.** A branch that matches nothing needs a visible
  fallback.

## Records

- **Write records from the log.** Memory drifts.
- **Read a setting back in full before you record it as done.** A summary can call a setting on
  while part of it is still empty.
- **Pick a required check from the list GitHub offers, then read its name back.** A check is
  matched by its exact name, so a typed name one word short blocks every merge.
- **A commit message is a record.** Check it like one, before it reaches `main`. Fixing one later
  means rebuilding `main`.
- **Read a pull request's description on GitHub after opening it.** A tool can add text you did not
  write. Removing it leaves the first version in the edit history, so tell the repo's owner.
- **An earlier commit stays readable after a later fix.** Before a branch is first pushed, rebuild it
  so no commit holds what should not be published.
- **Correct a wrong record in the same commit that finds the error**, and say what was wrong.
- **A rule stated in one place is usually stated in several.** Find every copy before you change one.
- **Search for leftover placeholders as any bracketed text that is not a link**, across line breaks.
  Search for draft notes too.
- **Log backlog the moment it is said**, even when it is out of scope.
- **Review the goal at every milestone.** Write the purpose in one sentence, then check the work
  against it.

## Offline apps

- **Change the cache version whenever a file the app loads changes.** Phones keep the old copy until
  it does.
- **List every file the app needs in the offline cache**, then test with the network off.
- **Reload only when a new version takes over.** The first visit is also a takeover, so reloading on
  every one reloads the first visit too.
- **Keep pinch-zoom on.** Never add `maximum-scale` or `user-scalable=no` to the viewport tag.
- **Install checks need a normal browser profile.** Private windows never offer install.

## Phones and accessibility

- **Tap targets need 44 px of width as well as height.**
- **Form fields use at least 16 px text.** Smaller text makes iPhones zoom on focus.
- **Measure each element's box.** A page that hides overflow can pass a sideways-scroll check with
  content cut off. Compare each box with the screen's real width, since a phone's browser widens
  the page to fit what is too wide.
- **Measure behind tabs and inside sheets too.**
- **Browser storage can be blocked.** Back anything stored there with an in-page flag.
- **Bottom padding uses `max(8px, env(safe-area-inset-bottom))`.** The inset is 0 on a phone without
  a notch.
- **Leave room under the page for a fixed bottom bar at its tallest.** Labels can wrap on a narrow
  phone and make the bar taller.

## Dependencies

- **Sort security alerts by what runs in production.** Build and test tools are not shipped.
- **Fix within range first** (`npm audit fix`, never `--force`), then prove nothing on screen moved.
- **Read a dependency's newest version from its own tags or registry.** Search summaries disagree.

## Shell and CI

- **A pipe returns its last command's exit code.** Capture the code before you pipe.
- **Chain a push after its checks with `&&`**, so a failing check stops the push.
- **Pin the CI runner image when a browser install depends on it.**
- **Keep shell scripts LF.** A Windows checkout with CRLF breaks bash. `.gitattributes` handles it.

## Writing

These apply to every word an app shows and to everything written for Tanya:

- no em dashes
- no rhetorical questions
- no negative-then-positive framing
- no comma-separated lists of three
- lead with the opportunity
- plain words

Unclear copy usually has too many words, so cut. A writing check reads whole sentences, across line
breaks.

## Keeping this file true

- Add a rule here when it is general, in the same commit as the change that taught it.
- Write it in general terms, with no names. Leave out the details of the incident behind it.
- When a rule changes, edit it in place. Never keep two versions.
