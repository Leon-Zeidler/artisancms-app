alter table if exists public.profiles
  add column if not exists industry text check (industry in (
    'maler',
    'fliesenleger',
    'tischler',
    'dachdecker',
    'galabau',
    'sonstiges'
  )) default 'sonstiges';

update public.profiles
set industry = 'sonstiges'
where industry is null;
