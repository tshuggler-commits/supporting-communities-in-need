# Acceptance criteria: the "Why this exists" paragraph

Written 2026-11-06 (ET), before the change it describes. Each criterion names its source.

Revised the same day, before this change was first pushed. The review found the ruleset's list of
required checks empty. So source T2 and criterion 5 changed, and criterion 10 is new.

## Sources

- **T1.** Tanya, 2026-11-06 (ET), chose "Use it as written" for this paragraph in
  `know-your-loan/README.md`:

  > **Why this exists.** I was part of the team that launched Quinnipiac's micro-finance venture in
  > Nicaragua. Many of the small business owners we worked with treated the money coming in as money
  > in their pocket, when it was revenue that still had to cover expenses. A loan has the same gap
  > between what you see and what it costs. This calculator makes that cost visible before you sign.

- **T2.** Tanya, 2026-11-06 (ET): *"Done with ruleset"*. GitHub lists `main` as protected. The
  review read the ruleset through GitHub's API. It requires a pull request into `main` with no
  bypass, and it blocks force pushes and deleting `main`. Its required checks are turned on with an
  empty list.
- **C.** `CLAUDE.md` as merged in the second pull request.

## Criteria

1. **(T1)** The "Why this exists" paragraph in `know-your-loan/README.md` reads word for word as in
   T1, on one line like the rest of that file.
2. **(T1, C)** The draft note above that paragraph is gone. Both placeholder searches in the
   `CLAUDE.md` checklist print nothing.
3. **(T1, C)** Nothing else under `know-your-loan/` changes. The app does not load its README, so
   `VERSION` in `sw.js` stays as it is and no screen changes.
4. **(T1, C)** The backlog item about the draft note and the placeholder closes in the same commit.
5. **(T2, C)** `CLAUDE.md` says in place what the ruleset does, as read from GitHub. The backlog
   item about making the check required stays open, reworded to say the check still has to be added
   to the ruleset.
6. **(C)** The other backlog items keep their words and their order. Only their numbers change.
7. **(T1, C)** The paragraph in T1 names Tanya's own past work, and she approved it. Nothing else in
   the change or its commit messages refers to work outside this repo.
8. **(C)** Every new word follows Tanya's writing rules, and words she approved stay as she approved
   them. Every date is Eastern time.
9. **(C)** The change lands by pull request with Tanya as author. The description names the screens
   touched and holds no link the tool added.
10. **(T2, C)** A lesson dated 2026-11-06 (ET) says a protected branch is not proof of a required
    check. `BUILD-RULES.md` gains the general rule.
11. **(C)** An independent reviewer checks the change against these criteria before it is pushed.
