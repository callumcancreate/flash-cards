import client from "../db";
import Resource from "./Resource";
import CategoryType from "../../types/Category";
import { CategorySchema } from "../Schemas/Category";

export default class Category extends Resource {
  name: string;
  id?: number;
  static schema = CategorySchema;

  constructor(props: CategoryType) {
    super(props);
  }

  async _insert() {
    const { rows, rowCount } = await client.query(
      `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING category_id "id"
      `,
      [this.name]
    );
    if (!rowCount) throw new Error("Something went wrong");
    this.id = rows[0].id;
    return this;
  }

  async _put() {
    const { rowCount } = await client.query(
      `
        UPDATE categories
        SET name = $1
        WHERE category_id = $2
      `,
      [this.name, this.id]
    );
    if (!rowCount) throw new Error("Something went wrong");
    return this;
  }
}
