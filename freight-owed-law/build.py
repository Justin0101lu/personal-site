#!/usr/bin/env python3
"""Assemble static pages for Carrier Counsel from a shared shell."""
import os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
SITE = "https://carriercounsel.com"
EMAIL = "intake@carriercounsel.com"

def shell(title, desc, path, body, extra_head=""):
    canonical = SITE + ("/" if path == "index.html" else "/" + path)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{canonical}">
  <meta name="theme-color" content="#0b2545">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/styles.css">
  <script>document.documentElement.classList.add("js");</script>
{extra_head}</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="topbar">
    <div class="container">
      <span>Recovering unpaid freight charges for motor carriers nationwide</span>
      <span><a href="mailto:{EMAIL}">{EMAIL}</a></span>
    </div>
  </div>
  <header class="site-header">
    <div class="container">
      <a class="brand" href="index.html">
        <img class="mark" src="assets/logo.svg" alt="" width="42" height="42">
        <span><span class="name">Carrier Counsel</span><span class="tag">Transportation Collections Attorneys</span></span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
      <nav class="nav" id="nav" aria-label="Primary">
        <a href="broker-bankruptcy.html">Broker Bankruptcy</a>
        <a href="unpaid-shippers.html">Unpaid Shippers</a>
        <a href="freight-fraud.html">Freight Fraud</a>
        <a href="about.html">About</a>
        <a href="contact.html" class="btn btn-primary btn-sm">Free Claim Evaluation</a>
      </nav>
    </div>
  </header>
  <main id="main">
{body}
  </main>
  <section class="cta-band">
    <div class="container">
      <div>
        <h2>Don't let an unpaid load turn into a write-off.</h2>
        <p>Every unpaid invoice has a deadline, and the debtor's money rarely waits for it. Talk to us before it's gone.</p>
      </div>
      <div style="display:flex;gap:.8rem;flex-wrap:wrap">
        <a class="btn btn-outline" href="mailto:{EMAIL}">Email us</a>
        <a class="btn btn-primary" style="background:#0b2545;color:#fff" href="contact.html">Start a claim</a>
      </div>
    </div>
  </section>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html" style="color:#fff"><img class="mark" src="assets/logo.svg" alt="" width="42" height="42"><span><span class="name">Carrier Counsel</span><span class="tag" style="color:#8ea0ba">Transportation Collections Attorneys</span></span></a>
          <p style="margin-top:1rem;max-width:36ch">A transportation law practice built for one job: getting motor carriers paid for the freight they hauled.</p>
        </div>
        <div>
          <h4>Practice areas</h4>
          <ul>
            <li><a href="broker-bankruptcy.html">Broker bankruptcy &amp; insolvency</a></li>
            <li><a href="unpaid-shippers.html">Shippers who don't pay</a></li>
            <li><a href="freight-fraud.html">Freight fraud &amp; unlawful charges</a></li>
          </ul>
        </div>
        <div>
          <h4>Firm</h4>
          <ul>
            <li><a href="about.html">About the firm</a></li>
            <li><a href="index.html#process">How it works</a></li>
            <li><a href="index.html#faq">FAQ</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
            <li>Mon&ndash;Fri, 8am&ndash;6pm CT</li>
          </ul>
        </div>
      </div>
      <div class="legal">
        <p><strong>Attorney advertising.</strong> This website is for general information only and is not legal advice. Viewing this site, or sending us a message through it, does not create an attorney&ndash;client relationship. Do not send confidential information until an engagement letter is signed. Prior results do not guarantee a similar outcome. Contingency fees, where offered, are computed before deduction of costs and expenses.</p>
        <p>&copy; <span data-year>2026</span> Carrier Counsel. All rights reserved. &middot; <a href="privacy.html">Privacy</a></p>
      </div>
    </div>
  </footer>
  <script src="assets/main.js"></script>
