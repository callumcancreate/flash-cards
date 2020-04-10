import client from "../../db";
import Resource from "../Resource";
import CategoryType from "../../../types/Category";
import TagType from "../../../types/Tag";
import { CategorySchema } from "../../Schemas/Category";
import NamedError from "../NamedError";
import insertSql from "./insert";
import updateSql from "./update";
import findSql from "./find";
import findByIdSql from "./findById";
import unlinkDeleteSql from "./unlinkDelete";

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
      const { rowCount, rows } = await client.query(insertSql, [
        parentId,
        name,
        tags.map((v) => v.tag),
      ]);
      await client.query("COMMIT");
      this.tags = rows[0].tags;
      this.categoryId = rows[0].category_id;
      return rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      if (
        e.constraint === "unique_name" ||
        e.constraint === "unique_name_null_parent"
      )
        //categories_name_key
        throw new NamedError("Client", "Category name must be unique");
      throw e;
    }
  }

  async _put() {
    try {
      await client.query("BEGIN");
      const { tags, name, categoryId, parentId } = this;
      const { rows, rowCount } = await client.query(updateSql, [
        parentId,
        name,
        categoryId,
        tags.map((t) => t.tag),
      ]);

      if (!rowCount) throw new NamedError("Server", "Something went wrong");
      await client.query("COMMIT");
      for (let key in rows[0]) {
        this[key] = rows[0][key];
      }
      return this;
    } catch (e) {
      await client.query("ROLLBACK");
      if (
        e.constraint === "unique_name" ||
        e.constraint === "unique_name_null_parent"
      )
        //categories_name_key
        throw new NamedError("Client", "Category name must be unique");
      console.log(e);
      throw e;
    }
  }

  static async findById(id) {
    id = parseInt(id);
    const { rows } = await client.query(findByIdSql, [id]);
    const category = rows[0];
    if (!category)
      throw new NamedError(
        "NotFound",
        `Unable to find category with id of ${id}`
      );
    return new Category(category);
  }

  static async find(filter) {
    let { rows } = await client.query(findSql, [filter.root]);

    let map = {};

    rows.forEach((cat) =>
      cat.crumbs.reduce((acc, crumb) => {
        crumb == cat.categoryId
          ? (acc[crumb] = { ...cat, crumbs: undefined })
          : (acc[crumb] = acc[crumb] || {});
        acc[crumb].children = { ...acc[crumb].children };
        return acc[crumb].children;
      }, map)
    );

    const toArrayStructure = (map) => {
      const values: CategoryType[] = Object.values(map);
      return values.length
        ? values.map(
            (v) =>
              new Category({ ...v, children: toArrayStructure(v.children) })
          )
        : [];
    };

    return toArrayStructure(map);
  }

  static async unlinkAndDeleteById(id) {
    const { rowCount } = await client.query(unlinkDeleteSql, [id]);
    return rowCount;
  }

  static async deleteById(id) {
    const {
      rowCount,
    } = await client.query("DELETE FROM categories WHERE category_id = $1", [
      id,
    ]);
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
