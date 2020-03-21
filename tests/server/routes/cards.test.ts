import server from "../../../src/server/server";
import supertest from "supertest";
import * as db from "../../db";
import { cards, tags, categories } from "../../mock-data";

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
  await db.seedData(client);
  // seed data
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
  it("Gets a card by id", async () => {});
});

describe("GET /cards", () => {
  it("Gets cards", async () => {});
});

describe("PATCH /cards/:id", () => {
  it("Updates a card by id", async () => {});
});

describe("DELETE /cards/:id", () => {
  it("Deletes a card by id", async () => {});
});
