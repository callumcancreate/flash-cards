import client from "../db";
import Resource from "./Resource";
import CategoryType from "../../types/Category";
import { CategorySchema, CategoryFindOptions } from "../Schemas/Category";
import NamedError from "./NamedError";
import { validateSchema, camelToSnake } from "../../utils";

export default class Category extends Resource {
  categoryId?: number;
  parentId?: number;
  children?: Category[];
  name: string;
  tags: string[];

  static schema = CategorySchema;

  constructor(props: CategoryType) {
    super(props);
  }

  async _insert() {
    try {
      const { tags, name } = this;
      await client.query("BEGIN");
      const insertQuery = await client.query(
        `
        INSERT INTO categories (name) VALUES ($1)
        RETURNING category_id
      `,
        [name]
      );
      if (!insertQuery.rowCount) throw new Error("Something went wrong");

      const categoryId = insertQuery.rows[0].category_id;
      console.log("categoryId", categoryId);

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
            INSERT INTO category_tags (category_id, tag_id)
            SELECT $2, tid.tag_id
            FROM tid
            RETURNING category_id, tag_id
          `,
          [tag, categoryId]
        );
        if (!rowCount) throw new Error("Something went wrong");
      });
      await Promise.all(tagQueries);
      await client.query("COMMIT");
      this.categoryId = categoryId;
      console.log("this", this);
      return this;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }
  }

  async _put() {
    try {
      await client.query("BEGIN");
      const { tags, name, categoryId } = this;
      console.log("this", this);

      // Update category name
      const categoryUpdateQuery = await client.query(
        `
        UPDATE categories
        SET name = $1
        WHERE category_id = $2
      `,
        [name, categoryId]
      );

      console.log("insert row count", categoryUpdateQuery.rowCount);
      if (!categoryUpdateQuery.rowCount)
        throw new Error("Something went wrong");

      // Insert or select tag depending on existence
      // Insert or update category_tag depending on existence
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
              SELECT ct.category_id, ct.tag_id FROM category_tags ct, tid
              WHERE category_id = $2 AND ct.tag_id = tid.tag_id
            ), ict AS (
              INSERT INTO category_tags (category_id, tag_id)
              SELECT $2, tid.tag_id
              FROM tid
              WHERE NOT EXISTS (SELECT 1 FROM sct)
              RETURNING category_id, tag_id
            )
            SELECT * FROM sct UNION ALL SELECT * FROM ict
          `,
          [tag, categoryId]
        );
        if (!rowCount) throw new NamedError("Server", "Something went wrong");
      });

      // Delete tags no longer in array
      await client.query(
        `
          WITH ts AS (
            SELECT UNNEST ($1::text[]) AS tag
          ), tids AS (
            SELECT tag_id FROM ts JOIN tags ON tags.tag = ts.tag
          )
          DELETE FROM category_tags ct USING 
            category_tags ct2
            left join tids on tids.tag_id = ct2.tag_id 
          WHERE 
            tids.tag_id IS NULL
            AND ct.tag_id = ct2.tag_id 
            AND ct.category_id = $2
        `,
        [tags, categoryId]
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

  static async findById(id) {
    id = parseInt(id);
    const { rows } = await client.query(
      `
        with tag_arrays as (
          select ct.category_id, array_agg(t.tag) as tags
          from category_tags ct inner join tags t on ct.tag_id = t.tag_id
          group by ct.category_id 
        )
        select c.category_id "categoryId", c.name, ta.tags
        from tag_arrays ta inner join categories c on ta.category_id = c.category_id
        where c.category_id = $1
        limit 1
      `,
      [id]
    );
    const category = rows[0];
    if (!category)
      throw new NamedError(
        "NotFound",
        `Unable to find category with id of ${id}`
      );
    return new Category(category);
  }

  static async find(filter, options?) {
    const { rows } = await client.query(
      `
        with tag_arrays as (
          select ct.category_id, array_agg(t.tag) as tags
          from category_tags ct inner join tags t on ct.tag_id = t.tag_id
          group by ct.category_id 
        )
        select c.category_id "categoryId", c.name, ta.tags
        from tag_arrays ta inner join categories c on ta.category_id = c.category_id
      `
    );
    return rows.map(c => new Category(c));
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
