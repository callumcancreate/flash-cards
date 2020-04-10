import path from "path";
import fs from "fs";
import pool from "../src/server/db";
import { categories, cards, tags } from "./mock-data";

// Verify using test database
export const connect = async () => {
  const client = await pool.connect();
  const { rows } = await pool.query("SELECT current_database()");
  const dbName = rows[0].current_database;

  if (
    dbName !== process.env.TEST_DATABASE ||
    (process.env.PGDATABASE && dbName === process.env.PGDATABASE)
  ) {
    await client.release();
    throw new Error("Tests are using wrong database");
  }

  return client;
};

// Init tables based on db-scripts
export const initTables = async (client) => {
  await client.query("DROP SCHEMA public CASCADE");
  await client.query("CREATE SCHEMA public");
  const tableScripts = fs
    .readFileSync(
      path.resolve(__dirname, "../db-scripts/01-tables.sql"),
      "utf8"
    )
    .toString()
    .split(";");
  await Promise.all(tableScripts.map(async (sql) => await client.query(sql)));
};

export const seedData = async (client) => {
  // Add tags
  await Promise.all(
    Object.values(tags).map(
      async ({ tag }) =>
        await client.query("INSERT INTO tags (tag) VALUES ($1)", [tag])
    )
  );
  // Add cards
  await Promise.all(
    Object.values(cards).map(async (card) => {
      await client.query(
        "INSERT INTO cards (front, back, hint) VALUES ($1, $2, $3)",
        [card.front, card.back, card.hint]
      );
      await Promise.all(
        card.tags.map(
          async (tag) =>
            await client.query("INSERT INTO card_tags VALUES ($1, $2)", [
              card.cardId,
              tag.tagId,
            ])
        )
      );
    })
  );

  // Add categories
  await Promise.all(
    Object.values(categories).map(async (cat: any) => {
      await client.query(
        "INSERT INTO categories (name, parent_id) VALUES ($1, $2)",
        [cat.name, cat.parentId]
      );
      await Promise.all(
        cat.tags.map(
          async (tag) =>
            await client.query("INSERT INTO category_tags VALUES ($1, $2)", [
              cat.categoryId,
              tag.tagId,
            ])
        )
      );
    })
  );
};
