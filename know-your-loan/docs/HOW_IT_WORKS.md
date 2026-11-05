# How the numbers are worked out

## What the borrower types

| Input | Meaning |
|---|---|
| Amount | The loan amount written on the contract |
| Fees taken first | Any amount kept back before the money is handed over |
| Number of payments | How many payments, 1 or more |
| Each payment | The full amount handed over each time |
| How often | The time between payments (days, weeks, or months), or the time until the single payment |
| Other fees later | Optional, added to the last payment |
| Rate quoted | Optional, the lender's monthly rate, for comparison |

## Steps

1. **Money received** = amount minus fees taken first.
2. **Total paid back** = number of payments times each payment, plus other fees paid later.
3. **Cost** = total paid back minus money received.
4. **Cost for every 100** = cost divided by money received, times 100.
5. **Rate per payment period** is the rate `r` that makes this true:

   money received = payment 1 / (1+r) + payment 2 / (1+r)^2 + ... + payment n / (1+r)^n

   There is no simple formula for `r`, so `js/calc.js` finds it by repeated halving (bisection).
6. **Yearly rate (APR)** = `r` times the number of payment periods in a year. This is the nominal convention used on many loan disclosures.
7. **Real cost per month** = APR divided by 12.

A year is 365 days and a month is 365/12 days.

## Worked examples (each checked against a separate calculation)

**Fee kept back.** Contract says 1,000. The lender keeps 100. The borrower repays 1,100 after one month. The borrower received 900 and paid back 1,100, so the loan costs 200, which is 22.2 for every 100 received. The monthly rate is 22.2%, not the 10% that "1,100 on 1,000" suggests.

**Weekly payments.** Contract says 1,000. 100 is kept back. 10 weekly payments of 125. Received 900, paid back 1,250, so 138.89 is paid back for every 100 received. Weekly rate 6.47%, real cost 28.1% per month, yearly rate 337%.

**A flat rate hides the truth.** "Flat 10% per month" on 1,000 for 6 months means 600 of interest, so six payments of 266.67. Because the borrower keeps repaying principal, the balance falls each month, and the real rate is 15.3% per month, not 10%.

**Textbook match.** 1,000 repaid in 12 monthly payments of 88.85 is a 1% monthly rate and a 12% yearly rate. The tests confirm the code returns exactly that.

## Known simplifications

- Payments are assumed equal and evenly spaced.
- Interest-free grace periods, rollovers, compulsory savings that are returned later, and late penalties are not modelled. The warning signs and lender questions cover them in words.
- Yearly rates for loans shorter than a few weeks look very large. That is arithmetic, so the app always shows the cost for every 100 as well.
