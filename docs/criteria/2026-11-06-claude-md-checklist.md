# Acceptance criteria: keeping CLAUDE.md current

Written 2026-11-06 (ET), before any of the work it describes. Each criterion names its source. If a
criterion and Tanya's own words disagree, her words win.

Revised the same day after eight independent reviews and Tanya's later answers (T5 to T8):
- one criterion was removed at Tanya's word (T5)
- criteria 4 and 12 are new, so the criteria after 3 were renumbered
- the wording of three sources changed
- the title and criterion 13 were reworded
- criterion 2 was split into separate lines
- criterion 3 now describes the simpler hook she chose
- criterion 5 is stricter
- criterion 6 was reworded
- criterion 7 now covers commit messages and lists six writing rules
- criterion 10 cites T3 alone
- criterion 9 no longer lists the open items, which live in the backlog in `CLAUDE.md`

All of it happened before the first push, and the branch was rebuilt so no earlier draft is
published.

## Sources

- **T1.** Tanya, 2026-11-06 (ET): *"Add a CLAUDE.md checklist to this repo now. Make sure it is
  getting updated as changes are made."*
- **T2.** Tanya, 2026-11-06 (ET): this public repo may hold general build rules.
- **T3.** Tanya, 2026-11-06 (ET), chose a pull request that she merges.
- **T4.** Tanya's first message in the session that started 2026-11-04 (ET):
  - never edit `know-your-loan/LICENSE` or `know-your-loan/LICENSE-CONTENT.txt`
  - no force push
  - no rewritten history
  - no deleted files
- **T5.** Tanya, 2026-11-06 (ET): nothing in this repo or its commits refers to work outside it.
- **T6.** Tanya, 2026-11-06 (ET), chose both reminders: a simpler session hook plus a pull request
  check. Both stay general.
- **T7.** Tanya, 2026-11-06 (ET), chose her GitHub no-reply address as the author of commits.
- **T8.** Tanya, 2026-11-06 (ET), chose the session's own identity as committer, so GitHub shows the
  commits as Verified.
- **P.** Tanya's rules for writing and for verifying work.
- **S.** What this session found in this repo. It started 2026-11-04 (ET).

## Criteria

1. **(T1)** `CLAUDE.md` at the repo root holds a checklist that a session follows for every change.
2. **(T1)** `CLAUDE.md` says it is updated in the same commit as any change that does one of these:
   - teaches a lesson worth keeping
   - changes how the project is built or tested
   - changes how the project is published
   - opens or closes a backlog item
3. **(T1, T6)** A Stop hook committed to the repo reminds a Claude Code session to update
   `CLAUDE.md`.
   - **3a.** It names, once, each file that changed after `CLAUDE.md` last changed. A file counts
     when it changed in a commit on the branch after `CLAUDE.md`'s latest commit, or when the change
     is not committed yet. Files that came in by merging `main` do not count.
   - **3b.** It stays quiet while `CLAUDE.md` has changes that are not committed yet, and when every
     changed file was already named. It also stays quiet while the session is already continuing
     because of a Stop hook, so it cannot loop.
   - **3c.** Editing a named file again does not remind again. Committing it does not either.
     Switching to another branch and back does not repeat a reminder.
   - **3d.** It runs through `bash` by path, so a file mode lost on checkout cannot stop it. The script
     keeps LF line endings on Windows checkouts.
   - **3e.** Any error makes it stay quiet. It never stops a session from working.
   - **3f.** Its output is valid JSON whatever the file names are.
   - **3g.** Its tests are in the repo, and each is shown failing against a broken copy of the hook.
4. **(T1, T6)** A pull request check on GitHub keeps `CLAUDE.md` current before a merge.
   - **4a.** It fails a pull request that changes files without changing `CLAUDE.md`.
   - **4b.** It passes when `CLAUDE.md` changed. It also passes when the description has a line that
     starts with `CLAUDE.md: no update needed` and gives a reason.
   - **4c.** It never runs the description as code, and it only reads from the repo.
   - **4d.** Its logic is in a script with tests in the repo, each shown failing against a broken
     copy. The workflow runs those tests too.
5. **(T5, T6)** No file and no pushed commit message holds any of these:
   - the name of anyone other than Tanya
   - anything about work outside this repo
   - file paths from anyone's computer
   - the account name of any person other than Tanya, and any key
6. **(T2)** `BUILD-RULES.md` at the repo root holds general build rules that fit a static web app
   that works offline and has no server. Every rule is written in general terms with no incident
   detail.
7. **(P)** Every word in the new files and commit messages follows Tanya's writing rules:
   - no em dashes
   - no rhetorical questions
   - no negative-then-positive framing
   - no comma-separated lists of three
   - lead with the opportunity
   - plain words
8. **(P)** Every date written is Eastern time and marked ET.
9. **(S)** `CLAUDE.md` carries this repo's lessons so far, and a backlog with every open item.
10. **(T3)** The change lands from a branch by pull request. Nothing is committed to `main`.
11. **(T4)** Nothing under `know-your-loan/` changes.
12. **(T7, T8)** Every new commit, merges included, has Tanya as author with her GitHub no-reply
    address. The committer is the session's own signing identity.
13. **(P)** An independent reviewer who did not write the change checks it against these criteria
    before it is pushed. Its findings are reported as it gave them.
