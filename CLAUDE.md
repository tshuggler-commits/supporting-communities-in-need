# Instructions for Claude Code in this repo

Every Claude Code session in this repo reads this file before it changes anything. Tanya owns the
repo and decides everything in it.

## What this repo is

- A public GitHub repo of free tools for people in underserved communities. Each tool has its own
  folder.
- `know-your-loan/` shows what a loan really costs. It works offline in three languages. It also
  prints a paper worksheet. GitHub Pages serves it from `main` at
  https://tshuggler-commits.github.io/supporting-communities-in-need/know-your-loan/
- Code is under the PolyForm Noncommercial License. Words and pictures are under CC BY-NC-SA 4.0.
  `know-your-loan/NOTICE` says which files fall under which.

## Start every session here

1. Read the Eastern date: `TZ=America/New_York date`. The session's machine keeps UTC. Every date you
   write comes from that line and is marked ET.
2. `git fetch`, then `git status -sb`. Read the branch from git. Never trust a handoff about it.
3. Read this file and `BUILD-RULES.md`. Then read `know-your-loan/README.md` and
   `know-your-loan/docs/`.
4. Check `git config author.name` and `git config author.email`. If either is empty, set the author
   as the rules below say.
5. Branch before you change anything.

## Rules for this repo

- **Everything here is public, and it is only about this repo** (Tanya, 2026-11-06 ET). Keep out of
  every file and every commit message:
  - the name of anyone other than Tanya
  - anything about work outside this repo
  - file paths from anyone's computer
  - the account name of any person other than Tanya, and any key

  `BUILD-RULES.md` holds the general build rules.
- **Work lands by pull request, and Tanya merges every one.** Never commit to `main`, and never merge
  a pull request. To bring `main` into a branch, use `git merge`. Never rebase and force-push. Push
  with the branch named: `git push -u origin <branch>`. Since 2026-11-06 (ET), a ruleset named
  "Protect main" requires a pull request into `main`, and no one can bypass it. It also blocks force
  pushes to `main` and blocks deleting it. A read of its rules at 8:27 PM (ET) on 2026-11-08 found
  these required checks, each tied to GitHub Actions:
  - `CLAUDE.md is current`
  - `VERSION changes with the app`
  - `App works in a browser`

  The same read found that a branch must be up to date with `main` before it merges.
- **Ask Tanya before anything reaches `main` or changes repo settings.** That holds even when an
  automatic hook says to commit and push.
- **Tanya is the author of every commit, merges included** (her choice, 2026-11-06 ET). Set it once
  in each clone, and leave `user.name` and `user.email` as they are:
  - `git config author.name "Tanya S. Huggler"`
  - `git config author.email "232274564+tshuggler-commits@users.noreply.github.com"`

  Commit with `TZ=America/New_York` set, so the commit time is Eastern. In a cloud session the
  committer stays the session's own identity (Tanya's choice, 2026-11-06 ET).
  GitHub shows a signed commit as Verified only when the signing key belongs to the committer, and
  the session's key belongs to Claude.
- **Never edit `know-your-loan/LICENSE` or `know-your-loan/LICENSE-CONTENT.txt`.** They are
  official license texts and stay word for word.
- **The words are Tanya's.** Show her any wording change before you make it. Her words are in:
  - `know-your-loan/locales/`
  - `know-your-loan/docs/`
  - every README
- **Her writing rules apply to every word written here**, commit messages included:
  - no em dashes
  - no rhetorical questions
  - no negative-then-positive framing
  - no comma-separated lists of three
  - lead with the opportunity
  - plain words
- **Name the screens each change touches**, by the names people see. Test each one. The screens are:
  - Calculate
  - Warning signs
  - Paper worksheet
  - the printed worksheet
- **Verification is independent.** A reviewer who did not write the change checks it against written
  criteria before it is pushed. A new feature gets more than one reviewer.

## Checklist before every push

A push may go ahead while a check that already fails on `main` is on the Backlog, as long as the
change leaves it no worse. The pull request says so.

- [ ] Acceptance criteria came first in their own commit. Each one names its source.
- [ ] `node --test test/calc.test.js` passes inside `know-your-loan/` (11 tests as of 2026-11-06 ET).
- [ ] The browser test passes: `node know-your-loan/test/browser.test.js` from the repo root. The
      first time, run `npm ci` and then `npx playwright install chromium`. The "App checks" workflow
      runs it on every pull request too. Among its checks:
  - the page loads with no errors and no missing files
  - the worksheet prints on 2 pages in every language, on both A4 and Letter paper
  - after one visit, the app opens and calculates with the network off
  - the page makes no ordinary web request to another site. The backlog lists the routes this
    cannot see.
  - nothing runs past the screen at 320 px and three wider phone widths up to 393 px, measured
    against the screen's real width
