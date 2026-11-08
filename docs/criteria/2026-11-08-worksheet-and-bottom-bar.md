# Acceptance criteria: the worksheet on 2 pages and the bottom bar's padding

Written 2026-11-08 (ET), before the change it describes. Each criterion names its source.

Revised the same day, before the first push. The build found the Calculate screen scrolling sideways
at 320 px, already on `main`. So criteria 8 and 10 changed. After the first two reviews, source R and
criterion 14 were added.

## Sources

- **T1.** Tanya, 2026-11-08 (ET): *"Fix the remaining items for me"*. She then chose "Backlog fixes",
  which named the worksheet's page count and the bottom bar padding.
- **B1.** Backlog item 1 in `CLAUDE.md` as merged in the third pull request: the worksheet prints on
  3 pages, and only English on A4 fits on 2. The fix belongs in the print styles in
  `know-your-loan/css/styles.css`. Keep the writing rows at least about 9 mm tall. Then change
  `VERSION` in `sw.js`.
- **B3.** Backlog item 3 in `CLAUDE.md` as merged in the third pull request: the bottom bar's padding
  can be 0 on phones without a notch. `BUILD-RULES.md` asks for
  `max(8px, env(safe-area-inset-bottom))`.
- **C.** `CLAUDE.md` as merged in the third pull request: its rules and its push checklist.
- **R.** The visual review of 2026-11-08 (ET): the printed checklists had shrunk to 14 px text for no
  gain, which makes the paper people keep harder to read.

## Criteria

1. **(T1, B1)** The worksheet prints on 2 pages in all three languages, on both A4 and Letter paper.
2. **(B1)** Every writing row in the worksheet's main table stays at least 9 mm tall when printed.
   The rows of the table for comparing offers keep their height.
3. **(B1)** The worksheet fix lives in the print styles in `know-your-loan/css/styles.css`. It
   changes nothing people see on the screen.
4. **(T1, B3)** The bottom bar's bottom padding is `max(8px, env(safe-area-inset-bottom))`. Nothing
   on any screen hides behind the taller bar at 320 px or 375 px wide.
5. **(B1, C)** `VERSION` in `know-your-loan/sw.js` changes. `ASSETS` stays the same, since no file is
   added.
6. **(C)** No word people read changes. Every word in the app is Tanya's.
7. **(C)** These screens were screenshotted at phone width and looked at before the push:
   - Calculate
   - Warning signs
   - Paper worksheet
   - the printed worksheet, in every language and on both paper sizes
8. **(C)** The browser checks pass:
   - the page loads with no errors and no missing files
   - after one visit, the app opens and calculates with the network off
   - the page contacts no other website
   - nothing scrolls sideways at 320 px or 375 px wide, on any screen in any language, measured
     against the screen's real width
9. **(C)** `node --test test/calc.test.js` passes inside `know-your-loan/`.
10. **(C)** `CLAUDE.md` closes backlog items 1 and 3 in the same commit as the fix. It records each
    lesson the change teaches, and `BUILD-RULES.md` gains the general ones.
11. **(C)** Every new word follows Tanya's writing rules. Every date is Eastern time. Tanya is the
    author of every commit.
12. **(C)** The change lands by pull request. The description names every screen the change touches
    and says how each was checked. It quotes the reviewers and holds no link the tool added.
13. **(C)** Two independent reviewers check the change before it is pushed. One checks it against
    these criteria and hunts for defects. The other looks at the screenshots and the printed pages.
14. **(R)** The printed checklists keep their 16 px text. Page 2 prints as it did before.
