-- Create notes table
create table if not exists public.notes (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text,
    is_public boolean default false,
    user_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notes enable row level security;

-- Create policies
-- 1. Users can read their own notes
create policy "Users can read their own notes"
    on public.notes for select
    using (auth.uid() = user_id);

-- 2. Users can read public notes
create policy "Users can read public notes"
    on public.notes for select
    using (is_public = true);

-- 3. Users can insert their own notes
create policy "Users can insert their own notes"
    on public.notes for insert
    with check (auth.uid() = user_id);

-- 4. Users can update their own notes
create policy "Users can update their own notes"
    on public.notes for update
    using (auth.uid() = user_id);

-- 5. Users can delete their own notes
create policy "Users can delete their own notes"
    on public.notes for delete
    using (auth.uid() = user_id);

-- 6. Admins can read all notes
create policy "Admins can read all notes"
    on public.notes for select
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and users.role = 'admin'
        )
    );

-- 7. Admins can delete any note
create policy "Admins can delete any note"
    on public.notes for delete
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and users.role = 'admin'
        )
    );

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.notes
    for each row
    execute function public.handle_updated_at(); 