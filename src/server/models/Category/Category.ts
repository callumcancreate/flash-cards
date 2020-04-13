import pool from '../../db';
import Resource from '../Resource';
import CategoryType from '../../../types/Category';
import TagType from '../../../types/Tag';
import { CategorySchema } from '../../schemas/Category';
import NamedError from '../NamedError';
import insertSql from './insert';
import updateSql from './update';
import findSql from './find';
import findByIdSql from './findById';
import unlinkDeleteSql from './unlinkDelete';

export default class Category extends Resource implements CategoryType {
  categoryId?: number;

  parentId?: number;

  children?: Category[];

  name: string;

  tags: TagType[];

  static schema = CategorySchema;

  async insert() {
    try {
      const { tags, name, parentId } = this;
      await pool.query('BEGIN');
      const { rows } = await pool.query(insertSql, [
        parentId,
        name,
        tags.map((v) => v.tag)
      ]);
      await pool.query('COMMIT');
      this.tags = rows[0].tags;
      this.categoryId = rows[0].category_id;
      return rows[0];
    } catch (e) {
      await pool.query('ROLLBACK');
      if (
        e.constraint === 'unique_name' ||
        e.constraint === 'unique_name_null_parent'
      )
        throw new NamedError('Client', 'Category name must be unique');
      throw e;
    }
  }

  async put() {
    try {
      await pool.query('BEGIN');
      const { tags, name, categoryId, parentId } = this;
      const { rows, rowCount } = await pool.query(updateSql, [
        parentId,
        name,
        categoryId,
        tags.map((t) => t.tag)
      ]);

      if (!rowCount) throw new NamedError('Server', 'Something went wrong');
      await pool.query('COMMIT');
      Object.keys(rows[0]).forEach((key) => {
        this[key] = rows[0][key];
      });
      return this;
    } catch (e) {
      await pool.query('ROLLBACK');
      if (
        e.constraint === 'unique_name' ||
        e.constraint === 'unique_name_null_parent'
      )
        throw new NamedError('Client', 'Category name must be unique');
      console.log(e);
      throw e;
    }
  }

  static async findById(_id) {
    const id = parseInt(_id, 10);
    const { rows } = await pool.query(findByIdSql, [id]);
    const category = rows[0];
    if (!category)
      throw new NamedError(
        'NotFound',
        `Unable to find category with id of ${id}`
      );
    return new Category(category);
  }

  static async find(filter) {
    const { rows } = await pool.query(findSql, [filter.root]);
    const map = {};

    rows.forEach((cat) =>
      cat.crumbs.reduce((acc, crumb) => {
        crumb === cat.categoryId
          ? (acc[crumb] = { ...cat, crumbs: undefined })
          : (acc[crumb] = acc[crumb] || {});
        acc[crumb].children = { ...acc[crumb].children };
        return acc[crumb].children;
      }, map)
    );

    const toArrayStructure = (_map) => {
      const values: CategoryType[] = Object.values(_map);
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
    const { rowCount } = await pool.query(unlinkDeleteSql, [id]);
    return rowCount;
  }

  static async deleteById(id) {
    const {
      rowCount
    } = await pool.query('DELETE FROM categories WHERE category_id = $1', [id]);
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
