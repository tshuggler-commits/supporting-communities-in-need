# Adding or fixing a language

Each language is one file in `locales/`. No other code needs to change except two lines.

## Add a language

1. Copy `locales/en.js` to `locales/xx.js`, where `xx` is the two-letter code (for example `ht` for Haitian Creole, `sw` for Swahili, `ne` for Nepali).
2. Change `window.KYL_LOCALES.en` to `window.KYL_LOCALES.xx` on the second line of code.
3. Set `_name` to the language's own name (this appears in the language menu) and `_decimal` to `'.'` or `','`, the mark the language uses before decimals.
4. Translate the text to the right of each colon. Keep `{a}`, `{b}`, `{n}`, `{q}`, `{r}`, and `{x}` exactly as they are. They are filled in by the app.
5. Add `<script src="locales/xx.js"></script>` to `index.html`, next to the other locale scripts.
6. Add `'locales/xx.js'` to the `ASSETS` list in `sw.js` and change `VERSION` (for example `kyl-v2`) so phones pick up the new copy.

## Writing guidance

- Use short sentences and everyday words. Many readers are not fluent readers.
- Read the English first: each line is written to be understood by someone with little financial background.
- The unit words come in singular and plural forms (`unitDayOne`, `unitDayOther`). Languages with other plural rules can use the closest form.
- Check the finished screen on a phone, since long words can wrap.

## License of translations

Translation files are covered by CC BY-NC-SA 4.0 (see `NOTICE`). A translation you contribute is shared under that license, with credit to you if you ask for it. It may be used and adapted for free, and it may not be sold.

## Review status

| Language | Status |
|---|---|
| English | Reference |
| Spanish | Drafted, needs review by a native speaker |
| French | Drafted, needs review by a native speaker |
