create table if not exists public.symbol_metadata (
  symbol text primary key,
  company_name text null,
  exchange text null,
  logo_url text null,
  logo_source text null,
  provider_payload jsonb null,
  logo_updated_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint symbol_metadata_symbol_upper_check check (symbol = upper(symbol)),
  constraint symbol_metadata_symbol_not_blank_check check (length(trim(symbol)) > 0),
  constraint symbol_metadata_logo_url_https_check check (
    logo_url is null or logo_url ~ '^https://'
  )
);

create index if not exists symbol_metadata_logo_updated_at_idx
  on public.symbol_metadata (logo_updated_at);

comment on table public.symbol_metadata is
  'Server-side cache of normalized ticker/company metadata and logo URLs.';
comment on column public.symbol_metadata.symbol is
  'Normalized uppercase ticker symbol used as the cache key.';
comment on column public.symbol_metadata.logo_url is
  'Validated HTTPS company logo URL safe to send to UI clients.';
comment on column public.symbol_metadata.logo_source is
  'Provider name for the cached logo URL, for example finnhub.';
comment on column public.symbol_metadata.provider_payload is
  'Raw provider response retained server-side for diagnostics and future mapping.';
