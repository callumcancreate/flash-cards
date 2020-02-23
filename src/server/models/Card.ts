import client from "../db";
import Resource from "./Resource";
import CardType from "../../types/Card";
import { CardSchema } from "../Schemas/Card";
import NamedError from "./NamedError";
import { validateSchema, camelToSnake } from "../../utils";

export default class Card extends Resource {
  cardId?: number;
  categoryId?: number;
  front: string;
  back: string;
  hint?: string;
  static schema = CardSchema;

  constructor(props: CardType) {
    super(props);
  }

  async _insert() {
    if (!this.categoryId)
      throw new NamedError("Client", 'Missing property "CategoryId"');
    const { categoryId, front, back, hint } = this;
    const { rows, rowCount } = await client.query(
      `
        INSERT INTO cards (category_id, front, back, hint)
        VALUES ($1, $2, $3, $4)
        RETURNING card_id "cardId"
      `,
      [categoryId, front, back, hint]
    );
    if (!rowCount) throw new Error("Something went wrong");
    this.cardId = rows[0].cardId;
    return this;
  }

  async _put() {
    const { categoryId, front, back, hint, cardId } = this;
    const { rowCount } = await client.query(
      `
        UPDATE cards
        SET
          category_id = $1,
          front = $2,
          back = $3,
          hint = $4
        WHERE card_id = $5
      `,
      [categoryId, front, back, hint, cardId]
    );
    if (!rowCount) throw new Error("Something went wrong");
    return this;
  }

  static async find(filter, options?) {
    const { value } = validateSchema(filter, CardSchema);
    const conditions = Object.keys(value)
      .map((key, i) => `${camelToSnake(key)} = $${i + 1}`)
      .join(" AND ");

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
        WHERE category_id = $1 AND card_id = $2
      `,
      [this.categoryId, this.cardId]
    );
    if (!rowCount) throw new NamedError("Server", "Something went wrong");
    return rowCount;
  }
}
