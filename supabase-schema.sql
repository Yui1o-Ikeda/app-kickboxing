-- KICKLOGデータベーススキーマ
-- Supabaseの SQL Editor に貼り付けて実行してください

create table sessions (
  id text primary key,
  date text not null,
  status text not null,
  total_rounds integer not null default 0,
  round_breakdown jsonb default '[]'::jsonb,
  intensity integer default 3,
  comment text default '',
  trainer_id text default '',
  trainer_name text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table app_settings (
  id integer primary key default 1,
  monthly_fee integer default 17600,
  transport_cost integer default 380,
  target_sessions integer default 6,
  target_rounds integer default 50
);

-- 個人利用のためRLSは無効化
alter table sessions disable row level security;
alter table app_settings disable row level security;
