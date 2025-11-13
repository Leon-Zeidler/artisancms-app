-- Add industry column with safe defaults
alter table if exists public.profiles
  add column if not exists industry text;

-- Ensure allowed values and default
alter table if exists public.profiles
  alter column industry set default 'sonstiges';

update public.profiles
  set industry = 'sonstiges'
  where industry is null;

alter table if exists public.profiles
  alter column industry set not null;

alter table if exists public.profiles
  drop constraint if exists profiles_industry_check;

alter table if exists public.profiles
  add constraint profiles_industry_check
  check (industry in ('maler','fliesenleger','tischler','dachdecker','galabau','sonstiges'));

-- Hero fields for industry templates
alter table if exists public.profiles
  add column if not exists hero_title text;

alter table if exists public.profiles
  add column if not exists hero_subtitle text;

update public.profiles
  set hero_title = coalesce(hero_title, business_name),
      hero_subtitle = coalesce(hero_subtitle, about_text)
  where hero_title is null or hero_subtitle is null;
