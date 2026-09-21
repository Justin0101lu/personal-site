# Freight Owed Law — freightowed.com

Marketing website for **Freight Owed Law**, a transportation law practice that recovers
unpaid freight charges for motor carriers:

- brokers that went out of business (bond claims, bankruptcy proofs of claim, shipper liability, preference defense)
- shippers and consignees that don't pay
- freight fraud, double brokering, and unlawful chargebacks

The site is plain static HTML/CSS/JS with no build dependencies, so it can be hosted anywhere
(GitHub Pages, Netlify, Cloudflare Pages, any web host).

## Domain

`freightowed.com` was **unregistered** when this site was built (verified against the Verisign RDAP
registry). Register it at a low-cost registrar such as Cloudflare Registrar or Porkbun; a `.com`
runs roughly $10–12 per year at cost-based registrars.

Backup names that were also unregistered at the same time:
`carrierrecoverylaw.com`, `haulrecoverylaw.com`, `unpaidfreightlaw.com`, `freightclaimlaw.com`, `owedfreight.com`.

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

1. **Phone number** `(555) 012-3456` and email `intake@freightowed.com` appear in `build.py`
   (and in every page). Replace with real contact details.
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

## Moving this folder into its own repository

This site was developed inside the `personal-site` repo because the session could not create
repositories. To give it its own repo (recommended, and required for GitHub Pages to serve it at
the root of the domain):

```bash
# 1. Create an empty repo on GitHub named freight-owed-law (no README, no .gitignore).

# 2. From a clone of personal-site, on the branch that contains this folder:
git subtree split --prefix=freight-owed-law -b freight-owed-law-main
git push https://github.com/Justin0101lu/freight-owed-law.git freight-owed-law-main:main
git branch -D freight-owed-law-main
```

Then in the new repo: **Settings → Pages → Source: GitHub Actions**. The included workflow
deploys on every push to `main`.

## Pointing the domain at GitHub Pages

1. In the new repo, **Settings → Pages → Custom domain**: enter `freightowed.com` and save.
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
