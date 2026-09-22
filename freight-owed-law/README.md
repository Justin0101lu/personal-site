# Carrier Counsel — carriercounsel.com

Marketing website for **Carrier Counsel**, a transportation law practice that recovers
unpaid freight charges for motor carriers:

- brokers that went out of business (bond claims, bankruptcy proofs of claim, shipper liability, preference defense)
- shippers and consignees that don't pay
- freight fraud, double brokering, and unlawful chargebacks

The site is plain static HTML/CSS/JS with no build dependencies, so it can be hosted anywhere
(GitHub Pages, Netlify, Cloudflare Pages, any web host).

## Domain

`carriercounsel.com` was **unregistered** when this site was built (verified against the Verisign RDAP
registry). Register it at a low-cost registrar such as Cloudflare Registrar or Porkbun; a `.com`
runs roughly $10–12 per year at cost-based registrars.

Backup names that were also unregistered at the same time:
`ladinglaw.com`, `milepostlaw.com`, `interstatecarrierlaw.com`, `carrierrecoverylaw.com`, `carriercounsel.com`.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Home page: hero, practice areas, process, FAQ |
| `broker-bankruptcy.html` | Broker insolvency / bond claims / preference defense |
| `unpaid-shippers.html` | Shipper and consignee collections |
| `freight-fraud.html` | Fraud, double brokering, chargebacks |
| `about.html`, `contact.html`, `privacy.html`, `404.html` | Firm, intake form, privacy, not-found |
| `assets/styles.css`, `assets/main.js`, `assets/logo.svg` | Styles, scripts, logo |
| `build.py` | Optional: regenerates every page from one shared header/footer template |
| `.github/workflows/pages.yml` | Deploys to GitHub Pages on push to `main` |

To edit the shared header, nav, or footer, change `build.py` and run `python3 build.py .`
Editing the HTML files directly also works if you don't need the shared shell.

## Before launch (placeholders to replace)

1. **Email** `intake@carriercounsel.com` appears in `build.py` (and in every page). Replace with the
   real intake address once the domain's mailbox exists. The site deliberately lists no phone number.
2. **Contact form**: `contact.html` posts to `https://formspree.io/f/YOUR_FORM_ID`. Create a free
   form at formspree.io (or any similar service) and paste the real endpoint. Until then, the form
   falls back to opening the visitor's email client with the details pre-filled.
3. **Attorney bios and bar admissions** on `about.html`. Legal advertising rules in every state
   require the responsible attorney and licensing jurisdictions to be identified.
4. **Privacy policy** on `privacy.html` is a template; have counsel review it.
5. **Testimonials** on the home page are illustrative placeholders and must be replaced with real,
   consented client statements or removed. Many state bars restrict testimonials in attorney advertising.
6. Review all legal content with a licensed attorney before publishing. The statutes cited
   (49 U.S.C. § 14705, the $75,000 BMC-84/85 broker bond, the Carmack Amendment, bankruptcy
   preference rules) are accurate as general background, but specifics vary by jurisdiction and facts.

## Repository and hosting

This site lives at https://github.com/Justin0101lu/law. The workflow in
`.github/workflows/pages.yml` deploys to GitHub Pages on every push to `main`.

One-time setup: in the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
The workflow's built-in token cannot create the Pages site itself, so until this is done the deploy
job fails at the "configure-pages" step. After that, the site is served at
https://justin0101lu.github.io/law/ until a custom domain is attached.

## Pointing the domain at GitHub Pages

1. In the repo, **Settings → Pages → Custom domain**: enter `carriercounsel.com` and save.
   GitHub creates a `CNAME` file in the repo.
2. At your registrar, add DNS records:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `justin0101lu.github.io`
3. Tick **Enforce HTTPS** once the certificate is issued (usually within an hour).

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
