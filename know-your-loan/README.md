# Know Your Loan

A free calculator that shows what a loan really costs. It works without internet, needs no account, and keeps everything on the phone.

> **Draft for the repo owner to rewrite in her own voice.** Replace this paragraph and the one below with your own words.

**Why this exists.** [Two or three sentences about the Nicaragua micro-finance work and what you saw: owners treating money in as money kept, and fees and flat rates hiding the true price of a loan.]

## What it does

You type the numbers from a loan offer: the amount on the contract, fees taken before the money arrives, the number of payments, the size of each payment, and how often you pay. The app shows:

- how much you pay back for every 100 you receive
- the real cost per month and the yearly rate (APR), worked out from the actual cash flows
- how the real monthly rate compares with the rate the lender quoted
- a list of warning signs to check before signing
- a printable worksheet that does the same arithmetic with a pencil, plus questions to ask the lender

Languages today: English, Spanish, French. Translations need review by native speakers (see [docs/TRANSLATING.md](docs/TRANSLATING.md)).

## Why paper is part of the product

Many people who would use this have no smartphone or no data. The worksheet inside the app prints on one A4 page (two pages with the warning signs) in black and white. A facilitator, loan officer, or savings group can photocopy it and hand it out.

## Try it

Open `index.html` through any web server. For example, from this folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The first visit saves the app on the phone, so it opens without internet afterwards. On Android, use the browser menu and choose "Add to Home screen" or "Install app".

## Put it online for free

1. Add this folder to a GitHub repository.
2. In the repository, open **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and the `/ (root)` folder, and save.
4. After a minute the app appears at `https://YOUR-NAME.github.io/REPO-NAME/know-your-loan/` when the folder sits inside a larger repository, or at `https://YOUR-NAME.github.io/REPO-NAME/` when it is the whole repository.

Every file path in the app is relative, so it works from either address.

## Run the tests

```
node --test test/calc.test.js
```

The tests check the rate calculation against textbook loan formulas. See [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) for the method and worked examples.

## What is inside

| Path | Purpose |
|---|---|
| `index.html`, `css/`, `js/app.js` | The interface |
| `js/calc.js` | The calculation, usable in the browser and in Node |
| `locales/` | One file per language |
| `sw.js`, `manifest.webmanifest` | Offline support and install-to-home-screen |
| `test/` | Tests for the calculation |

The whole app is about 140 KB of files with no outside libraries, fonts, or tracking.

## Limits

This tool gives an estimate from the numbers a person types. It does not check whether a lender is licensed, legal, or fair, and it does not replace advice from a trusted person. Yearly rates for very short loans look very large, so the app also shows the cost for every 100 received.

## License

Free to use, copy, change, and share for non-commercial purposes. Not for sale.

- The **code** is under the [PolyForm Noncommercial License 1.0.0](LICENSE). Charities, schools, and public research groups are covered.
- The **words and pictures** (translations, docs, worksheet text, icons) are under [CC BY-NC-SA 4.0](LICENSE-CONTENT.txt).
- [NOTICE](NOTICE) lists which files fall under which license.

Want to use it in a paid program or a commercial product? Get in touch first and ask for written permission.

Contributions of translations, corrections, and field feedback are welcome. Anything you contribute is shared under the same license as the file you change.
