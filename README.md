# Tumbuh-Tahu-Admin-App

Nuxt admin panel untuk mengontrol data yang digunakan oleh Tumbuh Tahu App: milestone perkembangan, materi edukasi, aktivitas stimulasi, rentang usia, dan akses admin.

## Stack

- Vue 3 + Nuxt 3
- Nitro server API
- Supabase server client for production data control
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
ADMIN_SESSION_SECRET=change-this-before-production
```

## Seed Admin Users

Login is required before opening the admin panel. In production, login uses Supabase Auth and only users mapped in `public.app_roles` can enter the admin panel.

Development fallback seed is only used when Supabase env variables are not configured and `NODE_ENV` is not `production`:

| Email | Role | Password |
| --- | --- | --- |
| owner@tumbuhtahu.test | owner | `TumbuhTahuAdmin#2026` |
| growth@tumbuhtahu.test | admin | `TumbuhTahuAdmin#2026` |
| content@tumbuhtahu.test | editor | `TumbuhTahuAdmin#2026` |
| clinic@tumbuhtahu.test | admin | `TumbuhTahuAdmin#2026` |
| support@tumbuhtahu.test | editor | `TumbuhTahuAdmin#2026` |

In production, create admin users in Supabase Auth, then map the roles into `public.app_roles`.

`ADMIN_SESSION_SECRET` must be changed in production. Use a long random value.

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

When `NUXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured, the admin API reads and writes the real Supabase tables:

- `public.milestones`
- `public.education_materials`
- `public.stimulation_activities`
- `public.age_ranges`
- `public.app_roles`
- `public.user_profiles`
- `auth.users` for admin email lookup

Without those variables, the app falls back to in-memory seed data for local UI preview only. In production/Vercel, missing Supabase variables fail the API instead of returning seed data, so production cannot accidentally show mock data.

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