- [ ] Every screen the change touches was screenshotted at phone width and looked at before the push.
- [ ] If a file the app loads changed, `VERSION` in `know-your-loan/sw.js` changed too. The "App
      checks" workflow fails a pull request otherwise. A new file is also in its `ASSETS` list.
- [ ] Every path the app uses is relative, with no leading `/`. The app lives in a Pages subfolder.
- [ ] No placeholder or draft note is left in the words people read. Both searches print nothing:
      - `grep -rlzE '\[[^]]{3,}\]([^(]|$)' README.md know-your-loan/README.md know-your-loan/NOTICE know-your-loan/docs know-your-loan/locales know-your-loan/index.html`
      - `grep -rlziE 'draft[[:space:]]+for|replace[[:space:]]+this' README.md know-your-loan/README.md know-your-loan/NOTICE know-your-loan/docs know-your-loan/locales know-your-loan/index.html`
- [ ] If a reminder or check script changed, its tests pass:
      - `bash .claude/hooks/claude-md-reminder.test.sh`
      - `bash .github/scripts/claude-md-check.test.sh`
      - `bash .github/scripts/version-check.test.sh`
- [ ] Nothing in the change is about work outside this repo, commit messages included.
- [ ] `git log --format='%an <%ae>' origin/main..HEAD` shows only Tanya as author.
- [ ] The pull request names every screen the change touches. It says how each one was checked.
- [ ] The pull request quotes what the reviewer found.
- [ ] Once the pull request is open, its description on GitHub holds no link the tool added. On a
      branch's first push, check this right after opening the pull request. If a link was removed,
      tell Tanya, so she can delete the first version from the edit history.
- [ ] This file is current (next section).

## Keep this file current

Tanya, 2026-11-06 (ET): *"Make sure it is getting updated as changes are made."*

- Update this file in the same commit as any change that does one of these:
  - teaches a lesson worth keeping
  - changes how the project is built or tested
  - changes how the project is published
  - opens or closes a backlog item
- Add a lesson the moment it is understood. Say what happened and why. Then write the rule it gives,
  dated in ET.
- When a rule here changes, edit it in place and say what changed. Never keep two versions.
- If a lesson is general, add it to `BUILD-RULES.md` too.
- **Two reminders keep this file current.** Tanya chose both on 2026-11-06 (ET).
  - **While work happens:** `.claude/settings.json` runs `.claude/hooks/claude-md-reminder.sh` when
    a session stops. It names each file that changed after this file last changed, and asks for an
    update. It names a file only once. Update this file, or say in one line why nothing applies. It
    cannot loop, and it never asks for a commit.
  - **Before a merge:** `.github/workflows/claude-md-check.yml` fails a pull request that changes
    files without changing this file. When nothing applies, add a line to the pull request
    description that starts with `CLAUDE.md: no update needed` and gives the reason.

## Lessons from this repo

Newest first. Dates are ET.

- **2026-11-08. The longest name the box takes pushed the buttons off the screen.** The backlog said
  a saved name ran 17 px past a 320 px screen in French, with a wider font. A measurement with the
  longest name the box takes, one word of 40 letters, found Open and Delete pushed off the screen at
  every phone width in all three languages. It did so with both fonts tried. A row keeps its text at
  least as wide as its longest word, so one long word pushed the buttons out. A review found more.
  In French at 320 px with the default font, a one-word name such as "Cooperativa" pushed the
  buttons past the end of the row and into the page margin, where a check against the screen's edge
  cannot see it. The browser test now checks that the buttons stay inside the row. The buttons
  now move under the name when its longest word cannot fit beside them, and a word wider than the
  row breaks. Test each text box with the longest input it takes, written as one word.
- **2026-11-08. A required check is matched by its exact name.** Tanya added the two new checks to
  "Protect main". Read back, one was listed as "app works in browser", while the job reports
  "App works in a browser". GitHub waits for a check with the listed name, so every pull request
  would have waited for a check that never comes. Tanya fixed the name, and a second read showed
  all three exact, each tied to GitHub Actions. Pick each required check from the list GitHub
  offers, then read the names back.
