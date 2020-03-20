import client from "../db";
import Resource from "./Resource";
import CategoryType from "../../types/Category";
import TagType from "../../types/Tag";
import { CategorySchema, CategoryFindOptions } from "../Schemas/Category";
import NamedError from "./NamedError";
import { validateSchema, camelToSnake } from "../../utils";

export default class Category extends Resource {
  categoryId?: number;
  parentId?: number;
  children?: Category[];
  name: string;
  tags: TagType[];

  static schema = CategorySchema;

  constructor(props: CategoryType) {
    super(props);
  }

  async _insert() {
    try {
      const { tags, name, parentId } = this;
      await client.query("BEGIN");
      const insertQuery = await client.query(
        `
        INSERT INTO categories (name, parent_id) VALUES ($1, $2)
        RETURNING category_id
      `,
        [name, parentId]
      );
      if (!insertQuery.rowCount) throw new Error("Something went wrong");

      const categoryId = insertQuery.rows[0].category_id;

      const tagQueries = await Promise.all(
        tags.map(async ({ tag }) => {
          const { rows, rowCount } = await client.query(
            `
              with recursive parent_tags as (
                with base_tags as (
                  select t.tag, ct.tag_id, c.parent_id, c.category_id 
                  from category_tags ct
                  inner join categories c on ct.category_id = c.category_id 
                  inner join tags t on ct.tag_id = t.tag_id
                )
                select bt.tag, bt.tag_id, bt.parent_id, false as is_inherited
                from base_tags bt
                where bt.category_id = $1
                union 
                select bt.tag, bt.tag_id, bt.parent_id, true as is_inherited 
                from parent_tags pt 
                inner join base_tags bt on pt.parent_id = bt.category_id
              )
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
              RETURNING $1 tag, tag_id "tagId"
            `,
            [tag, categoryId]
          );
          if (!rowCount) throw new Error("Something went wrong");
          return rows[0];
        })
      );
      await client.query("COMMIT");
      this.categoryId = categoryId;
      this.tags = tagQueries;
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
        with recursive parent_tags as (
          with base_tags as (
            select t.tag, ct.tag_id, c.parent_id, c.category_id 
            from category_tags ct
            inner join categories c on ct.category_id = c.category_id 
            inner join tags t on ct.tag_id = t.tag_id
          )
          select bt.tag, bt.tag_id, bt.parent_id, false as is_inherited
          from base_tags bt
          where bt.category_id = $1
          union 
          select bt.tag, bt.tag_id, bt.parent_id, true as is_inherited 
          from parent_tags pt 
          inner join base_tags bt on pt.parent_id = bt.category_id
        ),
        
        json_tags as (
          select array_agg(row_to_json(x)) as tags
          from (select tag_id "tagId", tag, is_inherited "isInherited" from parent_tags order by tag_id) x
        )
        
        
        select c.category_id "categoryId", c.name, jt.tags
        from categories c, json_tags jt
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
