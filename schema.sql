-- ============================================================
--  The Glasshouse — Supabase Database Schema
--  Run this entire file in the Supabase SQL Editor
--  (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================


-- ─── Plants Table ────────────────────────────────────────────────────────────
-- The plant data is stored as a flat row with JSONB columns for
-- nested objects (care, watering, light, etc.) so the full schema
-- is preserved exactly as your JSON without needing separate tables.

create table if not exists plants (
  id                text        primary key,           -- kebab-case, e.g. "monstera-deliciosa"
  scientific_name   text        not null,
  common_names      text[]      not null default '{}',
  etymology         text        not null default '',
  history           text        not null default '',
  description       text        not null default '',
  tags              text[]      not null default '{}',
  image             text        not null default '',   -- public URL (Supabase Storage or external)

  -- Nested objects stored as JSONB
  care              jsonb       not null default '{}',
  watering          jsonb       not null default '{}',
  light             jsonb       not null default '{}',
  medium            jsonb       not null default '{}',
  propagation       jsonb       not null default '{}',
  gardening         jsonb       not null default '{}',
  toxicity          jsonb       not null default '{}',
  temperature       jsonb       not null default '{}',

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists plants_updated_at on plants;
create trigger plants_updated_at
  before update on plants
  for each row execute function update_updated_at();


-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Currently open (anyone with the anon key can read/write).
-- When you add Supabase Auth, tighten these policies so only
-- authenticated users can insert/update/delete.

alter table plants enable row level security;

-- Allow anyone to read all plants
create policy "Public read" on plants
  for select using (true);

-- Allow anyone to insert/update/delete (open for now — lock down with Auth later)
create policy "Public write" on plants
  for all using (true) with check (true);


-- ─── Storage Bucket ──────────────────────────────────────────────────────────
-- Run this to create the public image storage bucket.
-- (You can also do this in Dashboard → Storage → New bucket)

insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do nothing;

-- Allow public reads from the bucket
create policy "Public image read" on storage.objects
  for select using (bucket_id = 'plant-images');

-- Allow anyone to upload (lock down with Auth later)
create policy "Public image upload" on storage.objects
  for insert with check (bucket_id = 'plant-images');

create policy "Public image update" on storage.objects
  for update using (bucket_id = 'plant-images');

create policy "Public image delete" on storage.objects
  for delete using (bucket_id = 'plant-images');


-- ─── Seed Data (optional — paste your plants here) ───────────────────────────
-- Example insert. The React app also seeds on first load if the table is empty,
-- so this is only needed if you want to pre-populate via SQL.

/*
insert into plants (
  id, scientific_name, common_names, description, tags, image,
  care, watering, light, medium, propagation, gardening, toxicity, temperature
) values (
  'monstera-deliciosa',
  'Monstera deliciosa',
  array['Monstera', 'Swiss Cheese Plant'],
  'A tropical statement plant with dramatic fenestrated leaves.',
  array['tropical', 'easy care', 'air-purifying'],
  'https://your-supabase-url.supabase.co/storage/v1/object/public/plant-images/monstera.jpg',
  '{"description": "Forgiving and vigorous.", "tips": ["Rotate quarterly"], "commonIssues": "Yellowing = overwatering", "detail": "Allow top 2in to dry."}'::jsonb,
  '{"frequency": "Every 1-2 weeks", "detail": "Reduce in winter.", "tips": []}'::jsonb,
  '{"idealHours": "6-8 indirect", "detail": "Avoid direct sun.", "tips": []}'::jsonb,
  '{"detail": "Well-draining mix + perlite.", "tips": []}'::jsonb,
  '{"detail": "Stem cuttings with a node.", "tips": []}'::jsonb,
  '{"description": "", "tips": [], "startIndoors": "", "startOutdoors": "", "plantingSeason": ""}'::jsonb,
  '{"description": "Toxic to cats and dogs."}'::jsonb,
  '{"idealRange": "65-85°F", "description": "Avoid below 55°F."}'::jsonb
);
*/
