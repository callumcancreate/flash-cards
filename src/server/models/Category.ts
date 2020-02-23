import client from "../db";
import Resource from "./Resource";
import CategoryType from "../../types/Category";
import { CategorySchema } from "../Schemas/Category";
import NamedError from "./NamedError";

export default class Category extends Resource {
  name: string;
  categoryId?: number;
  static schema = CategorySchema;

  constructor(props: CategoryType) {
    super(props);
  }

  static async findById(id) {
    const { rows, rowCount } = await client.query(
      `
        SELECT category_id "categoryId", name
        FROM categories
        WHERE category_id = $1
      `,
      [id]
    );

    if (!rowCount)
      throw new NamedError("NotFound", `Unable to find category with id ${id}`);
    return new Category(rows[0]);
  }

  static async find() {
    const { rows } = await client.query(`
      SELECT category_id "categoryId", name
      FROM categories
      ORDER BY category_id DESC
    `);
    return rows.map(c => new Category(c));
  }

  async _insert() {
    const { rows, rowCount } = await client.query(
      `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING category_id "categoryId"
      `,
      [this.name]
    );
    if (!rowCount) throw new Error("Something went wrong");
    this.categoryId = rows[0].categoryId;
    return this;
  }

  async _put() {
    const { rowCount } = await client.query(
      `
        UPDATE categories
        SET name = $1
        WHERE category_id = $2
      `,
      [this.name, this.categoryId]
    );
    if (!rowCount) throw new Error("Something went wrong");
    return this;
  }

  async delete() {
    const { rowCount } = await client.query(
      `
        DELETE FROM categories
        WHERE category_id = $1
      `,
      [this.categoryId]
    );
    if (!rowCount) throw new NamedError("Server", "Something went wrong");
    return rowCount;
  }
}
