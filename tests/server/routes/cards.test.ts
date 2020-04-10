import server from "../../../src/server/server";
import supertest from "supertest";
import * as db from "../../db";
import { cards, tags } from "../../mock-data";

const request = supertest(server);
let client;

/***********************************
 *  LIFECYCLE
 ***********************************/

beforeAll(async () => {
  client = await db.connect();
});

beforeEach(async () => {
  await db.initTables(client);
  await db.seedTags(client);
  await db.seedCards(client);
});

afterAll(async () => await client.release());

/***********************************
 *  TESTS
 ***********************************/

describe("POST /cards", () => {
  it("Creates a new card", async () => {
    const newCardId = Object.keys(cards).length + 1;
    const newTagId = Object.keys(tags).length + 1;
    const newTag = { tag: "new tag" };
    const newCard = {
      front: "new front",
      back: "new back",
      hint: "new hint",
      tags: [tags[1], newTag]
    };

    const response = await request
      .post(`/api/v1/cards`)
      .send(newCard)
      .expect(201);

    expect(response.body.card).toMatchObject({ ...newCard, cardId: newCardId });
    expect(response.body.card.tags[1]).toMatchObject({
      ...newTag,
      tagId: newTagId
    });

    const { rows, rowCount } = await client.query(
      `
        select * from card_tags ct
        inner join tags t on ct.tag_id = t.tag_id
        inner join cards c on ct.card_id = c.card_id
        where ct.card_id = $1
        order by t.tag_id
      `,
      [newCardId]
    );
    expect(rowCount).toBe(2);
    expect(rows[0].tag).toBe(tags[1].tag);
    expect(rows[1].tag).toBe(newTag.tag);
    expect(rows[0].front).toBe(newCard.front);
    expect(rows[0].back).toBe(newCard.back);
    expect(rows[0].hint).toBe(newCard.hint);
  });
});

describe("GET /cards/:id", () => {
  it("Gets a card by id", async () => {
    const r1 = await request
      .get(`/api/v1/cards/1`)
      .send()
      .expect(200);

    expect(r1.body.card).toMatchObject(cards[1]);

    // Gets a card with no tags
    const r2 = await request
      .get(`/api/v1/cards/7`)
      .send()
      .expect(200);

    expect(r2.body.card).toMatchObject(cards[7]);
  });
});

describe("GET /cards", () => {
  it("Gets all cards", async () => {
    const r1 = await request
      .get(`/api/v1/cards`)
      .query({})
      .send()
      .expect(200);
    expect(r1.body.cards).toMatchObject(Object.values(cards));
  });

  it("Gets cards from tags", async () => {
    const includedTags = [tags[1], tags[2]];
    const excludedTags = [tags[3]];
    const expectedCards = Object.values(cards).filter(
      card =>
        card.tags.find(({ tag }) => tag === tags[1].tag) &&
        card.tags.find(({ tag }) => tag === tags[2].tag) &&
        !card.tags.find(({ tag }) => tag === tags[3].tag)
    );
    // expect(expectedCards).toBe(1);
    const r1 = await request
      .get(`/api/v1/cards`)
      .query({
        tagsAll: includedTags.map(({ tag }) => tag), // get cards with tag 1 and 2
        tagsNone: excludedTags.map(({ tag }) => tag)
      })
      .send()
      .expect(200);

    console.log(r1);
    expect(r1.body.cards).toMatchObject(Object.values(expectedCards));
  });
  it("Filters cards by values", async () => {
    const r1 = await request
      .get(`/api/v1/cards`)
      .query({ front: "samefront" })
      .send()
      .expect(200);

    expect(r1.body.cards).toMatchObject([cards[6], cards[7]]);

    const r2 = await request
      .get(`/api/v1/cards`)
      .query({ back: "back1" })
      .send()
      .expect(200);

    expect(r2.body.cards).toMatchObject([cards[1]]);

    const r3 = await request
      .get(`/api/v1/cards`)
      .query({ cardId: 1 })
      .send()
      .expect(200);

    expect(r3.body.cards).toMatchObject([cards[1]]);
  });

  it("Limit and skip cards", async () => {
    const r1 = await request
      .get(`/api/v1/cards`)
      .query({ limit: 1, offset: 1 })
      .send()
      .expect(200);

    expect(r1.body.cards).toMatchObject([cards[2]]);
  });
});

describe("PATCH /cards/:id", () => {
  it("Updates a card by id", async () => {
    const newTag = { tag: "new tag" };
    const newTagId = Object.keys(tags).length + 1;
    const updatedCard = {
      cardId: 3,
      front: "new front",
      back: "new back",
      hint: "new hint",
      tags: [tags[1], tags[3], newTag] // dropped tag 2, added tag 3 and new tag
    };

    const response = await request
      .patch(`/api/v1/cards/3`)
      .send(updatedCard)
      .expect(200);

    expect(response.body.card).toMatchObject(updatedCard);
    expect(response.body.card.tags[2]).toMatchObject({
      ...newTag,
      tagId: newTagId
    });

    const cardQuery = await client.query(
      `select card_id "cardId", front, back, hint from cards c where card_id = 3`
    );
    expect(cardQuery.rowCount).toBe(1);
    expect(updatedCard).toMatchObject(cardQuery.rows[0]);

    const ctQuery = await client.query(
      `
        select ct.tag_id "tagId", t.tag 
        from card_tags ct inner join tags t on ct.tag_id = t.tag_id
        where ct.card_id = 3
      `
    );
    expect(ctQuery.rowCount).toBe(3);
    expect(ctQuery.rows[0]).toMatchObject(tags[1]);
    expect(ctQuery.rows[1]).toMatchObject(tags[3]);
    expect(ctQuery.rows[2]).toMatchObject({ ...newTag, tagId: newTagId });
  });
});

describe("DELETE /cards/:id", () => {
  it("Deletes a card by id", async () => {
    await request
      .delete(`/api/v1/cards/1`)
      .send()
      .expect(200);

    const q1 = await client.query("select * from cards where card_id = 1");
    expect(q1.rowCount).toBe(0);

    const q2 = await client.query("select * from card_tags where card_id = 1");
    expect(q2.rowCount).toBe(0);
  });
});
