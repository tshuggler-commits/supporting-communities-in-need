# Acceptance criteria: the required checks, read back

Written 2026-11-08 (ET), before the change it describes. Each criterion names its source.

## Sources

- **T1.** Tanya, 2026-11-08 (ET): *"Done, both checks added to the ruleset"*. A read of the rules on
  `main` at 8:25 PM (ET) listed the third check as "app works in browser", which no job reports.
- **T2.** Tanya, 2026-11-08 (ET): *"Done, fixed the browser check name"*.
- **R.** The read of the rules on `main` through GitHub's public API at 8:27 PM (ET). Its strict
  setting was on, so a branch must be up to date with `main`. It listed these required checks, each
  tied to GitHub Actions:
  - `CLAUDE.md is current`
  - `VERSION changes with the app`
  - `App works in a browser`
- **T3.** The fourth and fifth pull requests: on each, the tool that opened it added a footer with
  a link to the Claude session to its description. The session removed it and told Tanya.
- **C.** `CLAUDE.md` as merged in the fifth pull request.

## Criteria

1. **(R, C)** The rule in `CLAUDE.md` about "Protect main" names the three required checks and the
   up-to-date setting as read at 8:27 PM (ET) on 2026-11-08. It drops the words that said no read
   had confirmed the up-to-date setting.
2. **(T1, T2, R, C)** Backlog item 9, about making the two new checks required, closes. The items
   after it are renumbered, and any reference to them changes to match.
3. **(R, C)** Backlog item 13 no longer says the up-to-date setting is unread. It says what is still
   untested.
4. **(T1, T2, C)** `CLAUDE.md` gains a lesson dated 2026-11-08 that says what happened and gives the
   rule. A required check is matched by its exact name, so a name typed with one word missing
   blocks every pull request. Pick each check from the list GitHub offers, then read the names back.
   `BUILD-RULES.md` gains the general form of the rule.
5. **(C)** Every new word follows Tanya's writing rules. Every date is Eastern time. Nothing names
   anyone else or points outside this repo.
6. **(T3, C)** Backlog item 8 counts the description revisions of the fourth and fifth pull
   requests too.
7. **(C)** Nothing under `know-your-loan/` changes. The change lands by pull request, and its
   description holds no link the tool added.
8. **(C)** An independent reviewer checks the change against these criteria before it is pushed.
