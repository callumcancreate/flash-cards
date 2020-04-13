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
  it('Creates a new user', async () => {
    const newUser = {
      email: 'test@test.com',
      password: 'password',
      firstName: 'test',
      lastName: 'user'
    };
    const userId = Object.keys(users).length + 1;
    const response = await request
      .post(`/api/v1/users`)
      .send(newUser)
      .expect(201);

    const expected = { userId, ...newUser };
    delete expected.password;

    expect(response.body.user).toMatchObject(expected);
    expect(response.body.password).not.toBeDefined();

    const {
      rows: [user],
      rowCount
    } = await client.query(
      `
        select 
          user_id "userId", 
          email, 
          first_name "firstName", 
          last_name "lastName", 
          password,
          is_deleted,
          is_verified
        from users 
        where user_id = $1
      `,
      [userId]
    );

    expect(rowCount).toBe(1);
    expect(user.password).not.toBe(newUser.password);
    user.password = newUser.password;
    expect(user).toMatchObject({
      ...newUser,
      is_deleted: false,
      is_verified: false
    });
  });
  it("Doesn't create a new user with an existing email", async () => {
    const newUser = { email: users[1].email, password: 'password' };
    const response = await request
      .post(`/api/v1/users`)
      .send(newUser)
      .expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.errors.email).toBeDefined();

    const {
      rowCount
    } = await client.query('select * from users where email = $1', [
      users[1].email
    ]);
    expect(rowCount).toBe(1);
  });

  it("Doesn't create a new user without email and password", async () => {
    const newUser = { firstName: 'Bob' };
    const response = await request
      .post(`/api/v1/users`)
      .send(newUser)
      .expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.errors.email).toBeDefined();
    expect(response.body.errors.password).toBeDefined();

    const {
      rowCount
    } = await client.query('select * from users where email = $1', [
      users[1].email
    ]);
    expect(rowCount).toBe(1);
  });
});

describe('POST /login', () => {
  it('Logs a user in', async () => {});
  it("Doesn't log a user in", async () => {});
});
