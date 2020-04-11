import server from '../../../src/server/server';
import supertest from 'supertest';
import * as db from '../../db';
import { users } from '../../mock-data';

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
  await db.seedUsers(client);
  // seed data
});

afterAll(async () => await client.release());

/***********************************
 *  TESTS
 ***********************************/

describe('POST /users', () => {
  it('Creates a new user', async () => {});
  it("Doesn't create a new user", async () => {});
});

describe('POST /login', () => {
  it('Logs a user in', async () => {});
  it("Doesn't log a user in", async () => {});
});
