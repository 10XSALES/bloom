# Bloom

A vision-first web app for turning personal goals into a practical money plan.

## Features
- Vision board with goals, target dates, inspiration images, and linked savings funds.
- Accounts, recurring income and expenses, and cash projections.
- Loan payoff comparisons and payday reviews.
- Device-local saving, JSON backup and restore, and optional migration from the original online wallet.

## Run locally
Requires Node.js 22.13 or later and npm.

```sh
npm ci
npm run dev
```

Open the address shown in the terminal. New changes are saved in this browser's local storage. Internet is required to initially load the hosted app and remote images; this is not an installable offline PWA. Browser data does not sync between devices. Export backups before clearing browser storage.

## Verify and build
```sh
npx tsc --noEmit
npm run build
```

Built with React, TypeScript, Vinext, Tailwind CSS, and Cloudflare Workers. The existing Sites deployment uses the project mapping in `.openai/hosting.json`. Do not reuse that mapping for an unrelated deployment.

## Optional legacy database
The `/api/wallet` endpoint supports copying the original owner-private online wallet onto this device. It requires the Cloudflare D1 `DB` binding and the migration in `drizzle/`. Normal goal creation and local saving do not require this endpoint. The legacy endpoint uses one shared wallet and must remain behind owner-only access; it is not a multi-user backend.

Google sign-in and bank connections are not implemented. Financial amounts and loan projections are manually entered estimates.

## Repository contents
Source and dependency lockfile only. Personal wallet records, local databases, credentials, dependencies, and compiled output are excluded.
