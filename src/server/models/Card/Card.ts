import client from '../../db';
import Resource from '../Resource';
import TagType from '../../../types/Tag';
import {
  CardSchema,
  CardFindFilter,
  CardFindOptions
} from '../../schemas/Card';
import NamedError from '../NamedError';
import { validateSchema } from '../../../utils';
import insertSql from './insert';
import updateSql from './update';
import findSql from './find';
import findByIdSql from './findById';

export default class Card extends Resource {
  cardId?: number;

  tags?: TagType[];

  front: string;

  back: string;

  hint?: string;

  static schema = CardSchema;

  async insert() {
    try {
      const { tags, front, back, hint } = this;
      await client.query('BEGIN');
      const { rows } = await client.query(insertSql, [
        front,
        back,
        hint,
        tags.map((t) => t.tag)
      ]);
      await client.query('COMMIT');
      this.cardId = rows[0].cardId;
      this.tags = rows[0].tags;
      return this;
    } catch (e) {
      console.log(e);
      await client.query('ROLLBACK');
      throw e;
    }
  }

  async put() {
    try {
      await client.query('BEGIN');
      const { tags, front, back, hint, cardId } = this;
      const { rows, rowCount } = await client.query(updateSql, [
        front,
        back,
        hint,
        cardId,
        tags.map((t) => t.tag)
      ]);
      if (!rowCount) throw new NamedError('Server', 'Something went wrong');
      await client.query('COMMIT');
      this.tags = rows[0].tags;

      return this;
    } catch (e) {
      await client.query('ROLLBACK');
      console.log(e);
      throw e;
    }
  }

  static async findById(_id) {
    const id = parseInt(_id, 10);
    const cards = await client.query(findByIdSql, [id]);
    const card = cards.rows[0];
    if (!card)
      throw new NamedError('NotFound', `Unable to find card with id of ${id}`);
    return new Card(card);
  }

  static async find(_config) {
    const config = { ..._config };
    const { tagsAll, tagsNone } = config;
    if (typeof tagsAll === 'string') config.tagsAll = [config.tagsAll];
    if (typeof tagsNone === 'string') config.tagsNone = [config.tagsNone];
    const filter = validateSchema(config, CardFindFilter, {
      presence: 'optional'
    });
    const options = validateSchema(config, CardFindOptions, {
      presence: 'optional'
    });

    if (filter.errors)
      throw new NamedError(
        'Client',
        'Unable to validate find filter',
        filter.errors
      );

    if (options.errors)
      throw new NamedError(
        'Client',
        'Unable to validate find options',
        options.errors
      );

    const { rows } = await client.query(findSql, [
      options.value.tagsAll || [],
      options.value.tagsNone || [],
      filter.value.cardId,
      filter.value.front,
      filter.value.back,
      filter.value.hint,
      options.value.limit,
      options.value.offset
    ]);
    return rows.map((c) => new Card(c));
  }

  static async deleteById(id) {
    const {
      rowCount
    } = await client.query('DELETE FROM cards WHERE card_id = $1', [id]);
    return rowCount;
  }

  async delete() {
    return Card.deleteById(this.cardId);
  }
}
