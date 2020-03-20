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
  it("Creates a new category", async () => {});
  it("Doesn't create a new category", async () => {});
});

describe("GET /categories", () => {
  it("Gets categories", async () => {});
  it("Limits and skips categories", async () => {});
  // it("Sorts categories", async () => {})
});

describe("GET /categories/:categoryId", () => {
  it("Gets a category by ID", async () => {});
  it("Can't find a category", async () => {});
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