</body>
</html>
"""

ICON_BANK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M5 10v9M9 10v9M15 10v9M19 10v9M2 19h20M12 3 2 8h20z"/></svg>'
ICON_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'
ICON_SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'
ICON_TRUCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
ICON_SCALE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M4 21h16M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/></svg>'



# ---------------------------------------------------------------- HOME
home = f"""
    <section class="hero">
      <div class="container">
        <div>
          <span class="eyebrow" style="color:#f2a900">Transportation law &middot; Carrier collections</span>
          <h1>You hauled the load. <em>You deserve to get paid.</em></h1>
          <p class="lede">Carrier Counsel represents trucking companies against brokers that went out of business, shippers that won't pay, and fraud operations that charged you unlawfully. We recover what you're owed, and you don't pay us unless we do.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="contact.html">Get a free claim evaluation</a>
            <a class="btn btn-light" href="#process">See how it works</a>
          </div>
          <p class="hero-note">Contingency fee on most collection matters &middot; Nationwide representation for carriers of every size &middot; Bilingual intake available</p>
        </div>
        <div class="hero-card reveal">
          <span class="eyebrow">Time matters</span>
          <h3>The four-year rule.</h3>
          <p>An unpaid freight invoice is a breach of contract. In most states you have <strong>up to four years</strong> from the date it went unpaid to file suit. Broker bond claims and bankruptcy proof-of-claim deadlines are far shorter, and the money is often gone long before the legal deadline.</p>
          <p class="small">Every week an invoice sits unpaid, the odds of recovery drop. Send us the paperwork and we'll tell you where you stand within one business day.</p>
          <a class="btn btn-outline btn-sm" href="contact.html">Check my deadline</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="stats reveal">
          <div class="stat"><b>$75,000</b><span>Federal surety bond every licensed broker must carry (BMC-84/85). We file your claim before it's exhausted.</span></div>
          <div class="stat"><b>4 years</b><span>Typical contract limitations period for unpaid freight in most states. Bond and bankruptcy deadlines are far shorter.</span></div>
          <div class="stat"><b>48 states</b><span>We pursue debtors wherever they are, with local counsel where needed.</span></div>
          <div class="stat"><b>0 upfront</b><span>Most matters handled on contingency. No recovery, no attorney's fee.</span></div>
        </div>
      </div>
    </section>

    <section class="section alt" id="practice">
      <div class="container">
        <div class="center reveal">
          <span class="eyebrow">What we do</span>
          <h2>Three ways carriers lose money. Three ways we get it back.</h2>
          <p class="lede">Our entire practice is carrier-side freight collections. We know the paperwork, the players, and the pressure points.</p>
        </div>
        <div class="grid grid-3" style="margin-top:2.5rem">
          <article class="card reveal">
            <div class="icon">{ICON_BANK}</div>
            <h3>Brokers that went out of business</h3>
            <p>When a broker shuts its doors or files bankruptcy, your invoices don't vanish. We file surety bond claims, proofs of claim, and pursue the shipper and principals where the law allows.</p>
            <a class="more" href="broker-bankruptcy.html">Broker bankruptcy &amp; insolvency</a>
          </article>
          <article class="card reveal">
            <div class="icon">{ICON_DOC}</div>
            <h3>Shippers that don't pay</h3>
            <p>Slow-pay that turned into no-pay. Disputed accessorials. "We paid the broker." We enforce the bill of lading, the rate confirmation, and your rights under federal and state law.</p>
            <a class="more" href="unpaid-shippers.html">Unpaid shipper claims</a>
          </article>
          <article class="card reveal">
            <div class="icon">{ICON_SHIELD}</div>
            <h3>Fraud and unlawful charges</h3>
            <p>Double brokering, identity theft, phantom chargebacks, bogus "quick pay" fees, and deductions no contract authorized. We trace the money and hold the responsible parties accountable.</p>
            <a class="more" href="freight-fraud.html">Freight fraud &amp; chargebacks</a>
          </article>
        </div>
      </div>
    </section>

    <section class="section dark" id="process">
      <div class="container">
        <div class="center reveal">
          <span class="eyebrow">How it works</span>
          <h2>From unpaid invoice to money in your account</h2>
          <p class="lede">A clear process, built for owner-operators and fleets who have a business to run.</p>
        </div>
        <div class="steps" style="margin-top:2.5rem">
          <div class="step reveal"><h3>Send us the file</h3><p>Rate confirmation, bill of lading, proof of delivery, invoice, and any emails. Upload through our secure intake form or send it by email.</p></div>
          <div class="step reveal"><h3>Free evaluation</h3><p>Within one business day, we tell you who is liable, what deadlines apply, and what recovery looks like. No fee for the review.</p></div>
          <div class="step reveal"><h3>Demand and pressure</h3><p>Attorney demand letters, bond claims, lien notices, and credit reporting where lawful. Most matters resolve here.</p></div>
          <div class="step reveal"><h3>Litigate if needed</h3><p>If they still don't pay, we sue in the right court, get a judgment, and enforce it against bank accounts, receivables, and assets.</p></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div class="reveal">
          <span class="eyebrow">Why carriers choose us</span>
          <h2>We speak trucking. We litigate collections. That combination is rare.</h2>
          <p>General collection agencies don't understand a Section 7 non-recourse box, a BMC-84 bond, or why a broker's "carrier packet" matters. General business lawyers don't know which court to file in when the debtor is a Delaware LLC brokering out of Illinois for a shipper in Texas. We do both, every day.</p>
          <ul class="checks">
            <li><strong>Carrier-only.</strong> We never represent brokers or shippers against carriers, so there is no conflict when it's time to fight.</li>
            <li><strong>Contingency pricing.</strong> On most matters our fee is a percentage of what we actually collect. If we recover nothing, you owe no attorney's fee.</li>
            <li><strong>Fast intake.</strong> Send documents today, hear back tomorrow. Deadlines don't wait, and neither do we.</li>
            <li><strong>Volume friendly.</strong> Fleets can send us an aging report and we'll triage the whole book of unpaid invoices.</li>
            <li><strong>Preference defense.</strong> Got a letter from a bankruptcy trustee demanding you return money a broker paid you? We defend those too.</li>
          </ul>
          <a class="btn btn-primary" href="contact.html">Talk to a transportation attorney</a>
        </div>
        <div class="aside reveal">
          <h3>Bring these documents if you have them</h3>
          <ul>
            <li>Rate confirmation or load tender</li>
            <li>Bill of lading and signed proof of delivery</li>
            <li>Your invoice and any statements sent</li>
            <li>Broker&ndash;carrier agreement or carrier packet</li>
            <li>Emails, texts, and load board messages</li>
            <li>Factoring agreement, if the load was factored</li>
            <li>Any notice of bankruptcy or bond claim you received</li>
          </ul>
          <p class="small" style="color:var(--muted);font-size:.9rem">Missing something? Send what you have. We can usually reconstruct the rest.</p>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="center reveal">
          <span class="eyebrow">Results</span>
          <h2>What carriers say</h2>
        </div>
        <div class="grid grid-3" style="margin-top:2rem">
          <blockquote class="quote reveal"><p>"The broker filed Chapter 7 with eleven of our loads unpaid. They got the bond claim in before it was drained and then went after the shipper. We recovered almost all of it."</p><footer>Fleet owner, 22 trucks &middot; Reefer, Midwest</footer></blockquote>
          <blockquote class="quote reveal"><p>"A shipper strung me along for five months. One demand letter on law firm letterhead and I had a check in two weeks."</p><footer>Owner-operator &middot; Flatbed, Southeast</footer></blockquote>
          <blockquote class="quote reveal"><p>"Someone double-brokered our loads and we were getting chargebacks for freight we delivered clean. They untangled it and got the deductions reversed."</p><footer>Dispatcher, family carrier &middot; Dry van, Texas</footer></blockquote>
        </div>
        <p class="center" style="font-size:.8rem;color:var(--muted);margin-top:1.5rem">Illustrative client experiences. Details changed to protect confidentiality. Prior results do not guarantee a similar outcome.</p>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="container" style="max-width:820px">
        <div class="center reveal">
          <span class="eyebrow">FAQ</span>
          <h2>Questions carriers ask us</h2>
        </div>
        <div class="faq reveal" style="margin-top:2rem">
          <details><summary>The broker went out of business. Is my money gone?</summary><p>Not necessarily. Every licensed broker must maintain a $75,000 surety bond or trust fund. You can file a claim against it, but it pays first come, first served and is often exhausted within weeks. In many situations the shipper can also be liable for the freight charges even though it already paid the broker. If the broker filed bankruptcy, you may also file a proof of claim in the case. The right move depends on your documents, and that is exactly what our free evaluation covers.</p></details>
          <details><summary>How long do I have to sue for unpaid freight charges?</summary><p>An unpaid invoice is a breach of contract claim, and in most states the statute of limitations for that is four years from the date payment came due. Some states allow more, a few allow less, and the period can differ for written versus oral agreements. Bond claims and bankruptcy bar dates are measured in weeks, not years. Whatever the legal deadline, the practical deadline is sooner: the longer an invoice sits, the more likely the debtor's money is gone. Send us the file and we will confirm your deadline in writing.</p></details>
          <details><summary>What does it cost?</summary><p>Most collection matters are handled on a contingency fee: we take an agreed percentage of what we recover and you pay no attorney's fee if we recover nothing. Court filing fees and similar costs are handled as described in your engagement letter. Some matters, like defending a bankruptcy preference demand, are handled on a flat or hourly basis. We tell you up front which applies.</p></details>
          <details><summary>My loads were factored. Can I still hire you?</summary><p>Usually, yes. The factoring company may own the receivable, in which case we coordinate with them, or the invoice may have been charged back to you, in which case you have the claim. Send us the factoring agreement and we will sort out who has standing.</p></details>
          <details><summary>I got a letter from a bankruptcy trustee demanding I pay back money a broker paid me. Is that real?</summary><p>Yes. In bankruptcy, payments made in the 90 days before the filing can be clawed back as "preferences." There are strong defenses, including ordinary course of business and new value, and trustees frequently settle for a fraction of the demand. Do not ignore the letter and do not pay it without talking to a lawyer.</p></details>
          <details><summary>Do you handle small claims?</summary><p>We take single-load claims and full aging reports. Smaller balances are often best handled with demand letters and bond claims rather than litigation, and we will tell you honestly when the cost of suing outweighs the recovery.</p></details>
        </div>
      </div>
    </section>
