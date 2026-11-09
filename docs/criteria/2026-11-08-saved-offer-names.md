# Acceptance criteria: long names in the saved offers list

Written 2026-11-08 (ET), before the change it describes. Each criterion names its source.

Revised the same day, before the first push. The review found that on `main`, in French at 320 px,
a one-word name such as "Cooperativa" already pushed the buttons past the end of their row and into
the page margin. So criterion 3 now covers rows whose buttons fit inside the row. Criterion 5 adds
a check that short names keep their buttons beside them, and source M names the largest overflow.
A second review asked that check to count the rows it measures, and to catch buttons pushed into
the page margin, so criterion 5 changed again.

## Sources

- **T1.** Tanya, 2026-11-08 (ET): *"Fix the saved-offer overflow next"*.
- **B.** Backlog item 6 in `CLAUDE.md` as merged in the sixth pull request: with DejaVu Sans, the
  name "Cooperativa de ahorro del barrio" runs 17 px past a 320 px screen in French, because the
  row keeps its buttons beside the name. The fix belongs in the saved list's styles, with a new
  `VERSION` in `sw.js`.
- **M.** A measurement on `main`, 2026-11-08 (ET). The name box takes up to 40 characters. A name
  of one 40-letter word pushed Open and Delete off the screen at every phone width from 320 to
  393 px, by up to 340 px in French with DejaVu Sans. That held in all three languages with both
  fonts, DejaVu Sans and the default.
- **C.** `CLAUDE.md` and `BUILD-RULES.md` as merged in the sixth pull request: their rules and the
  push checklist.

## Criteria

1. **(T1, B, M)** On Calculate, with saved offers named "Cooperativa de ahorro del barrio" and
   one 40-letter word, nothing runs past the screen at 320, 360, 375 and 393 px. That holds in all
   three languages with both fonts, DejaVu Sans and the default. Every Open and Delete button is
   fully on the screen.
2. **(C)** Each Open and Delete button keeps a tap target at least 44 px tall, and no button
   overlaps a name.
3. **(C)** A row whose buttons fit inside it on `main` looks the same as on `main`. With such
   rows, a screenshot of the list matches `main` pixel for pixel in every case of criterion 1.
4. **(B)** The change is in the saved list's styles. `VERSION` in `know-your-loan/sw.js` changes.
5. **(M, C)** The browser test saves both names of criterion 1 in its narrow-phone checks. It is
   shown failing on `main` and passing on this branch. It also checks that every row keeps its
   buttons inside it and that a short name keeps them beside it. That check counts the rows it
   measures, and it is shown failing on copies that break each part.
6. **(C)** `CLAUDE.md` closes backlog item 6 in the same commit and records the lesson.
   `BUILD-RULES.md` gains the general rule if there is one. The records count the sixth pull
   request's description among those where a tool added a link.
7. **(C)** No word people read changes. Every new word follows Tanya's writing rules, and every
   date is Eastern time. Tanya is the author of every commit, and nothing names anyone else or
   points outside this repo.
8. **(C)** The pull request names Calculate as the screen touched and says how it was checked. It
   quotes the reviewer and holds no link the tool added.
9. **(C)** An independent reviewer checks the change against these criteria before it is pushed,
   with screenshots of Calculate at phone width.
