import client from "../db";
import Resource from "./Resource";
import CardType from "../../types/Card";
import { CardSchema } from "../Schemas/Card";
import NamedError from "./NamedError";

export default class Card extends Resource {
  id?: number;
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
        RETURNING card_id "id"
      `,
      [categoryId, front, back, hint]
    );
    if (!rowCount) throw new Error("Something went wrong");
    this.id = rows[0].id;
    return this;
  }

  async _put() {
    const { categoryId, front, back, hint, id } = this;
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
      [categoryId, front, back, hint, id]
    );
    if (!rowCount) throw new Error("Something went wrong");
    return this;
  }
}
