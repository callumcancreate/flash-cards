DROP SCHEMA public CASCADE;
CREATE SCHEMA public;


CREATE TABLE "categories"
(
  "category_id"   SERIAL PRIMARY KEY,
  "name"          TEXT NOT NULL
);


CREATE TABLE "cards"
(
  "card_id"         SERIAL PRIMARY KEY NOT NULL,
  "category_id"     INT NOT NULL REFERENCES categories ON DELETE CASCADE,
  "front"           TEXT NOT NULL,
  "back"            TEXT NOT NULL,
  "hint"            TEXT
);


CREATE TABLE "sub_categories"
(
  "sub_category_id" SERIAL PRIMARY KEY,
  "category_id"     INT REFERENCES categories ON DELETE CASCADE,
  "name"            TEXT NOT NULL
);


CREATE TABLE "sub_category_cards"
(
  "card_id"         INT REFERENCES cards,
  "sub_category_id" INT REFERENCES sub_categories ON DELETE CASCADE
);

