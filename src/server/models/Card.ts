import client from "../db";
import Resource from "./Resource";
import CardType from "../../types/Card";
import { CardSchema } from "../Schemas/Card";
import NamedError from "./NamedError";
import { validateSchema, camelToSnake } from "../../utils";

export default class Card extends Resource {
  cardId?: number;
  tags?: string[];
  front: string;
  back: string;
  hint?: string;
  static schema = CardSchema;

  constructor(props: CardType) {
    super(props);
  }

  async _insert() {
    const { tags, front, back, hint } = this;
    try {
      await client.query("BEGIN");

      const cardInsertQuery = await client.query(
        `
        INSERT INTO cards (front, back, hint)
        VALUES ($1, $2, $3)
        RETURNING card_id
      `,
        [front, back, hint]
      );
      if (!cardInsertQuery.rowCount) throw new Error("Something went wrong");
      const cardId = cardInsertQuery.rows[0].card_id;

      const tagQueries = tags.map(async tag => {
        const { rowCount } = await client.query(
          `
            WITH st AS (
              SELECT tag_id FROM tags WHERE tag = $1
            ), it AS (
              INSERT INTO tags(tag)
              SELECT $1
              WHERE NOT EXISTS (SELECT 1 FROM st)
              RETURNING tag_id
            ), tid AS (
              SELECT tag_id
              FROM it UNION SELECT tag_id FROM st
            )
            INSERT INTO card_tags (card_id, tag_id)
            SELECT $2, tid.tag_id
            FROM tid
            RETURNING card_id, tag_id
          `,
          [tag, cardId]
        );
        if (!rowCount) throw new Error("Something went wrong");
      });
      await Promise.all(tagQueries);
      await client.query("COMMIT");
      this.cardId = cardId;
      return this;
    } catch (e) {
      console.log(e);
      await client.query("ROLLBACK");
      throw e;
    }
  }

  async _put() {
    try {
      await client.query("BEGIN");
      const { tags, front, back, hint, cardId } = this;
      const cardUpdateQuery = await client.query(
        `
        UPDATE cards
        SET
          front = $1,
          back = $2,
          hint = $3
        WHERE card_id = $4
      `,
        [front, back, hint, cardId]
      );
      if (!cardUpdateQuery.rowCount) throw new Error("Something went wrong");

      const tagQueries = tags.map(async tag => {
        const { rowCount } = await client.query(
          `
            WITH st AS (
              SELECT tag_id FROM tags WHERE tag = $1
            ), it AS (
              INSERT INTO tags(tag)
              SELECT $1
              WHERE NOT EXISTS (SELECT 1 FROM st)
              RETURNING tag_id
            ), tid AS (
              SELECT tag_id
              FROM it UNION SELECT tag_id FROM st
            ), sct AS (
              SELECT ct.card_id, ct.tag_id FROM card_tags ct, tid
              WHERE card_id = $2 AND ct.tag_id = tid.tag_id
            ), ict AS (
              INSERT INTO card_tags (card_id, tag_id)
              SELECT $2, tid.tag_id
              FROM tid
              WHERE NOT EXISTS (SELECT 1 FROM sct)
              RETURNING card_id, tag_id
            )
            SELECT * FROM sct UNION ALL SELECT * FROM ict
          `,
          [tag, cardId]
        );
        if (!rowCount) throw new NamedError("Server", "Something went wrong");
      });
      await client.query(
        `
        WITH ts AS (
          SELECT UNNEST ($1) AS tag
        ), tids AS (
        SELECT tag_id FROM ts JOIN tags ON tags.tag = ts.tag
        )
        DELETE FROM card_tags ct USING 
          card_tags ct2
          left join tids on tids.tag_id = ct2.tag_id 
        WHERE 
          tids.tag_id IS NULL
          AND ct.tag_id = ct2.tag_id 

        `,
        [tags]
      );
      await Promise.all(tagQueries);
      await client.query("COMMIT");

      return this;
    } catch (e) {
      await client.query("ROLLBACK");
      console.log(e);
      throw e;
    }
  }

  static async find(filter, options?) {
    const { value } = validateSchema(filter, CardSchema);
    const conditions = Object.keys(value)
      .map((key, i) => `${camelToSnake(key)} = $${i + 1}`)
      .join(" AND ");

    // with ts as (
    //   select unnest(array['tag1','tag2']) as tag
    // ), tids as (
    //   select ts.tag, tags.tag_id from ts left join tags on ts.tag = tags.tag
    // )
    // select ct.card_id, tids.tag from card_tags ct left join tids on ct.tag_id = tids.tag_id

    const { rows } = await client.query(
      `
        SELECT category_id "categoryId", card_id "cardId", front, back, hint
        FROM cards
        WHERE ${conditions}
        ORDER BY card_id DESC
      `,
      Object.values(value)
    );
    return rows.map(c => new Card(c));
  }

  async delete() {
    const { rowCount } = await client.query(
      `
        DELETE FROM cards
        card_id = $1
      `,
      [this.cardId]
    );
    if (!rowCount) throw new NamedError("Server", "Something went wrong");
    return rowCount;
  }
}
