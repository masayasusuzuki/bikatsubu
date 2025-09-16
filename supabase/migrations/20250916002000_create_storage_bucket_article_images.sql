-- Create a public bucket for article images if it doesn't exist
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'article-images') then
    insert into storage.buckets (id, name, public)
    values ('article-images', 'article-images', true);
  end if;
end $$;

-- Enable RLS on storage.objects (should already be enabled by default)
alter table if exists storage.objects enable row level security;

-- Policies: Public read, authenticated insert/update/delete for this bucket
drop policy if exists "article-images: public can read" on storage.objects;
create policy "article-images: public can read"
on storage.objects for select
using (bucket_id = 'article-images');

drop policy if exists "article-images: authenticated can insert" on storage.objects;
create policy "article-images: authenticated can insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'article-images' and owner = auth.uid());

drop policy if exists "article-images: owner can update" on storage.objects;
create policy "article-images: owner can update"
on storage.objects for update to authenticated
using (bucket_id = 'article-images' and owner = auth.uid())
with check (bucket_id = 'article-images' and owner = auth.uid());

drop policy if exists "article-images: owner can delete" on storage.objects;
create policy "article-images: owner can delete"
on storage.objects for delete to authenticated
using (bucket_id = 'article-images' and owner = auth.uid());


