# The Glasshouse — Setup Guide

A step-by-step guide to get the app running locally, connected to Supabase,
deployed on Vercel, and version-controlled on GitHub.

---

## What you'll set up

```
GitHub repo  ──push──►  Vercel (auto-deploys)
                              │
                    React app (Vite)
                              │
                    Supabase (Postgres + Storage)
                    ├── plants table (your JSON data)
                    └── plant-images bucket (your photos)
```

---

## Step 1 — Create the GitHub repo

1. Go to github.com → **New repository**
2. Name it `glasshouse` (or anything you like)
3. Set it to **Private** or Public — your call
4. **Do not** initialize with a README (you already have files)
5. Copy the repo URL (e.g. `https://github.com/yourname/glasshouse.git`)

Then in your terminal, inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourname/glasshouse.git
git push -u origin main
```

---

## Step 2 — Create a Supabase project

1. Go to **supabase.com** → Sign up / Log in
2. Click **New Project**
3. Choose a name (e.g. `glasshouse`), set a strong database password, pick a region close to you
4. Wait ~2 minutes for the project to provision

### Get your API keys

In your Supabase project dashboard:
- Go to **Project Settings → API**
- Copy:
  - **Project URL** → `https://xxxx.supabase.co`
  - **anon / public** key (the long JWT string)

---

## Step 3 — Run the database schema

1. In Supabase dashboard → **SQL Editor** → **New query**
2. Open `schema.sql` from this project
3. Paste the entire contents and click **Run**

This creates:
- The `plants` table with all your columns
- Row Level Security policies (open for now, lock down with Auth later)
- The `plant-images` storage bucket with public read access

---

## Step 4 — Set up your local environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here
```

> ⚠️ `.env.local` is in `.gitignore` — it will never be committed to GitHub.
> Your keys are safe.

---

## Step 5 — Install dependencies and run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173** — the app should load and connect to Supabase.

If you see a "Connection Error" screen, double-check your `.env.local` values.

---

## Step 6 — Upload your existing images to Supabase Storage

### Option A — Through the app (recommended)

When adding or editing a plant, use the image upload widget in the form.
It uploads directly to the `plant-images` bucket and saves the public URL.

### Option B — Bulk upload via Supabase dashboard

1. Dashboard → **Storage** → `plant-images` bucket
2. Click **Upload files** and select your images
3. After uploading, click each file → **Get URL** → copy the public URL
4. Paste those URLs into each plant's `image` field when adding plants

### Option C — Import local images in development only

If you just want to test locally with your image folder before uploading:
- Put your images in `public/images/` in this project
- Reference them as `/images/your-photo.jpg` in the image URL field
- These will work locally but won't show up in production until you upload to Supabase Storage

---

## Step 7 — Import your existing JSON plant data

### Option A — Add plants one at a time via the app

Use **+ Add Plant** → search by scientific name → Claude auto-fills → review → save.
This is the cleanest approach for a plant at a time.

### Option B — Bulk import via SQL

If you have many plants in your existing JSON file, you can insert them directly
in the Supabase SQL Editor. Your JSON fields map to columns like this:

| Your JSON field     | Supabase column   | Type    |
|---------------------|-------------------|---------|
| `id`                | `id`              | text    |
| `scientificName`    | `scientific_name` | text    |
| `commonNames`       | `common_names`    | text[]  |
| `etymology`         | `etymology`       | text    |
| `history`           | `history`         | text    |
| `description`       | `description`     | text    |
| `tags`              | `tags`            | text[]  |
| `image`             | `image`           | text    |
| `care`              | `care`            | jsonb   |
| `watering`          | `watering`        | jsonb   |
| `light`             | `light`           | jsonb   |
| `medium`            | `medium`          | jsonb   |
| `propagation`       | `propagation`     | jsonb   |
| `gardening`         | `gardening`       | jsonb   |
| `toxicity`          | `toxicity`        | jsonb   |
| `temperature`       | `temperature`     | jsonb   |

Example SQL insert:
```sql
insert into plants (id, scientific_name, common_names, description, tags, image, care, watering, light, medium, propagation, gardening, toxicity, temperature)
values (
  'monstera-deliciosa',
  'Monstera deliciosa',
  array['Monstera', 'Swiss Cheese Plant'],
  'A tropical statement plant.',
  array['tropical', 'easy care'],
  'https://xxxx.supabase.co/storage/v1/object/public/plant-images/monstera.jpg',
  '{"description":"Forgiving grower","tips":["Rotate quarterly"],"commonIssues":"Yellow leaves = overwatering","detail":"Allow top 2in to dry."}'::jsonb,
  '{"frequency":"Every 1-2 weeks","detail":"Reduce in winter","tips":[]}'::jsonb,
  '{"idealHours":"6-8 indirect","detail":"Avoid direct sun","tips":[]}'::jsonb,
  '{"detail":"Well-draining mix + perlite","tips":[]}'::jsonb,
  '{"detail":"Stem cuttings with a node","tips":[]}'::jsonb,
  '{"description":"","tips":[],"startIndoors":"","startOutdoors":"","plantingSeason":""}'::jsonb,
  '{"description":"Toxic to cats and dogs"}'::jsonb,
  '{"idealRange":"65-85°F","description":"Avoid below 55°F"}'::jsonb
);
```

---

## Step 8 — Deploy to Vercel

1. Go to **vercel.com** → Sign up / Log in with your GitHub account
2. Click **Add New Project** → Import your `glasshouse` GitHub repo
3. Vercel auto-detects it as a Vite project — no config needed
4. Before deploying, add your environment variables:
   - Click **Environment Variables**
   - Add `VITE_SUPABASE_URL` → your Supabase project URL
   - Add `VITE_SUPABASE_ANON_KEY` → your anon key
   - Add `VITE_ANTHROPIC_API_KEY` → your Anthropic key
5. Click **Deploy**

From now on, every `git push` to `main` triggers an automatic redeploy.

---

## Step 9 — Share with other users

Once deployed on Vercel, anyone with the URL can:
- Browse all plants
- Add new plants (search → auto-fill → save)
- Upload images
- Manage their own greenhouse (stored in their browser's localStorage)

### Locking it down later (optional)

When you're ready to add proper user accounts:
1. Enable **Supabase Auth** (supports Google, GitHub, email/password)
2. Update the Row Level Security policies in `schema.sql` to restrict
   writes to authenticated users only
3. Store greenhouse selections in a `greenhouse` table instead of localStorage
   so they persist across devices

---

## Project file overview

```
glasshouse/
├── public/
│   └── images/          ← local dev images go here (optional)
├── src/
│   ├── main.jsx         ← React entry point
│   ├── App.jsx          ← full application (all components)
│   └── supabase.js      ← database client + all data functions
├── .env.example         ← copy to .env.local and fill in
├── .env.local           ← your secrets (never committed)
├── .gitignore
├── index.html
├── package.json
├── schema.sql           ← run this in Supabase SQL Editor
├── vite.config.js
└── SETUP.md             ← this file
```

---

## Quick reference commands

```bash
npm install        # install dependencies
npm run dev        # start local dev server (localhost:5173)
npm run build      # build for production
npm run preview    # preview production build locally
```

---

## Troubleshooting

**"Connection Error" on load**
→ Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**AI search not working**
→ Check `VITE_ANTHROPIC_API_KEY` is set correctly

**Images not loading**
→ Make sure the `plant-images` bucket is set to **public** in Supabase Storage settings

**Plants not saving**
→ Check the Row Level Security policies were created by running `schema.sql`

**Vercel deploy shows blank page**
→ Check that all three environment variables are added in Vercel project settings
