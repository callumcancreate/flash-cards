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
      const { rowCount, rows } = await client.query(
        `
        with recursive parent_tags as (
          select ct.tag_id, c.parent_id 
          from category_tags ct 
            inner join categories c on ct.category_id = c.category_id
          where c.category_id = $1
          union
          select ct.tag_id, c.parent_id
          from parent_tags pt
            inner join category_tags ct on pt.parent_id = ct.category_id
            inner join categories c on c.category_id = ct.category_id
        ),
        
        insert_category as (
          insert into categories (parent_id, name) values ($1, $2)
          returning category_id
        ),
        
        input_tags as (
          select i.tag, t.tag_id from (select unnest($3::text[]) tag) i
          left join tags t on i.tag = t.tag
        ),
        
        filtered_tags as (
          select it.tag, it.tag_id
          from input_tags it
          left join parent_tags pt on pt.tag_id = it.tag_id
          where pt.tag_id is null
        ),
        insert_tags as (
          insert into tags (tag) 
          select ft.tag from filtered_tags ft	where ft.tag_id is null
          returning tag, tag_id	
        ),
        child_tags as (
          select it.tag, it.tag_id  from insert_tags it
          union
          select ft.tag, ft.tag_id from filtered_tags ft where ft.tag_id is not null
        ),
        
        insert_category_tags as (
          insert into category_tags (category_id, tag_id)
          select ic.category_id, ct.tag_id  from insert_category ic, child_tags ct	
        ),
        
        combined_tags as (
          select ct.tag, ct.tag_id "tagId", false "isInherited" 
          from child_tags ct
          union
          select i.tag, i.tag_id "tagId", true "isInherited" 
          from input_tags i 
          inner join parent_tags pt on i.tag_id = pt.tag_id
        )
        
        select 
          ic.category_id,
          coalesce(
            (
              select array_agg(row_to_json(x)) 
              from 
                (select * from combined_tags order by "tagId") 
            x), 
            array[]::json[]
          )	tags
        from insert_category ic
      `,
        [parentId, name, tags.map(v => v.tag)]
      );
      await client.query("COMMIT");
      this.tags = rows[0].tags;
      this.categoryId = rows[0].category_id;
      return rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      if (e.constraint === "categories_name_key")
        throw new NamedError("Client", "Category name must be unique");
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

  static async unlinkAndDeleteById(id) {
    const { rowCount } = await client.query(
      `
        with parents as (
          select c.category_id, p.parent_id
          from categories c left join categories p
          on c.parent_id = p.category_id
        ),
        update_categories as (
          update categories
          set parent_id = p.parent_id
          from parents p
          where categories.category_id = p.category_id
          and categories.parent_id = $1
        )
        delete from categories where category_id = $1
      `,
      [id]
    );
    return rowCount;
  }

  static async deleteById(id) {
    const { rowCount } = await client.query(
      `
        DELETE FROM categories
        WHERE category_id = $1
      `,
      [id]
    );
    return rowCount;
  }

  async unlink() {
    const count = await Category.unlinkAndDeleteById(this.categoryId);
    return count;
  }

  async delete() {
    const count = await Category.deleteById(this.categoryId);
    return count;
  }
}
