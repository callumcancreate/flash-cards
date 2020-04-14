CREATE TABLE IF NOT EXISTS public.users (
  "user_id" serial PRIMARY KEY,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "first_name" text,
  "last_name" text,
  "is_verified" boolean DEFAULT FALSE,
  "is_deleted" boolean DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  "token" text PRIMARY KEY NOT NULL,
  "user_id" int REFERENCES users ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tags (
  "tag_id" serial PRIMARY KEY,
  "tag" text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cards (
  "card_id" serial PRIMARY KEY NOT NULL,
  "front" text NOT NULL,
  "back" text NOT NULL,
  "hint" text
);

CREATE TABLE IF NOT EXISTS public.card_tags (
  "card_id" int REFERENCES cards ON DELETE CASCADE,
  "tag_id" int REFERENCES tags ON DELETE CASCADE
);

-- A category is a named collection of tags
CREATE TABLE IF NOT EXISTS public.categories (
  "category_id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "parent_id" int REFERENCES categories ON DELETE CASCADE,
  CONSTRAINT unique_name UNIQUE (name, parent_id)
);

CREATE TABLE IF NOT EXISTS public.category_tags (
  "category_id" int REFERENCES categories ON DELETE CASCADE,
  "tag_id" int REFERENCES tags ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_name_null_parent ON public.categories (name)
WHERE
  parent_id IS NULL;

