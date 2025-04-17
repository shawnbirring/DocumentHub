-- documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text,
  file_url text,
  search_vector tsvector,
  created_at timestamp default now()
);

-- keywords table
create table keywords (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  keyword text,
  frequency int
);
