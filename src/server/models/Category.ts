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
      const { tags, name, categoryId, parentId } = this;
      console.log("parentId", parentId);

      const { rows, rowCount } = await client.query(
        `
          with recursive parent_tags as (
            select t.tag, ct.tag_id, c.parent_id, true "isInherited"
            from category_tags ct 
              inner join categories c on ct.category_id = c.category_id
              inner join tags t on ct.tag_id = t.tag_id
            where c.category_id = $1
            union
            select t.tag, ct.tag_id, c.parent_id, true "isInherited"
            from parent_tags pt
              inner join category_tags ct on pt.parent_id = ct.category_id
              inner join tags t on t.tag_id = ct.tag_id
              inner join categories c on c.category_id = ct.category_id
          ),
          category as (
            update categories set parent_id = $1, name = $2
            where category_id = $3
            returning parent_id, name
          ),
          
          child_tags as (
            select u.tag, t.tag_id, false "isInherited" from
            (select *  from unnest($4::text[]) tag) u 
            left join tags t on t.tag = u.tag
            left join parent_tags pt on pt.tag_id = t.tag_id
            where pt.tag_id is null
          ),
          
          insert_tags as (
            insert into tags (tag)
            select tag from child_tags ct
            where ct.tag_id is null
            returning tag, tag_id, false "isInherited"
          ),
          
          combined_tags as (
            select pt.tag, pt.tag_id "tagId", pt."isInherited" from parent_tags pt
            union
            select ct.tag, ct.tag_id "tagId", ct."isInherited" from child_tags ct where ct.tag_id is not null
            union
            select it.tag, it.tag_id "tagId", it."isInherited" from insert_tags it
          ),
          insert_category_tags as (
            insert into category_tags (category_id, tag_id)
            select $3, ct."tagId"
            from combined_tags ct 
            left join child_tags ch on ct.tag = ch.tag
            where ch.tag is not null
            
          ),
          delete_tags as (
            delete from category_tags ct1
            using category_tags ct2 
            left join child_tags ch on ct2.tag_id = ch.tag_id
            where ct1.category_id = $3
            and ct1.category_id = ct2.category_id
            and ch.tag_id is null
          )
          
          select 
            $3 "categoryId", 
            c.name,
            c.parent_id "parentId",
            coalesce(
              (
                  select array_agg(row_to_json(x)) 
                  from (select * from combined_tags order by "tagId") x
                ),
                array[]::json[]
              )	tags
          from category c
        `,
        [parentId, name, categoryId, tags.map(t => t.tag)]
      );

      if (!rowCount) throw new NamedError("Server", "Something went wrong");
      await client.query("COMMIT");
      for (let key in rows[0]) {
        this[key] = rows[0][key];
      }
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
        select c.category_id "categoryId", c.name, coalesce(jt.tags, array[]::json[]) tags, c.parent_id "parentId"
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

  static async find(filter) {
    let { rows } = await client.query(
      `
        with recursive category_crumbs as (
          select c.category_id, c.parent_id, array[c.category_id] crumbs
          from categories c
          where 
          c.category_id = $1
          or (
            select nullif($1::text, '(none)') is null 
            and c.parent_id is null
          )
          union 
          select c.category_id, c.parent_id, array_append(cc.crumbs, c.category_id) crumbs 
          from categories c, category_crumbs cc
          where cc.category_id = c.parent_id
        
        ),
        json_tags as (
          select x."tagId", row_to_json(x) tags
          from (
            select t.tag_id "tagId", t.tag
            from tags t 
            order by "tagId"
          ) x
        
        ),
        array_tags as (
          select ct.category_id, array_agg(jt.tags) tags
          from category_tags ct 
          inner join json_tags jt on ct.tag_id = jt."tagId"
          group by ct.category_id
        )
        select 
          c.category_id "categoryId", 
          c.parent_id "parentId",  
          c.name, 
          cc.crumbs, 
          coalesce(at.tags, array[]::json[]) tags
        from category_crumbs cc 
        inner join categories c on cc.category_id = c.category_id
        left join array_tags at on c.category_id = at.category_id
      `,
      [filter.root]
    );

    console.log(rows);

    let map = {};

    rows.forEach(cat =>
      cat.crumbs.reduce((acc, crumb) => {
        crumb == cat.categoryId
          ? (acc[crumb] = { ...cat, crumbs: undefined })
          : (acc[crumb] = acc[crumb] || {});
        acc[crumb].children = { ...acc[crumb].children };
        return acc[crumb].children;
      }, map)
    );

    const toArrayStructure = map => {
      const values: CategoryType[] = Object.values(map);
      return values.length
        ? values.map(
            v => new Category({ ...v, children: toArrayStructure(v.children) })
          )
        : [];
    };

    return toArrayStructure(map);
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
