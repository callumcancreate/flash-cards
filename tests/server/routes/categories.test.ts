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
    const newCatId = Object.keys(categories).length + 1;
    const newTagId = Object.keys(tags).length + 1;
    const newCategory = {
      parentId: 1,
      tags: [tags[2], { tag: "new tag" }],
      name: "category" + newCatId
    };

    const response = await request
      .post(`/api/v1/categories`)
      .send(newCategory)
      .expect(201);

    expect(response.body.category).toMatchObject(newCategory);

    const { rows, rowCount } = await client.query(
      `
        with json_tags as (
          select x."tagId", row_to_json(x)  tag
          from (select t.tag_id "tagId", t.tag from tags t) x	 
        )        
        select 
          c.category_id "categoryId", 
          c.name, 
          c.parent_id "parentId",
          array_agg(jt.tag) tags,
          (select count(tag_id) from tags)::int count
        
        from categories c 
        inner join  category_tags ct on c.category_id = ct.category_id 
        inner join json_tags jt on jt."tagId" = ct.tag_id
        where c.category_id = $1
        group by c.category_id 
      `,
      [newCatId]
    );
    expect(rowCount).toBe(1);
    expect(rows[0]).toMatchObject({
      ...newCategory,
      tags: newCategory.tags.slice(1) // remove inherited tag
    });
    expect(rows[0].tags[0].tagId).toBe(newTagId); // Check new tag added
    expect(rows[0].count).toBe(newTagId); // Check existing tag is not added as new tag
  });

  it("Creates a new category without tags", async () => {
    const newCatId = Object.keys(categories).length + 1;
    const newCategory = {
      parentId: 1,
      tags: [],
      name: "category" + newCatId
    };

    const response = await request
      .post(`/api/v1/categories`)
      .send(newCategory)
      .expect(201);

    expect(response.body.category).toMatchObject(newCategory);

    const { rows, rowCount } = await client.query(
      `
        select count(tag_id)::int from category_tags
        where category_id = $1
      `,
      [newCatId]
    );
    expect(rows[0].count).toBe(0);
  });

  it("Doesn't create category because name in use", async () => {
    const newCategory = {
      tags: [],
      name: "category1"
    };

    const newCatId = Object.keys(categories).length + 1;
    const response = await request
      .post(`/api/v1/categories`)
      .send(newCategory)
      .expect(400);
    expect(response.body.error).not.toBeUndefined();
    const { rows } = await client.query(
      "select count(category_id)::int from categories"
    );
    expect(rows[0].count).toBe(Object.keys(categories).length);
  });
});

describe("GET /categories", () => {
  it("Gets categories", async () => {
    const response = await request
      .get(`/api/v1/categories`)
      .send()
      .expect(200);

    const expected = [
      {
        ...categories[1],
        children: [
          {
            ...categories[3],
            children: [
              {
                ...categories[4],
                children: []
              }
            ]
          }
        ]
      },
      { ...categories[2], children: [] },
      { ...categories[5], children: [] }
    ];

    expect(response.body.categories).toMatchObject(expected);
  });
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
    expect(r1.parentId).toBe(1);
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
    expect(r2.parentId).toBe(null);
    expect(r2.tags.length).toBe(2);
    expect(r2.tags[0]).toMatchObject({ ...c1.tags[0], isInherited: false });
    expect(r2.tags[1]).toMatchObject({ ...c1.tags[1], isInherited: false });

    // Get a category with no tags
    const response3 = await request
      .get(`/api/v1/categories/5`)
      .send()
      .expect(200);
    expect(response3.body.category).toMatchObject(categories[5]);
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
  it("Updates a category", async () => {
    const newTag = { tag: "4tag" };
    const modifiedCat = {
      ...categories[3],
      name: "updated name",
      parentId: 2,
      tags: [tags[1], tags[2], newTag] // 1 not inherited, 2 inherited, 4 new, (3 dropped)
    };
    const newTagId = Object.keys(tags).length + 1;
    const response = await request
      .patch(`/api/v1/categories/3`)
      .send(modifiedCat)
      .expect(200);

    expect(response.body.category).toMatchObject({
      ...modifiedCat,
      tags: [
        { ...tags[1], isInherited: false },
        { ...tags[2], isInherited: true },
        { ...tags[3], isInherited: true },
        { ...newTag, tagId: newTagId, isInherited: false }
      ]
    });

    const { rows, rowCount } = await client.query(
      `
        select ct.category_id, ct.tag_id, t.tag 
        from category_tags ct
        left join tags t on ct.tag_id = t.tag_id
        where category_id = 3
        order by ct.category_id
      `
    );
    expect(rowCount).toBe(2);
    expect(rows[0]).toMatchObject({
      category_id: 3,
      tag_id: tags[1].tagId,
      tag: tags[1].tag
    });
    expect(rows[1]).toMatchObject({
      category_id: 3,
      tag_id: newTagId,
      tag: newTag.tag
    });
  });
  it("Doesn't update a category due to missing ", async () => {});
});

describe("DELETE /categories/:categoryId", () => {
  it("Deletes a category (and its children)", async () => {
    const response = await request
      .delete(`/api/v1/categories/3?withChildren=true`)
      .send()
      .expect(200);
    expect(response.body.count).toBe(1);

    const { rowCount } = await client.query(
      "select * from categories where category_id = 3 OR category_id = 4"
    );
    expect(rowCount).toBe(0);
  });

  it("Unlinks and deletes a category (but not its children)", async () => {
    const response = await request
      .delete(`/api/v1/categories/3`)
      .send()
      .expect(200);
    expect(response.body.count).toBe(1);
    const { rowCount } = await client.query(
      "select * from categories where category_id = 3"
    );
    expect(rowCount).toBe(0);
    const { rows } = await client.query(
      `
        select category_id "categoryId", parent_id "parentId", name
        from categories where category_id = 4
      `
    );
    expect(rows.length).toBe(1);
    expect({ ...categories[4], parentId: 1 }).toMatchObject(rows[0]);
  });
  it("Can't find a category to delete", async () => {
    const response = await request
      .delete(`/api/v1/categories/999`)
      .send()
      .expect(404);
    expect(response.body.error).not.toBeUndefined();
    const { rowCount } = await client.query("select * from categories");
    expect(rowCount).toBe(Object.keys(categories).length);
  });
});