"""

# ---------------------------------------------------------------- BROKER BANKRUPTCY
broker = f"""
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / Practice areas / Broker bankruptcy</div>
        <h1>Brokers that went out of business</h1>
        <p class="lede">When a freight broker closes, files bankruptcy, or simply stops answering the phone, carriers are the last to get paid. We change that order.</p>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div class="prose reveal">
          <h2>What actually happens when a broker fails</h2>
          <p>A broker sits between the shipper and you. The shipper pays the broker, the broker is supposed to pay you. When the broker runs out of cash, the shipper's money is already gone and your invoices are stuck in an empty company. Brokers rarely give warning. The first sign is often a bounced quick-pay, a disconnected phone, or a notice from a bankruptcy court.</p>
          <p>Carriers have more options than most realize, but every one of them is time-sensitive.</p>

          <h2>Recovery paths we pursue</h2>
          <h3>1. Surety bond or trust fund claim (BMC-84 / BMC-85)</h3>
          <p>Federal law requires every licensed property broker to maintain $75,000 in financial security. When a broker fails, carriers file claims against it. The surety pays valid claims until the money runs out, and it often runs out fast. We identify the surety from FMCSA records, file a documented claim immediately, and push back when the surety tries to deny or discount it.</p>
          <h3>2. Proof of claim in the bankruptcy case</h3>
          <p>If the broker filed Chapter 7 or Chapter 11, the automatic stay stops direct collection, but you can file a proof of claim by the court's bar date. We prepare it properly, monitor the case, and object to plans or distributions that shortchange carriers.</p>
          <h3>3. Claims against the shipper</h3>
          <p>In many circumstances the shipper (or consignee) remains liable to the carrier for freight charges even though it paid the broker. Whether that applies depends on the bill of lading terms, whether the Section 7 non-recourse box was signed, the parties' course of dealing, and the law of the relevant jurisdiction. This is frequently the most valuable route, and the one brokers and shippers hope you don't know about.</p>
          <h3>4. Claims against principals and affiliated companies</h3>
          <p>Brokers that operate through undercapitalized shells, commingle funds, or move business to a new MC number while leaving the old one to die can expose their owners and successor entities to liability. We investigate and pursue them where the facts support it.</p>

          <h2>Preference demands: when the trustee comes after <em>you</em></h2>
          <p>Months after a broker files bankruptcy, carriers often receive a demand letter from the trustee seeking return of payments received in the 90 days before the filing. These "preference" claims are real, but they are highly defensible. Ordinary-course-of-business and subsequent-new-value defenses frequently reduce them to a small fraction or to zero. We defend these on a flat-fee basis so you know the cost up front.</p>

          <h2>Deadlines that matter</h2>
          <table>
            <tr><th>Action</th><th>Typical timing</th></tr>
            <tr><td>Bond / trust fund claim</td><td>As soon as possible. Funds are paid first come, first served.</td></tr>
            <tr><td>Bankruptcy proof of claim</td><td>By the bar date set by the court, often 70&ndash;90 days after the case begins.</td></tr>
            <tr><td>Civil action for freight charges</td><td>Up to four years from non-payment under most states' contract law; varies by state and by the debtor.</td></tr>
            <tr><td>Responding to a preference demand</td><td>Trustees typically give 20&ndash;30 days before filing suit.</td></tr>
          </table>
          <div class="callout"><strong>Got a bankruptcy notice?</strong> Do not throw it away and do not call the broker's old number. Send it to us the same day.</div>
        </div>
        <aside class="aside reveal">
          <h3>Signs a broker is about to fail</h3>
          <ul>
            <li>Quick-pay requests suddenly declined</li>
            <li>Payment terms stretched from 30 to 60+ days</li>
            <li>Accounts payable stops returning calls</li>
            <li>A new MC number or company name appears on rate confirmations</li>
            <li>Load board reports of non-payment from other carriers</li>
          </ul>
          <p>If you're seeing these, stop hauling for them and contact us before the bond is gone.</p>
          <a class="btn btn-primary" href="contact.html" style="width:100%">Start a bond claim</a>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- UNPAID SHIPPERS
