create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'tester', 'viewer')),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.test_cases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  module text not null,
  test_case_id text not null,
  title text not null,
  preconditions text,
  test_steps text not null,
  expected_result text not null,
  actual_result text,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Not Run' check (status in ('Not Run', 'Pass', 'Fail', 'Blocked')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (project_id, test_case_id)
);

create table if not exists public.bugs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  bug_id text not null,
  bug_title text not null,
  module_feature text not null,
  test_steps text not null,
  expected_result text not null,
  actual_result text not null,
  severity text not null default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Fixed', 'Closed', 'Rejected')),
  proof_url text,
  proof_file_path text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (project_id, bug_id)
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_members_user on public.organization_members(user_id);
create index if not exists idx_projects_org on public.projects(organization_id);
create index if not exists idx_test_cases_org_project on public.test_cases(organization_id, project_id);
create index if not exists idx_bugs_org_project on public.bugs(organization_id, project_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

drop trigger if exists set_test_cases_updated_at on public.test_cases;
create trigger set_test_cases_updated_at before update on public.test_cases for each row execute function public.set_updated_at();

drop trigger if exists set_bugs_updated_at on public.bugs;
create trigger set_bugs_updated_at before update on public.bugs for each row execute function public.set_updated_at();

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.test_cases enable row level security;
alter table public.bugs enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "members can read organizations" on public.organizations;
create policy "members can read organizations" on public.organizations for select using (public.is_org_member(id) or owner_id = auth.uid());

drop policy if exists "authenticated users can create organizations" on public.organizations;
create policy "authenticated users can create organizations" on public.organizations for insert with check (auth.uid() = owner_id);

drop policy if exists "owners can update organizations" on public.organizations;
create policy "owners can update organizations" on public.organizations for update using (public.is_org_member(id)) with check (public.is_org_member(id));

drop policy if exists "members can read memberships" on public.organization_members;
create policy "members can read memberships" on public.organization_members for select using (public.is_org_member(organization_id) or user_id = auth.uid());

drop policy if exists "users can create own membership" on public.organization_members;
create policy "users can create own membership" on public.organization_members for insert with check (user_id = auth.uid());

drop policy if exists "members can manage projects" on public.projects;
create policy "members can manage projects" on public.projects for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "members can manage test cases" on public.test_cases;
create policy "members can manage test cases" on public.test_cases for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "members can manage bugs" on public.bugs;
create policy "members can manage bugs" on public.bugs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "users can manage own profile" on public.user_profiles;
create policy "users can manage own profile" on public.user_profiles for all using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.organizations (name, owner_id, plan)
  values (coalesce(new.raw_user_meta_data->>'workspace_name', 'My Workspace'), new.id, 'free')
  returning id into org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (org_id, new.id, 'owner')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('bug-proofs', 'bug-proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "authenticated users can upload bug proofs" on storage.objects;
create policy "authenticated users can upload bug proofs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'bug-proofs');

drop policy if exists "authenticated users can read bug proofs" on storage.objects;
create policy "authenticated users can read bug proofs"
on storage.objects for select
to authenticated
using (bucket_id = 'bug-proofs');

drop policy if exists "authenticated users can update own bug proofs" on storage.objects;
create policy "authenticated users can update own bug proofs"
on storage.objects for update
to authenticated
using (bucket_id = 'bug-proofs')
with check (bucket_id = 'bug-proofs');

drop policy if exists "authenticated users can delete bug proofs" on storage.objects;
create policy "authenticated users can delete bug proofs"
on storage.objects for delete
to authenticated
using (bucket_id = 'bug-proofs');
