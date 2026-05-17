-- Optional Firebase/third-party identity bridge. Keep provider tokens out of frontend.
alter table public.profiles add column if not exists firebase_uid text unique;
alter table public.profiles add column if not exists auth_provider text default 'supabase';
create index if not exists profiles_firebase_uid_idx on public.profiles(firebase_uid) where firebase_uid is not null;
