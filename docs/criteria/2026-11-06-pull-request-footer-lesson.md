# Acceptance criteria: the pull request footer lesson

Written 2026-11-06 (ET), before the change it describes. Each criterion names its source.

## Sources

- **T1.** Tanya, 2026-11-06 (ET): *"Add the lesson in a follow-up PR."* The lesson: the tool
  that opened the first pull request added a footer to its description that linked back to the
  Claude conversation.
- **T2.** Tanya, 2026-11-06 (ET): nothing in this repo or its commits refers to work outside it.
- **T3.** Tanya, 2026-11-06 (ET), said yes to deleting the branch `claude/dazzling-knuth-cfj37t`.
- **T4.** Tanya, 2026-11-06 (ET), about the link to the Claude session in the message of the first
  Know Your Loan commit on `main`: *"Remove it."* She called the link a security risk, and chose to
  become that commit's author.
- **C.** `CLAUDE.md` as merged in the first pull request.

## Criteria

1. **(T1, C)** `CLAUDE.md` gains a lesson dated 2026-11-06 that says what happened and gives the rule:
   read a pull request's description on GitHub after opening it, and remove any link the tool added.
2. **(T1, C)** The checklist in `CLAUDE.md` gains a matching item.
3. **(T1, C)** `BUILD-RULES.md` gains the general form of the rule.
4. **(T3, C)** The backlog item about the branch says it is deleted once its last pull request
   merges, with Tanya's yes.
5. **(T4)** `CLAUDE.md` records that `main` was rebuilt to remove the link and make Tanya the author,
   and that this was the one exception to the rule against force-pushing. It names no old commit ID.
   The backlog item about that commit closes. A new backlog item lists what only Tanya can still
   remove.
6. **(T2)** Nothing in the change or its commit messages refers to work outside this repo.
7. **(C)** Every new word follows Tanya's writing rules. Every date is Eastern time.
8. **(C)** Nothing under `know-your-loan/` changes. The change lands by pull request, and its
   description holds no link to a Claude session.
9. **(C)** An independent reviewer checks the change against these criteria before it is pushed.