shippers = f"""
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / Practice areas / Unpaid shippers</div>
        <h1>Shippers that don't pay</h1>
        <p class="lede">Delivered clean, invoiced on time, and still waiting. We turn slow-pay and no-pay shippers into paid invoices.</p>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div class="prose reveal">
          <h2>Why shippers stop paying</h2>
          <p>Sometimes it's cash-flow trouble. Sometimes it's a disputed accessorial they use as an excuse to withhold the whole invoice. Sometimes they paid a broker who never paid you and think that ends their obligation. And sometimes they simply calculate that a small carrier won't sue. We change that calculation.</p>

          <h2>Your legal leverage</h2>
          <ul>
            <li><strong>The bill of lading is a contract.</strong> The shipper who tenders the freight is presumptively liable for the charges unless it properly executed the non-recourse provision.</li>
            <li><strong>Consignee liability.</strong> A consignee who accepts delivery can also be liable for freight charges in many circumstances.</li>
            <li><strong>"We paid the broker" is often not a defense.</strong> Depending on the documents and jurisdiction, a shipper that paid a broker may still owe the carrier. Courts look closely at who bore the risk of the broker's default.</li>
            <li><strong>Interest, fees, and costs.</strong> Rate confirmations and tariffs frequently provide for late charges and attorney's fees. We enforce them.</li>
            <li><strong>Federal jurisdiction.</strong> Interstate freight charge claims can often be brought in federal court, which shippers take more seriously than a collection agency's phone call.</li>
          </ul>

          <h2>What we do</h2>
          <h3>Attorney demand</h3>
          <p>A demand letter from a transportation law firm, citing the specific documents and statutes, resolves the majority of shipper claims within 30 days. We include a clear deadline and a clear consequence.</p>
          <h3>Accessorial and detention disputes</h3>
          <p>Detention, layover, TONU, lumper fees, and fuel surcharges are where shippers nitpick. We document each charge against the rate confirmation and industry practice, and we don't let a $300 dispute hold a $3,000 invoice hostage.</p>
          <h3>Litigation and judgment enforcement</h3>
          <p>When a shipper won't pay, we file suit in the correct venue, obtain judgment, and enforce it: bank garnishments, liens, and collection from the shipper's own receivables.</p>
          <h3>Portfolio collections for fleets</h3>
          <p>Send us your aging report. We triage every open invoice, group them by debtor, and pursue them together, which increases recovery and lowers cost per claim.</p>

          <div class="callout"><strong>Statute of limitations:</strong> In most states a carrier has up to four years from non-payment to sue on an unpaid invoice, but the period varies by state, and invoices older than a year or two are much harder to collect in practice. Contact us now, not at year three.</div>
        </div>
        <aside class="aside reveal">
          <h3>Protect your next load</h3>
          <ul>
            <li>Never sign or let the shipper check the Section 7 non-recourse box unless you intend to release them</li>
            <li>Get a signed, legible proof of delivery every time</li>
            <li>Confirm accessorials in writing before you wait</li>
            <li>Invoice within 48 hours with the POD attached</li>
            <li>Run credit on new shippers and brokers before you dispatch</li>
          </ul>
          <a class="btn btn-primary" href="contact.html" style="width:100%">Send us an unpaid invoice</a>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- FRAUD
fraud = f"""
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / Practice areas / Freight fraud</div>
        <h1>Freight fraud and unlawful charges</h1>
        <p class="lede">Double brokering, identity theft, phantom chargebacks, and deductions no contract allows. We trace the money and hold the right parties accountable.</p>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div class="prose reveal">
          <h2>Fraud is now a leading cause of carrier losses</h2>
          <p>Freight fraud has exploded. Bad actors set up shell brokerages, hijack legitimate carriers' MC numbers, re-broker loads to unknowing carriers, and disappear with the shipper's money. Legitimate carriers are left with unpaid loads, cargo claims for freight they never touched, and chargebacks they never agreed to.</p>

          <h2>Schemes we handle</h2>
          <h3>Double brokering</h3>
          <p>A "broker" accepts your load, then re-brokers it, or accepts a broker's load while posing as a carrier, and pockets the spread. The carrier who actually hauled the freight is often unpaid. We pursue the original broker, the shipper, and the double-broker's bond, and we get you paid for the work you performed.</p>
          <h3>Carrier identity theft</h3>
          <p>Fraudsters clone your MC number, DOT number, and company name to book loads. You find out when a shipper calls about freight you never hauled or a cargo claim lands on your desk. We help you respond to FMCSA, document the theft, defend against bogus claims, and pursue the responsible parties.</p>
          <h3>Unlawful chargebacks and deductions</h3>
          <p>Brokers and shippers sometimes deduct "claims," "late fees," "fuel advances," or "admin fees" from your settlement with no contractual basis and no documentation. Those deductions are debts owed to you. We demand the backup, and when there isn't any, we collect.</p>
          <h3>Quick-pay and factoring abuse</h3>
          <p>Quick-pay fees that weren't disclosed, factoring "reserves" that never get released, and fees tacked on after the rate confirmation are recoverable in many circumstances. We review the paperwork and recover what was taken.</p>
          <h3>Fraudulent cargo claims</h3>
          <p>A broker holds your invoice hostage over a cargo claim with no photos, no inspection, and no proof of value. Under the Carmack Amendment the claimant has burdens to meet. We make them meet those burdens or release your money.</p>

          <h2>How we pursue it</h2>
          <ul>
            <li>Trace the chain of custody and the flow of money through rate confirmations, bond records, and bank records obtained in litigation</li>
            <li>File claims against every available bond and trust fund</li>
            <li>Pursue fraud, conversion, and unjust enrichment claims that can reach individuals, not just empty companies</li>
            <li>Report to FMCSA, state attorneys general, and law enforcement where appropriate</li>
            <li>Coordinate with your factoring company and insurer</li>
          </ul>
          <div class="callout"><strong>Fraud claims can pierce shell companies.</strong> Where a company was used to commit fraud, the individuals behind it can be personally liable. That is often the only way to collect from a "broker" that never had any assets.</div>
        </div>
        <aside class="aside reveal">
          <h3>Red flags before you dispatch</h3>
          <ul>
            <li>Brand-new MC number with high-paying loads</li>
            <li>Rate confirmation email domain doesn't match FMCSA records</li>
            <li>Pressure to skip the carrier packet or sign a "quick" agreement</li>
            <li>Pickup contact knows nothing about the "broker"</li>
            <li>Request to change payment details by text</li>
          </ul>
          <p>Already hauled it and not paid? Time matters. Bond funds and bank accounts disappear quickly.</p>
          <a class="btn btn-primary" href="contact.html" style="width:100%">Report a fraud loss</a>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- ABOUT
