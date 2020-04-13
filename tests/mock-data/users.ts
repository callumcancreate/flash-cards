import jwt from 'jsonwebtoken';

export const users = {
  1: {
    userId: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@email.com',
    password: 'johnspassword',
    isVerified: true,
    isDeleted: false
  },
  2: {
    userId: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'janes@email.com',
    password: 'janespassword',
    isVerified: false,
    isDeleted: false
  },
  3: {
    userId: 3,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janed@email.com',
    password: 'janedoespassword',
    isVerified: true,
    isDeleted: true
  }
};

const secret = process.env.JWT_SECRET;
const csrf = 'csrf';
const type = 'BEARER';
export const tokens = {
  1: jwt.sign(
    { sub: users[1].userId, email: users[1].email, csrf, type },
    secret
  ),
  2: jwt.sign(
    { sub: users[2].userId, email: users[2].email, csrf, type },
    secret
  ),
  3: jwt.sign(
    { sub: users[3].userId, email: users[3].email, csrf, type },
    secret
  )
};