- **2026-11-08. A privacy check claims only the routes it covers.** Each review of the privacy
  check found a new way past it. First a copy whose offline code phoned out passed. Then a copy that
  sent a beacon as each page closed passed, and then a copy that used WebRTC. Each fix closed the
  routes found, and the next review found another, because the ways to reach the network have no
  end. So the check now covers ordinary web traffic, through a stand-in that refuses it and writes it
  down. A small script in each page the test opens reports links that open a connection early. The
  backlog lists the routes it cannot see, and code review covers those. Claim only what a check
  covers.
- **2026-11-08. A print check claims only what it reads.** A review made the calculator print in
  place of the worksheet, and the 2-page check still passed. A later review hid every question
  inside rows that still showed, and the first text check passed too. The test now reads each line
  of the worksheet from the element that holds its words, in the chosen language. Then a review
  spoiled the printout in nine more ways, such as text drawn at zero size, and the check passed
  them all. Each fix closed the ways found, and the next review found more, because the ways to
  change what prints have no end, and the page the test reads is not the paper that prints. So the
  check claims only what it reads, and the backlog lists the ways past it that reviews found. Check
  what is on the page as well as how many pages there are, and claim only what the check reads.
- **2026-11-08. A test could hang for hours.** With broken offline code, the browser test waited
  for it forever, and the workflow had no time limit, so a run could last 6 hours. The test now
  gives the offline code 15 seconds, and every job stops after 10 minutes. A later review found a
  wait inside a page with no limit of its own, so the whole run now stops after 5 minutes and
  fails. Give every wait a limit, and give the whole run one too.
- **2026-11-08. Search results disagreed on a version.** Asked for the newest `actions/checkout`, a
  web search named v5 and v7, each from a different summary. The project's own tags settled it:
  v7.0.1, which runs on Node.js 24. Read a dependency's newest version from its tags or its
  registry, never from a search summary.
- **2026-11-08. Smaller print cost readability for no gain.** To fit the worksheet on 2 pages, a
  draft shrank both printed checklists to 14 px text, though only page 1 was too long. A review
  found that page 2 was less than half full. Tighter spacing on page 1 alone was enough. On paper
  people keep, tighten spacing before shrinking text, and only where the page needs it.
- **2026-11-08. A phone's page grows to fit what is too wide.** The session's first check compared
  the page's width with itself. A phone's browser widens the page to fit wide content, so the check
  read 0 while Calculate scrolled sideways at 320 px on `main`. Measured against the screen's real
  width, it scrolled 13 px in Spanish and 18 px in French with the form empty. With any period
  between payments other than 1, it scrolled up to 28 px, English included. The browser test then
  measured the same way and checked phones only at 393 px, so it would have missed this too. Since
  2026-11-08 it measures every box, at four phone widths. Measure every box against the screen's
  real width.
- **2026-11-08. A taller bar overlapped the last button.** The bottom bar gained 8 px of padding and
  grew to 86 px at 320 px, where a label wraps onto two lines. The page kept only 84 px under its
  content, so the bar covered about 2 px of the Clear button's padding on Warning signs. A
  measurement caught it before the push. Leave room under the page for a fixed bar at its tallest.
- **2026-11-06. A protected branch is not proof of a required check.** After Tanya saved the ruleset
  for `main`, GitHub listed `main` as protected. The session took that as proof the check was
  required. The review read the ruleset itself. Its required checks were turned on with an empty
  list, so a red check still could not block a merge. Read a setting back in full before recording
  it as done.
- **2026-11-06. A link in an old commit message meant rebuilding `main`.** At Tanya's word, the link
  to the Claude session came out of the first Know Your Loan commit, and she became its author. Every
  commit on `main` after the first was rebuilt, and `main` was replaced on GitHub. The branch of the
  open pull request was replaced the same way. Those two pushes were the one exception to the rule
  against force-pushing. Each rebuilt commit kept its files and the moment it was made. The rebuilt
  merge commit shows Claude as committer in place of GitHub. Old copies stay readable on GitHub until
  GitHub Support removes them. Read every commit message before it reaches `main`.
- **2026-11-06. The tool that opens a pull request can add to its description.** The first pull
  request's closing line was replaced with a footer that linked back to the Claude session. The
  session saw it only by reading the description on GitHub. A tool added a footer with a link to the
  Claude session to pull requests #3 to #6 too. Read the description after opening a pull request,
  and remove any link the tool added. The first version stays in the description's edit history
  until Tanya deletes it, so tell her each time.