about = f"""
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / About</div>
        <h1>A law firm that only works for carriers</h1>
        <p class="lede">We built Carrier Counsel because trucking companies were getting the worst of both worlds: collection agencies that don't understand transportation, and transportation lawyers who don't do collections.</p>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div class="prose reveal">
          <h2>Our focus</h2>
          <p>Carrier Counsel is a transportation law practice focused exclusively on recovering money owed to motor carriers. We handle broker insolvency and bankruptcy claims, shipper and consignee collections, freight fraud, unlawful chargebacks, and the defense of bankruptcy preference demands. We do not represent brokers or shippers against carriers.</p>

          <h2>How we work</h2>
          <ul>
            <li><strong>Contingency first.</strong> On most collection matters you pay a percentage of what we recover and nothing if we don't.</li>
            <li><strong>Plain answers.</strong> Within one business day of receiving your file, you get a written assessment: who owes you, what deadlines apply, and what we recommend.</li>
            <li><strong>Built for volume.</strong> Whether you have one unpaid load or a hundred, our intake and case management handle it without losing track of a single invoice.</li>
            <li><strong>Nationwide reach.</strong> Debtors don't respect state lines. We litigate in federal court and work with trusted local counsel wherever a case needs to be filed.</li>
          </ul>

          <h2>Who we serve</h2>
          <ul>
            <li>Owner-operators with their own authority</li>
            <li>Small and mid-size fleets</li>
            <li>Specialized carriers: reefer, flatbed, tanker, hazmat, oversize</li>
            <li>Factoring companies and dispatch services pursuing carrier receivables</li>
          </ul>

        </div>
        <aside class="aside reveal">
          <h3>Quick facts</h3>
          <ul>
            <li>Carrier-side representation only</li>
            <li>Contingency fees on most collection matters</li>
            <li>Free written claim evaluation</li>
            <li>Federal and state court litigation</li>
            <li>Bankruptcy claims and preference defense</li>
          </ul>
          <a class="btn btn-primary" href="contact.html" style="width:100%">Contact the firm</a>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- CONTACT
contact = f"""
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / Contact</div>
        <h1>Free claim evaluation</h1>
        <p class="lede">Tell us about the unpaid load. We'll review it and respond within one business day with who's liable, what deadlines apply, and what recovery looks like.</p>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div class="reveal">
          <form class="form" data-claim-form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" data-mailto="{EMAIL}" novalidate>
            <div class="row">
              <label>Your name <input type="text" name="name" required autocomplete="name"></label>
              <label>Company <input type="text" name="company" required autocomplete="organization"></label>
            </div>
            <div class="row">
              <label>Email <input type="email" name="email" required autocomplete="email"></label>
              <label>Phone <input type="tel" name="phone" autocomplete="tel"></label>
            </div>
            <div class="row">
              <label>Your MC / DOT number <input type="text" name="mc_number" placeholder="MC-123456"></label>
              <label>Who owes you?
                <select name="debtor_type" required>
                  <option value="">Select one</option>
                  <option>Broker that went out of business / bankrupt</option>
                  <option>Shipper or consignee that won't pay</option>
                  <option>Fraud, double brokering, or identity theft</option>
                  <option>Unlawful chargebacks or deductions</option>
                  <option>Bankruptcy preference demand against me</option>
                  <option>Not sure</option>
                </select>
              </label>
            </div>
            <div class="row">
              <label>Debtor's name <input type="text" name="debtor_name" placeholder="Broker or shipper name"></label>
              <label>Approximate amount owed <input type="text" name="amount" placeholder="$"></label>
            </div>
            <div class="row">
              <label>Number of unpaid loads <input type="number" name="loads" min="1" placeholder="1"></label>
              <label>Oldest delivery date <input type="date" name="oldest_delivery"><span class="hint">Helps us check your deadlines.</span></label>
            </div>
            <label>Tell us what happened <textarea name="details" placeholder="Where the freight moved, what you were promised, what they've said since."></textarea></label>
            <label class="consent"><input type="checkbox" name="consent" required> I understand that submitting this form does not create an attorney&ndash;client relationship and that I should not include confidential details until an engagement is confirmed.</label>
            <input class="honey" type="text" name="_gotcha" tabindex="-1" autocomplete="off">
            <div><button class="btn btn-primary" type="submit">Request free evaluation</button></div>
            <div class="form-status" role="status" aria-live="polite"></div>
          </form>
        </div>
        <aside class="aside reveal">
          <h3>Reach us directly</h3>
          <p><strong>Email:</strong> <a href="mailto:{EMAIL}">{EMAIL}</a><br><strong>Hours:</strong> Mon&ndash;Fri, 8am&ndash;6pm CT</p>
          <h3>What to send</h3>
          <ul>
            <li>Rate confirmation</li>
            <li>Bill of lading and proof of delivery</li>
            <li>Invoice</li>
            <li>Any emails, texts, or notices</li>
          </ul>
          <p style="font-size:.9rem;color:var(--muted)">Attach documents by replying to our confirmation email, or send them straight to {EMAIL}.</p>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- PRIVACY
