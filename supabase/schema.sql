-- Extensões úteis
create extension if not exists "pgcrypto";

-- Tabela de perfis ligada ao auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 50,
  price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type appointment_status as enum ('booked', 'cancelled', 'completed');

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id),
  instructor_id uuid not null references public.instructors(id),
  appointment_date date not null,
  appointment_time time not null,
  notes text,
  status appointment_status not null default 'booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Cliente'));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger appointments_updated_at
before update on public.appointments
for each row execute procedure public.touch_updated_at();

-- View para listagem amigável no frontend
create or replace view public.appointments_view as
select
  a.id,
  a.user_id,
  s.name as service_name,
  i.name as instructor_name,
  a.appointment_date,
  to_char(a.appointment_time, 'HH24:MI') as appointment_time,
  a.status
from public.appointments a
join public.services s on s.id = a.service_id
join public.instructors i on i.id = a.instructor_id
where a.status = 'booked';

-- RLS
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.instructors enable row level security;
alter table public.appointments enable row level security;

create policy "users read own profile" on public.profiles
for select using (auth.uid() = id);

create policy "users update own profile" on public.profiles
for update using (auth.uid() = id);

create policy "public read services" on public.services
for select using (true);

create policy "public read instructors" on public.instructors
for select using (true);

create policy "users read own appointments" on public.appointments
for select using (auth.uid() = user_id);

create policy "users create own appointments" on public.appointments
for insert with check (auth.uid() = user_id);

create policy "users update own appointments" on public.appointments
for update using (auth.uid() = user_id);

-- Permite inserir user_id automaticamente no frontend
create or replace function public.set_appointment_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_set_appointment_user
before insert on public.appointments
for each row execute procedure public.set_appointment_user_id();

-- Seed inicial (opcional)
insert into public.services (name, description, duration_minutes, price)
values
('Pilates Solo', 'Acompanhamento individual personalizado.', 50, 45.00),
('Pilates Máquinas', 'Sessões com Reformer e Cadillac.', 50, 55.00),
('Aulas em Grupo', 'Grupos pequenos com foco técnico.', 55, 22.00)
on conflict do nothing;

insert into public.instructors (name, bio)
values
('Gisela Matos', 'Instrutora principal com foco em reabilitação e postura.'),
('Carla Nunes', 'Especialista em aulas de grupo e mobilidade funcional.')
on conflict do nothing;