- **2026-11-06. Commit times follow the machine's clock.** The cloud session keeps UTC, so commits
  were stamped +0000 and would show the next day's date every evening. Commit with
  `TZ=America/New_York` set.
- **2026-11-06. A date read off a file is UTC too.** The backlog first said the browser test was
  handed over on 2026-11-06. The file says 9:43 PM ET on 2026-11-05, which was already the 6th in
  UTC. Convert every time with the zone's name before writing it.
- **2026-11-06. A commit has an author and a committer.** Setting both to Tanya would have made GitHub
  mark the commits Unverified, because the session's signing key belongs to Claude. The session's
  commit check caught it before the push. Tanya stays the author, and the session stays the
  committer. A merge commit takes the author from `author.name`, so that setting covers merges.
- **2026-11-06. An earlier commit stays readable after a later fix.** Text removed by the fix stays
  in the commit before it, and a pull request shows every commit. A review caught this before the
  first push. Before a branch is pushed, rebuild it so no commit holds what should not be published.
- **2026-11-06. When a reminder keeps failing review, simplify it.** The first reminder hook tracked
  file contents across commits and branches. Two reviews each found new gaps. The simpler hook names
  each file once until this file changes.
- **2026-11-06. Tests have to check what they claim.** The first hook tests called output valid JSON
  after only stripping some characters, and five broken copies of the hook passed them. The tests now
  parse the JSON. Make each check fail once on purpose before trusting it.
- **2026-11-06. A check that cannot run proves nothing.** A search for dashes failed on its own
  pattern, and the session read the silence as a pass.
- **2026-11-06. A placeholder search has to look for any bracketed text, across line breaks.** On
  2026-11-04 the session searched for brackets holding only letters and spaces. A draft note in
  `know-your-loan/README.md` got past it and went public. So did a bracketed placeholder.
- **2026-11-06. A writing check has to read whole sentences.** The first one looked at single lines
  and only for lists with a comma before "and". Lists in Tanya's style have no such comma, and some
  wrap onto a second line.
- **2026-11-06. Check what a session can reach before saying it can't.** A session told Tanya
  something was out of reach without checking.
- **2026-11-05. Testing only the math missed a printing defect.** All 11 math
  tests passed while the worksheet printed on 3 pages instead of 2. Test the page itself.
- **2026-11-05. Translations run longer than English.** Spanish and French pushed the worksheet
  onto a third page even on A4, where English fit. Test layout in the longest language. Letter paper
  is standard in Nicaragua and much of the Americas, and A4 almost everywhere else.
- **2026-11-05. A browser test has to wait for the screen.** The bottom menu switches tabs a moment
  after a tap, once the page address changes. A test that checked at once called a working button
  broken.
- **2026-11-05. Phones keep the old copy of the app.** The offline cache holds every file until
  `VERSION` in `sw.js` changes. Change it with any change to a file the app loads.
- **2026-11-04. One placeholder had two wordings.** `NOTICE` and the root README asked for the same
  contact in different words. Search for every form before you commit.
- **2026-11-04. A commit went straight to `main`.** The first Know Your Loan commit (2026-11-04,
  9:32 PM ET) followed the first request before this file existed. It was authored as "Claude", and
  its message ended with a link to the Claude session. Branch first, and check the author and the
  message before committing.
- **2026-11-04. An automatic hook asked for a commit before Tanya's OK.** The session waited for her
  answer, which was right.
- **2026-11-04. A cloud session could not reach the live site.** Testing it needs
  `tshuggler-commits.github.io` in the environment's allowed domains.

## Backlog

Ranked by what each item costs the people who use the app, then Tanya, highest first. Remove an item
in the same commit that closes it. Dates are ET.

1. **Spanish and French need review by a native speaker** (2026-11-06), as
   `know-your-loan/docs/TRANSLATING.md` says.
2. **No session has tested the live Pages site** (found 2026-11-04).
3. **No session has printed the worksheet from Safari or Firefox** (2026-11-08). Every print
   check so far used Chromium. Print it once from an iPhone and once from Firefox, on A4 and Letter
   paper. On the iPhone and in Firefox, also save one offer with a short name and one named with a
   single word of about 40 letters. The short one should keep its buttons beside it, and the long
   one should have them underneath. Only Chromium has drawn that layout.
4. **A large amount still scrolls sideways at 320 px** (found 2026-11-08). Result amounts can run
   past the screen. 5,000,000 with the money named "guaraníes" runs 7 px past in Spanish.
   Nine-digit totals run up to 34 px past in Spanish and 26 px in French. In English they run 3 px
   past. The money name box takes 12 letters, and a long name runs further. With
   "WWWWWWWWWWWW" and an amount of 1000, the page ran 84 to 116 px past with the default font.
