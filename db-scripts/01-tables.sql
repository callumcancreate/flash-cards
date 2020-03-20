DROP SCHEMA public CASCADE;
CREATE SCHEMA public;


CREATE TABLE public.tags
(
  "tag_id"        SERIAL PRIMARY KEY,
  "tag"           TEXT UNIQUE NOT NULL
);


CREATE TABLE public.cards
(
  "card_id"         SERIAL PRIMARY KEY NOT NULL,
  "front"           TEXT NOT NULL,
  "back"            TEXT NOT NULL,
  "hint"            TEXT
);


CREATE TABLE  public.card_tags
(
  "card_id"       INT REFERENCES cards ON DELETE CASCADE,
  "tag_id"        INT REFERENCES tags ON DELETE CASCADE
);

-- A category is a named collection of tags
CREATE TABLE public.categories
(
  "category_id"   SERIAL PRIMARY KEY NOT NULL,
  "name"          TEXT UNIQUE NOT NULL,
  "parent_id"     INT REFERENCES categories ON DELETE CASCADE
);


CREATE TABLE public.category_tags
(
  "category_id"   INT REFERENCES categories ON DELETE CASCADE,
  "tag_id"        INT REFERENCES tags ON DELETE CASCADE
);