privacy = """
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / Privacy</div>
        <h1>Privacy policy</h1>
      </div>
    </section>
    <section class="section">
      <div class="container prose" style="max-width:820px">
        <p><em>Effective date: [insert]. Replace this template with a policy reviewed by counsel before launch.</em></p>
        <h2>Information we collect</h2>
        <p>When you submit our claim evaluation form we collect the information you provide, such as your name, company, contact details, and a description of your matter. Our web host may collect standard server logs (IP address, browser type, pages visited).</p>
        <h2>How we use it</h2>
        <p>We use the information to evaluate and respond to your inquiry, to check for conflicts of interest, and to communicate with you about your matter. We do not sell your information.</p>
        <h2>Service providers</h2>
        <p>Form submissions may be processed by a third-party form service and email provider. Those providers process the data on our behalf under their own privacy terms.</p>
        <h2>Contact</h2>
        <p>Questions about this policy can be sent to intake@carriercounsel.com.</p>
      </div>
    </section>
"""

# ---------------------------------------------------------------- 404
notfound = """
    <section class="section center" style="padding-top:6rem;padding-bottom:6rem">
      <div class="container">
        <span class="eyebrow">404</span>
        <h1>That page rolled off the lot.</h1>
        <p class="lede">The link may be broken or the page may have moved.</p>
        <a class="btn btn-primary" href="index.html">Back to home</a>
      </div>
    </section>
"""

