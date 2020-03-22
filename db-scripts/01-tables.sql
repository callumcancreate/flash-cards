DROP SCHEMA public CASCADE;

CREATE SCHEMA public;

CREATE TABLE public.tags (
  "tag_id" serial PRIMARY KEY,
  "tag" text UNIQUE NOT NULL
);

CREATE TABLE public.cards (
  "card_id" serial PRIMARY KEY NOT NULL,
  "front" text NOT NULL,
  "back" text NOT NULL,
  "hint" text
);

CREATE TABLE public.card_tags (
  "card_id" int REFERENCES cards ON DELETE CASCADE,
  "tag_id" int REFERENCES tags ON DELETE CASCADE
);

-- A category is a named collection of tags
CREATE TABLE public.categories (
  "category_id" serial PRIMARY KEY NOT NULL,
  "name" text UNIQUE NOT NULL,
  "parent_id" int REFERENCES categories ON DELETE CASCADE
);

CREATE TABLE public.category_tags (
  "category_id" int REFERENCES categories ON DELETE CASCADE,
  "tag_id" int REFERENCES tags ON DELETE CASCADE
);

