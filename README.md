# Tumbuh-Tahu-Admin-App

Nuxt admin panel untuk mengontrol data yang digunakan oleh Tumbuh Tahu App: milestone perkembangan, materi edukasi, aktivitas stimulasi, rentang usia, dan akses admin.

## Stack

- Vue 3 + Nuxt 3
- Nitro server API
- Supabase module ready for integration
- Vercel deployment preset

## Local Setup

```bash
yarn install
yarn dev
```

Build production:

```bash
yarn build
yarn preview
```

## Environment Variables

Copy `.env.example` to `.env` and fill the values when Supabase integration is enabled.

```bash
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SEED_PASSWORD=TumbuhTahuAdmin#2026
```

## Seed Admin Users

Development seed includes 5 admin users:

| Email | Role | Password |
| --- | --- | --- |
| owner@tumbuhtahu.test | owner | `TumbuhTahuAdmin#2026` |
| growth@tumbuhtahu.test | admin | `TumbuhTahuAdmin#2026` |
| content@tumbuhtahu.test | editor | `TumbuhTahuAdmin#2026` |
| clinic@tumbuhtahu.test | admin | `TumbuhTahuAdmin#2026` |
| support@tumbuhtahu.test | editor | `TumbuhTahuAdmin#2026` |

In production, create these users in Supabase Auth, then map the roles into `public.app_roles`.

## API Contract

Admin APIs return:

```ts
{
  Data: T | null,
  Error: string | object | null,
  status: number | "success" | "error"
}
```

## Data Control

The dashboard exposes CRUD controls for:

- `milestones`
- `education`
- `activities`
- `ageRanges`
- `adminUsers`

Each category supports CSV template download and bulk insert from the UI. Templates are category-specific and available from the toolbar on each table.

## Vercel

This app includes `vercel.json` and Nuxt Nitro is configured with `preset: "vercel"`.

Deploy command:

```bash
yarn build
```

Output directory:

```bash
.output
```
