-- Create profiles table linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- Helper function to check admin
create or replace function is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from profiles p
    where p.id = uid and p.is_admin = true
  );
$$;

-- RLS for profiles
alter table profiles enable row level security;

-- Allow users to view their own profile; admins can view all
create policy "profiles: users can view own or admins view all"
on profiles for select
using (auth.uid() = id or is_admin(auth.uid()));

-- Allow users to insert their own profile row (id must match); admins can insert any
create policy "profiles: users can insert own or admins insert"
on profiles for insert
with check (auth.uid() = id or is_admin(auth.uid()));

-- Allow users to update their own profile; admins can update all
create policy "profiles: users can update own or admins update"
on profiles for update
using (auth.uid() = id or is_admin(auth.uid()))
with check (auth.uid() = id or is_admin(auth.uid()));

-- Articles: set author_id automatically to current user if not provided
create or replace function set_author_on_insert()
returns trigger as $$
begin
  if new.author_id is null then
    new.author_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_articles_author_before_insert on articles;
create trigger set_articles_author_before_insert
  before insert on articles
  for each row execute function set_author_on_insert();

-- Additional RLS policies for articles to use is_admin()
-- Allow authenticated users (owner) or admins to select their drafts as well
create policy "Articles: owner or admins can select all"
on articles for select to authenticated
using (auth.uid() = author_id or is_admin(auth.uid()));

-- Allow insert by owner or admin
create policy "Articles: owner or admins can insert"
on articles for insert to authenticated
with check (auth.uid() = author_id or is_admin(auth.uid()));

-- Allow update by owner or admin
create policy "Articles: owner or admins can update"
on articles for update to authenticated
using (auth.uid() = author_id or is_admin(auth.uid()))
with check (auth.uid() = author_id or is_admin(auth.uid()));

-- Allow delete by owner or admin
create policy "Articles: owner or admins can delete"
on articles for delete to authenticated
using (auth.uid() = author_id or is_admin(auth.uid()));