LD = """  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": "Carrier Counsel",
    "url": "https://carriercounsel.com/",
    "description": "Transportation law firm recovering unpaid freight charges for motor carriers: broker bankruptcy claims, unpaid shipper collections, and freight fraud.",
    "email": "intake@carriercounsel.com",
    "areaServed": "US",
    "priceRange": "Contingency fee on most matters",
    "knowsAbout": ["Freight collections", "Broker surety bond claims", "Bankruptcy preference defense", "Double brokering", "Carmack Amendment"]
  }
  </script>
"""

pages = {
    "index.html": ("Carrier Counsel | Transportation Lawyers Who Get Carriers Paid",
                   "Transportation law firm that recovers unpaid freight charges for trucking companies: broker bankruptcy and bond claims, shippers that won't pay, and freight fraud. Contingency fees. Free claim evaluation.",
                   home, LD),
    "broker-bankruptcy.html": ("Broker Went Out of Business? Carrier Bond & Bankruptcy Claims | Carrier Counsel",
                   "When a freight broker closes or files bankruptcy, carriers can still recover: BMC-84 bond claims, proofs of claim, shipper liability, and preference defense. Free evaluation.",
                   broker, ""),
    "unpaid-shippers.html": ("Shipper Won't Pay Freight Charges? Carrier Collections | Carrier Counsel",
                   "Attorney demand letters, litigation, and judgment enforcement against shippers and consignees that don't pay motor carriers. Contingency fees. Free evaluation.",
                   shippers, ""),
    "freight-fraud.html": ("Freight Fraud, Double Brokering & Unlawful Chargebacks | Carrier Counsel",
                   "Recover losses from double brokering, carrier identity theft, unlawful chargebacks, and fraudulent cargo claims. Transportation attorneys for motor carriers.",
                   fraud, ""),
    "about.html": ("About Carrier Counsel | Carrier-Side Transportation Attorneys",
                   "A transportation law practice focused exclusively on recovering money owed to motor carriers. Contingency fees, nationwide reach, fast written evaluations.",
                   about, ""),
    "contact.html": ("Free Claim Evaluation | Carrier Counsel",
                   "Send us your unpaid load and get a written evaluation within one business day: who is liable, what deadlines apply, and what recovery looks like.",
                   contact, ""),
    "privacy.html": ("Privacy Policy | Carrier Counsel", "Privacy policy for carriercounsel.com.", privacy, '  <meta name="robots" content="noindex">\n'),
    "404.html": ("Page Not Found | Carrier Counsel", "The page you requested could not be found.", notfound, '  <meta name="robots" content="noindex">\n'),
}

for path, (title, desc, body, extra) in pages.items():
    with open(os.path.join(OUT, path), "w", encoding="utf-8") as f:
        f.write(shell(title, desc, path, body, extra))
    print("wrote", path)
