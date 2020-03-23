import fs from "fs";
import path from "path";
import client from "../../db";
import Resource from "../Resource";
import CardType from "../../../types/Card";
import TagType from "../../../types/Tag";
import {
  CardSchema,
  CardFindFilter,
  CardFindOptions
} from "../../Schemas/Card";
import NamedError from "../NamedError";
import { validateSchema, camelToSnake } from "../../../utils";

const insertSql = fs.readFileSync(path.join(__dirname, "insert.sql"), "utf8");
const updateSql = fs.readFileSync(path.join(__dirname, "update.sql"), "utf8");
const findByIdSql = fs.readFileSync(
  path.join(__dirname, "findById.sql"),
  "utf8"
);

export default class Card extends Resource {
  cardId?: number;
  tags?: TagType[];
  front: string;
  back: string;
  hint?: string;
  static schema = CardSchema;

  constructor(props: CardType) {
    super(props);
  }

  async _insert() {
    try {
      const { tags, front, back, hint } = this;
      await client.query("BEGIN");
      const { rows } = await client.query(insertSql, [
        front,
        back,
        hint,
        tags.map(t => t.tag)
      ]);
      await client.query("COMMIT");
      this.cardId = rows[0].cardId;
      this.tags = rows[0].tags;
      return this;
    } catch (e) {
      console.log(e);
      await client.query("ROLLBACK");
      throw e;
    }
  }

  async _put() {
    try {
      await client.query("BEGIN");
      const { tags, front, back, hint, cardId } = this;
      const { rows, rowCount } = await client.query(updateSql, [
        front,
        back,
        hint,
        cardId,
        tags.map(t => t.tag)
      ]);
      if (!rowCount) throw new NamedError("Server", "Something went wrong");
      await client.query("COMMIT");
      this.tags = rows[0].tags;

      return this;
    } catch (e) {
      await client.query("ROLLBACK");
      console.log(e);
      throw e;
    }
  }

  static async findById(id) {
    id = parseInt(id);
    const cards = await client.query(findByIdSql, [id]);
    const card = cards.rows[0];
    if (!card)
      throw new NamedError("NotFound", `Unable to find card with id of ${id}`);
    return new Card(card);
  }

  static async find(filter, options?) {
    filter = validateSchema(filter, CardFindFilter, { presence: "optional" });

    if (filter.errors)
      throw new NamedError(
        "Client",
        "Unable to validate find filter",
        filter.errors
      );

    options = validateSchema(options || {}, CardFindOptions, {
      presence: "optional"
    });

    if (options.errors)
      throw new NamedError(
        "Client",
        "Unable to validate find options",
        options.errors
      );

    const conditions = Object.keys(filter.value).length
      ? "WHERE " +
        Object.keys(filter.value)
          .map((key, i) => `c.${camelToSnake(key)} = $${i + 5}`)
          .join(" AND ")
      : "";

    const { rows } = await client.query(
      `
        with json_tags as (
          select x."tagId",	row_to_json(x)as tag
          from (select tag_id "tagId", tag from tags) x
        ),   
        required_tags as (
          select tags.tag_id
          from (select unnest($1::text[]) as tag) as t(tag) 
          inner join tags on tags.tag = t.tag
        ),
        excluded_tags as (
          select tags.tag_id 
          from (select unnest($2::text[]) as tag) as t(tag) 
          inner join tags on tags.tag = t.tag
        ),
        filtered_cards as (
          select 
            ct.card_id,
            array_agg(jt.tag) as tags
          from 
            card_tags ct
            join json_tags jt on ct.tag_id = jt."tagId"
            left join excluded_tags et on ct.tag_id = et.tag_id
            left join required_tags rt on ct.tag_id = rt.tag_id
          group by ct.card_id 
          having
            count(et.tag_id) = 0
            and count(rt.tag_id) = cardinality($1)
        )
        select 
        c.card_id "cardId", 
          c.front, 
          c.back, 
          c.hint, 
           fc.tags
          from 
        filtered_cards fc
          inner join cards c on fc.card_id = c.card_id
        ${conditions}
        order by c.card_id
        limit $3
        offset $4
      `,
      [
        options.value.tagsAll || [],
        options.value.tagsNone || [],
        options.value.limit,
        options.value.offset,
        ...Object.values(filter.value)
      ]
    );
    return rows.map(c => new Card(c));
  }
  static async deleteById(id) {
    const { rowCount } = await client.query(
      `
        DELETE FROM cards
        WHERE card_id = $1
      `,
      [id]
    );
    return rowCount;
  }

  async delete() {
    return await Card.deleteById(this.cardId);
  }
}
