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

describe("POST /categories", () => {
  it("Creates a new category", async () => {
    // Category has 1 existing tag and 1 new tag
    const c4 = {
      parentId: 1,
      tags: [{ tag: "new tag" }, tags[2]],
      name: "category4"
    };

    const newCatId = Object.keys(categories).length + 1;
    const response = await request
      .post(`/api/v1/categories`)
      .send(c4)
      .expect(201);

    // Check category added to table
    const q1 = await client.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [newCatId]
    );
    expect(q1.rows[0].name).toBe(c4.name);
    expect(q1.rows[0].parent_id).toBe(c4.parentId);

    // Check new tag added to table
    const q2 = await client.query(
      "SELECT * FROM tags WHERE tag = 'new tag' returning tag_id"
    );
    expect(q2.rowCount).toBe(1);
    expect(q2.rows[0].tag).toBe("new tag");
    const newTagId = q2.rows[0].tag_id;

    // Check existing tag not added to table
    const q3 = await client.query("SELECT * FROM tags where tag = $1", [
      tags[2].tag
    ]);
    expect(q3.rowCount).toBe(1);

    // Check category tags added to table
    const q4 = await client.query(
      "SELECT * FROM category_tags WHERE category_id = $1",
      newCatId
    );
    expect(q4.rowCount).toBe(2);
    q4.rows.forEach(row => expect(row.tag_id).toBe(newTagId));
  });
  it("Doesn't create a new category", async () => {});
});

describe("GET /categories", () => {
  it("Gets categories", async () => {});
  it("Limits and skips categories", async () => {});
  // it("Sorts categories", async () => {})
});

describe("GET /categories/:categoryId", () => {
  it("Gets a category by ID", async () => {
    const response1 = await request
      .get(`/api/v1/categories/3`)
      .send()
      .expect(200);
    const r1 = response1.body.category;
    const c3 = categories[3];
    const c1 = categories[1];

    expect(r1.categoryId).toBe(c3.categoryId);
    expect(r1.name).toBe(c3.name);
    expect(r1.tags.length).toBe(3);
    expect(r1.tags[0]).toMatchObject({ ...c1.tags[0], isInherited: true });
    expect(r1.tags[1]).toMatchObject({ ...c1.tags[1], isInherited: true });
    expect(r1.tags[2]).toMatchObject({ ...c3.tags[0], isInherited: false });

    const response2 = await request
      .get(`/api/v1/categories/1`)
      .send()
      .expect(200);
    const r2 = response2.body.category;
    expect(r2.categoryId).toBe(c1.categoryId);
    expect(r2.name).toBe(c1.name);
    expect(r2.tags.length).toBe(2);
    expect(r2.tags[0]).toMatchObject({ ...c1.tags[0], isInherited: false });
    expect(r2.tags[1]).toMatchObject({ ...c1.tags[1], isInherited: false });
  });

  it("Can't find a category", async () => {
    const response = await request
      .get(`/api/v1/categories/999`)
      .send()
      .expect(404);
    expect(response.body.error).not.toBeUndefined();
  });
});

// describe("GET /categories/:categoryId/cards", () => {});

describe("PATCH /categories/:categoryId", () => {
  it("Updates a category", async () => {});
  it("Doesn't update a category", async () => {});
});

describe("DELETE /categories/:categoryId", () => {
  it("Deletes a category", async () => {});
  it("Doesn't delete a category", async () => {});
});
