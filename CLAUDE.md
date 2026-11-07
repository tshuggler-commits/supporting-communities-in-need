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
  pushes to `main` and blocks deleting it.
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
- [ ] The browser checks pass. Until the browser test is in the repo (see Backlog), check by hand:
  - the page loads with no errors and no missing files
  - the worksheet prints on 2 pages in every language, on both A4 and Letter paper
  - after one visit, the app opens and calculates with the network off
  - the page contacts no other website
  - nothing scrolls sideways at 320 px or 375 px wide
- [ ] Every screen the change touches was screenshotted at phone width and looked at before the push.
- [ ] If a file the app loads changed, `VERSION` in `know-your-loan/sw.js` changed too. A new file is
      also in its `ASSETS` list.
- [ ] Every path the app uses is relative, with no leading `/`. The app lives in a Pages subfolder.
- [ ] No placeholder or draft note is left in the words people read. Both searches print nothing:
      - `grep -rlzE '\[[^]]{3,}\]([^(]|$)' README.md know-your-loan/README.md know-your-loan/NOTICE know-your-loan/docs know-your-loan/locales know-your-loan/index.html`
      - `grep -rlziE 'draft[[:space:]]+for|replace[[:space:]]+this' README.md know-your-loan/README.md know-your-loan/NOTICE know-your-loan/docs know-your-loan/locales know-your-loan/index.html`
- [ ] If a reminder script changed, its tests pass:
      - `bash .claude/hooks/claude-md-reminder.test.sh`
      - `bash .github/scripts/claude-md-check.test.sh`
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
  Claude session to pull request #3 too. Read the description after opening a pull request, and
  remove any link the tool added. The first version stays in the description's edit history until
  Tanya deletes it, so tell her each time.
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

1. **The worksheet prints on 3 pages** (found 2026-11-05). Only English on A4 fits on 2. The fix
   belongs in the print styles in `know-your-loan/css/styles.css`. Keep the writing rows at least
   about 9 mm tall. Then change `VERSION` in `sw.js`.
2. **Spanish and French need review by a native speaker** (2026-11-06), as
   `know-your-loan/docs/TRANSLATING.md` says.
3. **The bottom bar's padding can be 0 on phones without a notch** (2026-11-06).
   `know-your-loan/css/styles.css` line 150 uses `env(safe-area-inset-bottom)` alone.
   `BUILD-RULES.md` asks for `max(8px, env(safe-area-inset-bottom))`. Changing it needs screenshots
   and a new `VERSION`.
4. **No session has tested the live Pages site** (found 2026-11-04).
5. **Large amounts round to whole numbers beside small ones that keep decimals** (found 2026-11-05).
   In Spanish, "1000" received and "100,5" in cost sit beside "1101" paid back. Tanya to decide.
6. **Remove the old copies of the Claude session link from GitHub** (2026-11-06). After `main` was
   rebuilt, the old commits stay readable in these places until GitHub Support removes them:
   - pull requests #1 and #2, including their force-push events
   - the repo's activity log
   - any direct link to an old commit

   The earlier versions of the descriptions of pull requests #1 to #3 also carry the link or an old
   commit ID, in their edit history. Tanya to ask GitHub Support, and to delete those revisions.
7. **Add the check to the ruleset on `main`** (2026-11-06). The ruleset "Protect main" has required
   checks turned on. A read at 10:17 PM ET on 2026-11-06 found its list of checks still empty. Until
   the list names `CLAUDE.md is current`, a red check warns and does not block a merge. In the repo's
   settings, open "Protect main" under Rules. Under "Require status checks to pass", add
   `CLAUDE.md is current` and save. Close this item once a read of the ruleset lists the check. The
   ruleset already asks for a branch to be up to date with `main`, and that takes effect once a check
   is listed.
8. **The browser test is not in the repo** (2026-11-06). It was handed to Tanya on 2026-11-05 as
   `kyl-browser-test.js`. Add it as `know-your-loan/test/browser.test.js` with what it needs to run
   (Playwright).
9. **A check that fails a pull request when an app file changes and `VERSION` in `sw.js` does not**
   (2026-11-06). A rule that lives only in a checklist is easy to skip.
10. **No automatic check reads new text for anything that should not be public** (2026-11-06). Tanya
    to decide.
11. **Limits of the pull request check** (2026-11-06). It sees at most 3,000 changed files. Deleting
    `CLAUDE.md` counts as changing it. A pull request runs its own copy of the check and could
    weaken it. Tanya's review guards against that.
12. **Move `actions/checkout` from v4 to its newest major version** (2026-11-06). GitHub is retiring
    Node.js 20, which v4 was built for. GitHub now runs v4 on Node.js 24 and shows a warning. Confirm
    which version runs on Node.js 24 before the move. Once the check is required, a broken check
    blocks every merge. The change is one line in `.github/workflows/claude-md-check.yml`.
13. **The session hook names files again after `main` is merged into a branch** that has not changed
    `CLAUDE.md` yet (2026-11-06). It is one extra reminder.
14. **A file name that is not valid UTF-8 reaches the hook's reminder as it is** (2026-11-06). A
    strict JSON reader would reject it.
15. **Delete the branch `claude/dazzling-knuth-cfj37t`** once its last pull request merges
    (2026-11-06). Tanya said yes on 2026-11-06.
16. **The pull request check's tests miss one kind of broken check** (2026-11-06). A copy that only
    expands the middle line of a description passes them, because that line holds no `$(...)`. Put
    a `$(...)` on every line of the test's commands. The real check only passes the description to
    `grep`, so nothing is wrong today.