5. **Large text crowds the header and the bottom bar** (2026-11-08). In a browser test with text at
   130% to 150%, the language menu ran 2 to 38 px past the screen at 320 px on all three screens.
   The bottom bar covered 3 to 10 px of the last item. A label that wraps also makes the bar
   taller, so its height changes from one screen to the next, while the page leaves a fixed 92 px
   under its content. It needs a check on a phone with large text turned on.
6. **Large amounts round to whole numbers beside small ones that keep decimals** (found 2026-11-05).
   In Spanish, "1000" received and "100,5" in cost sit beside "1101" paid back. Tanya to decide.
7. **Remove the old copies of the Claude session link from GitHub** (2026-11-06). After `main` was
   rebuilt, the old commits stay readable in these places until GitHub Support removes them:
   - pull requests #1 and #2, including their force-push events
   - the repo's activity log
   - any direct link to an old commit

   The earlier versions of the descriptions of pull requests #1 to #6 also carry the link or an old
   commit ID, in their edit history. Tanya to ask GitHub Support, and to delete those revisions.
8. **`know-your-loan/README.md` describes only the math tests** (2026-11-08). Its "Run the tests"
   section and its line for `test/` predate the browser test. Those are Tanya's words, so new
   wording waits for her.
9. **No automatic check reads new text for anything that should not be public** (2026-11-06). Tanya
   to decide.
10. **Routes the privacy check cannot see** (2026-11-08). The browser test catches ordinary web
    traffic to another site and links that open a connection early. Reviews showed it misses:
    - WebRTC, which can reach a server directly
    - background sync, in a full browser
    - a link inside a shadow root
    - anything that happens after a tap on Print, or later than the test waits
    - speculation rules, which Chromium skips while the stand-in is set
    - a link that opens a connection early, in a blank window the app opens itself

    Code review covers these. Tanya to decide whether CI should block all outside traffic as well.
11. **Limits of the pull request checks** (2026-11-06). The CLAUDE.md check sees at most 3,000
    changed files, and deleting `CLAUDE.md` counts as changing it. A pull request runs its own copy
    of each check and could weaken it. Tanya's review guards against that. Two pull requests that
    each move `VERSION` to the same new value can each pass on their own, and the second would then
    ship with no new `VERSION`. Since 2026-11-08 the VERSION check is required, and the ruleset makes
    a branch bring in `main` before it merges, so the second should then fail. No pull request has
    tested that yet.
12. **Browser test follow-ups** (2026-11-08), from its reviews:
    - keep the screenshots and PDFs from a failed run in CI, so the failure can be seen
    - measure text that runs past its own box. Today the fixed bar widening with the page shows it.
    - page 1 of the printed worksheet has about 38 px (10 mm) to spare on Letter in Spanish and
    French, measured by adding space before page 2 until a third page printed
    - the print check reads the page, not the PDF. Reviews found these ways past it, and there are
    likely more:
      - text drawn too small to read, or squeezed flat
      - a filter or a cover that hides the whole worksheet
      - text added by styles
      - text added inside the worksheet
      - text in a form field or a frame
      - text in a shadow root
      - a picture set as a background
      - a picture in an element other than `img` or `svg`, such as a canvas
      - text placed straight in the page's body
      - text that spills out of a box with no height
      - tick boxes or writing spaces with no border
      - text clipped or moved off the page
      - text the same color as the paper
    - the PDF can differ from the page the test read. Making it fires the print event a second
    time, and a change made a moment after the test reads the page prints too.
    - comparing a picture of each printed page with a saved one would catch most of the print
    gaps above. Tanya to decide.
    - when a tap is blocked or a page never answers, the test stops before the later checks
    report. It still fails.
    - against a server that sends cache headers, such as the live site, the offline checks can pass
    with offline code that saves the files but answers no requests. The test's own server sends
    no cache headers, so it catches that.
    - the VERSION check counts two files the app does not load:
    `know-your-loan/assets/icon-maskable.svg` and `know-your-loan/.gitignore`
13. **The session hook names files again after `main` is merged into a branch** that has not changed
    `CLAUDE.md` yet (2026-11-06). It is one extra reminder.
14. **Delete the branch `claude/dazzling-knuth-cfj37t`** once its last pull request merges
    (2026-11-06). Tanya said yes on 2026-11-06.
