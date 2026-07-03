# Security Policy

Tweazy is a Next.js app that gates AI responses behind **real on-chain payments** —
0.01 USDC per query via [x402](https://x402.org), settled with Coinbase CDP Smart
Wallets on Base. It touches wallets, payment verification, provider API keys, and
renders **AI-generated UI**, so bugs here can cost money or run untrusted markup.
This policy covers what's in scope and how to report privately.

## Reporting a vulnerability

**Please don't open a public issue for a security problem** — especially anything
touching payments or wallets. Use GitHub's **Private Vulnerability Reporting
(PVR)**:

➡️ **[Report a vulnerability](https://github.com/aaronjmars/tweazy/security/advisories/new)**

(Repo → **Security** tab → **Report a vulnerability**.) This opens a private
advisory that only the maintainers can see — never a public issue, so a fix can
ship before the details are out.

Please include what you can:

- The route or module affected (an API route, a payment/x402 path, a wallet
  hook, a Tambo component, markdown rendering).
- A minimal reproduction or proof of concept.
- The impact you can demonstrate — payment-gate bypass (AI response without a
  valid payment), fund loss or misdirection, key/secret disclosure, XSS via
  AI-generated content, or signature/authorization abuse.
- Network (Base **testnet** vs **mainnet**), commit, and wallet type
  (Smart Wallet with passkey, or non-custodial).

**Response targets** — best effort; this is a small project. Payment/fund-loss
reports are triaged first:

| Stage | Target |
|-------|--------|
| Acknowledge the report | within 7 days |
| Initial assessment / severity | within 14 days |
| Fix or mitigation on `main` | as fast as the severity warrants |

We follow **coordinated disclosure**: please give us a reasonable window to ship a
fix before you disclose publicly. We'll credit you in the advisory unless you'd
rather stay anonymous.

## Supported versions

Tweazy is a reference implementation; security fixes land on the `main` branch of
[`aaronjmars/tweazy`](https://github.com/aaronjmars/tweazy).

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ Yes |
| Older commits / your deployment behind `main` | ⚠️ Pull latest to receive fixes |

## Security model

- **Secrets live in the environment, never in code or the client bundle.** CDP API
  keys, the payment-recipient address, paymaster config, and any provider keys come
  from env (see `example.env.local`). Server-only secrets must never be exposed to
  the browser or committed. A secret reachable client-side is a finding.
- **The payment gate is the boundary.** The x402 flow returns AI output only after
  a valid on-chain payment. Any way to obtain a paid response **without** a
  corresponding valid payment — replaying a payment proof, forging the 402
  settlement, or bypassing verification — is in scope.
- **Wallets and signatures.** Smart Wallet (passkey) and non-custodial flows sign
  and submit transactions. Bugs that let a page trigger unintended signatures/
  transfers, exfiltrate key material, or misroute funds are in scope. Gas
  sponsorship via the paymaster must not be abusable to drain the sponsor.
- **AI-generated UI is untrusted output.** Model responses render as markdown and
  as Tambo React components. HTML is sanitized with DOMPurify; a bypass that lands
  script execution or dangerous markup (XSS) from model output or a crafted prompt
  is in scope.
- **Default to testnet.** The app defaults to Base testnet (`src/lib/config.ts`).
  Treat mainnet configuration as production — real funds.

## Scope

**In scope:**

- Payment-gate bypass or x402 settlement/replay flaws.
- Fund loss, misdirected transfers, or paymaster/gas-sponsorship abuse.
- Exposure of API keys, wallet secrets, or server-only config to the client.
- XSS / markup injection through AI-generated markdown or components.
- Signature or authorization abuse triggered by a page or crafted input.

**Out of scope:**

- Vulnerabilities in upstream dependencies or services — x402, Coinbase CDP, the
  paymaster, Tambo AI, Base/viem/wagmi — report those to the respective vendor.
- Your own misconfiguration (committed secrets, wrong recipient address, running
  mainnet with test settings).
- AI answer quality (a wrong or low-quality response is a behavior issue — open a
  regular issue).
- Spending your own funds by using the app as designed.

---

> **Maintainers:** the Report-a-vulnerability link only works once PVR is enabled
> — **Settings → Code security and analysis → Private vulnerability reporting →
> Enable**.

Thanks for helping keep Tweazy and its users' funds safe.
