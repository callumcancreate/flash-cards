import client from '../db';
import Resource from './Resource';
import { TagSchema, TagFindOptions } from '../Schemas/Tag';
import NamedError from './NamedError';
import { validateSchema, camelToSnake } from '../../utils';

export default class Tag extends Resource {
  tagId?: number;

  tag: string;

  static schema = TagSchema;

  async insert() {
    const { tag } = this;
    const { rows } = await client.query(
      `
        INSERT INTO tags (tag) VALUES ($1)
        RETURNING tag_id
      `,
      [tag]
    );
    this.tagId = rows[0].tag_id;
    return this;
  }

  async put() {
    const { tag, tagId } = this;
    await client.query(
      `
        UPDATE tags SET tag = $1
        WHERE tag_id = $2
      `,
      [tag, tagId]
    );

    return this;
  }

  static async findById(_id) {
    const id = parseInt(_id, 10);
    const { rows } = await client.query(
      `
        SELECT tag_id "tagId", tag
        FROM tags
        WHERE tag_id = $1
      `,
      [id]
    );
    const tag = rows[0];
    if (!tag)
      throw new NamedError('NotFound', `Unable to find tag with id of ${id}`);
    return new Tag(tag);
  }

  static async find(_filter, _options?) {
    const filter = validateSchema(_filter, TagSchema, { presence: 'optional' });

    if (filter.errors)
      throw new NamedError(
        'Client',
        'Unable to validate find filter',
        filter.errors
      );

    const options = validateSchema(_options || {}, TagFindOptions, {
      presence: 'optional'
    });

    if (options.errors)
      throw new NamedError(
        'Client',
        'Unable to validate find options',
        options.errors
      );

    const conditions = Object.keys(filter.value).length
      ? `WHERE ${Object.keys(filter.value)
          .map((key, i) => `c.${camelToSnake(key)} = $${i + 3}`)
          .join(' AND ')}`
      : '';
    console.log('conditions', conditions);
    const { rows } = await client.query(
      `
        select tag_id "tagId", tag
        from tags t
        ${conditions}
        order by t.tag_id
        limit $1
        offset $2
      `,
      [
        options.value.limit,
        options.value.offset,
        ...Object.values(filter.value)
      ]
    );
    return rows.map((t) => new Tag(t));
  }
}
