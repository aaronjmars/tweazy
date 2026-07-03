# Contributing to Tweazy

Thanks for helping improve Tweazy — a reference implementation for monetizing AI /
MCP with x402 payments and CDP Smart Wallets on Base. This guide covers local
setup and how to land a PR.

## Ways to contribute

- **Bug fixes and features** in the Next.js app (`src/`).
- **Payment / wallet flow** improvements (x402 gating, CDP Smart Wallet or
  non-custodial paths) — read [`SECURITY.md`](SECURITY.md) first; this is the
  sensitive surface.
- **Generative-UI components** (Tambo registry) and MCP integration.
- **Docs** — setup, configuration, deployment.

## Before you start

- **Fork and branch from `main`.** Use a descriptive branch name (`feat/…`,
  `fix/…`, `docs/…`).
- **One change per PR.** Don't bundle unrelated edits.
- **Title as a [Conventional Commit](https://www.conventionalcommits.org/)** —
  `feat: …`, `fix: …`, `docs: …`. PRs are squash-merged, so the title becomes the
  commit subject.
- **Never commit secrets.** Keep CDP keys, the recipient address, and any provider
  keys in `.env.local` (see `example.env.local`) — it's gitignored.

## Development setup

**Prerequisites:** Node.js 18+, a [Tambo AI API key](https://tambo.co/dashboard)
(free tier), and a wallet address to receive payments.

```bash
git clone https://github.com/aaronjmars/tweazy.git && cd tweazy
npm install
cp example.env.local .env.local     # then fill in your keys
npm run dev                          # http://localhost:3000
```

The network defaults to **Base testnet** (`src/lib/config.ts`) — develop and test
there; only switch to mainnet deliberately, since that moves real USDC.

## Testing & CI

CI (`.github/workflows/ci.yml`) runs lint and a production build on every push and
PR to `main`. Secrets are optional at build time (testnet defaults), so reproduce
it with:

```bash
npm ci
npm run lint
npm run build
```

A green local `lint` + `build` is the quickest path to a green PR.

## Submitting a pull request

- Keep the diff focused and the title conventional; it becomes the squash commit.
- Explain **what** changed and **why**; link the issue (`Fixes #123`).
- Run `npm run lint && npm run build` locally and confirm they pass.
- If you touched the payment gate, wallet signing, key handling, or how
  AI-generated content is rendered/sanitized, **say so explicitly** — those are
  security-sensitive and get closer review.

## Reporting bugs & requesting features

Open an issue with repro steps, the network (testnet/mainnet), wallet type,
browser, and what you expected vs. what happened.

**Found a security problem?** Don't open an issue — anything touching payments,
wallets, keys, or XSS goes through [`SECURITY.md`](SECURITY.md) via private
reporting.

## License

By contributing, you agree that your contributions are licensed under the
repository's [LICENSE](LICENSE).
