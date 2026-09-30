-- V1 Travel database foundation.
-- Designed for Postgres. IDs are text so this can also be mirrored by a simple local adapter during early MVP work.

create table customers (
  id text primary key,
  full_name text,
  email text,
  phone text,
  preferred_locale text not null default 'zh',
  account_status text not null default 'guest' check (account_status in ('guest', 'invited', 'active', 'disabled')),
  created_at timestamptz not null default now()
);

create table staff_users (
  id text primary key,
  full_name text not null,
  role text not null check (role in ('admin', 'manager', 'advisor', 'operations', 'viewer')),
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table auth_identities (
  id text primary key,
  user_type text not null check (user_type in ('customer', 'staff')),
  customer_id text references customers(id),
  staff_user_id text references staff_users(id),
  email text not null unique,
  password_hash text,
  email_verified_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (user_type = 'customer' and customer_id is not null and staff_user_id is null)
    or
    (user_type = 'staff' and staff_user_id is not null and customer_id is null)
  )
);

create table staff_invitations (
  id text primary key,
  email text not null,
  role text not null check (role in ('admin', 'manager', 'advisor', 'operations', 'viewer')),
  invited_by text not null references staff_users(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table role_permissions (
  role text not null,
  permission text not null,
  primary key (role, permission)
);

create table travel_cases (
  id text primary key,
  customer_id text references customers(id),
  owner_id text references staff_users(id),
  source text not null check (source in ('homepage', 'live_chat', 'staff', 'referral')),
  status text not null check (status in ('new', 'planning', 'quoted', 'accepted', 'paid', 'booked', 'traveling', 'completed', 'cancelled')),
  trip_type text,
  destination text,
  departure_date date,
  return_date date,
  travelers int not null default 1,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quotes (
  id text primary key,
  case_id text not null references travel_cases(id),
  status text not null check (status in ('draft', 'sent', 'accepted', 'expired', 'cancelled')),
  title text not null,
  currency text not null default 'EUR',
  total_amount numeric(12,2) not null default 0,
  explanation text,
  valid_until date,
  created_at timestamptz not null default now()
);

create table orders (
  id text primary key,
  case_id text not null references travel_cases(id),
  quote_id text references quotes(id),
  status text not null check (status in ('awaiting_payment', 'payment_received', 'booking_in_progress', 'booked', 'cancelled', 'refunded')),
  paid_at timestamptz,
  booked_at timestamptz,
  created_at timestamptz not null default now()
);

create table trips (
  id text primary key,
  case_id text not null references travel_cases(id),
  status text not null check (status in ('upcoming', 'traveling', 'completed', 'disrupted', 'cancelled')),
  destination text not null,
  starts_on date not null,
  ends_on date,
  next_step text,
  support_priority text not null default 'normal' check (support_priority in ('normal', 'watch', 'urgent')),
  created_at timestamptz not null default now()
);

create table conversations (
  id text primary key,
  case_id text references travel_cases(id),
  customer_id text references customers(id),
  status text not null check (status in ('open', 'waiting_guest', 'waiting_staff', 'closed')),
  channel text not null check (channel in ('live_chat', 'email', 'phone', 'wechat', 'staff_note')),
  assigned_to text references staff_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id text primary key,
  conversation_id text not null references conversations(id),
  sender_type text not null check (sender_type in ('guest', 'customer', 'staff', 'system')),
  sender_id text,
  body text,
  attachment_count int not null default 0,
  created_at timestamptz not null default now()
);

create table attachments (
  id text primary key,
  message_id text references messages(id),
  filename text not null,
  mime_type text not null,
  storage_key text not null,
  byte_size int not null,
  created_at timestamptz not null default now()
);

create index travel_cases_status_idx on travel_cases(status);
create index conversations_status_idx on conversations(status);
create index trips_status_idx on trips(status, starts_on);
create index staff_invitations_status_idx on staff_invitations(status, expires_at);
