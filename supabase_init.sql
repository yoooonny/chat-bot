-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text, 
  metadata jsonb,
  embedding vector(3072) -- gemini-embedding-001 output dimension
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Create a storage bucket for raw files
insert into storage.buckets (id, name, public) values ('files', 'files', false);
