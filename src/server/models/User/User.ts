import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../db';
import Resource from '../Resource';
import UserType from '../../../types/User';
import { UserSchema } from '../../schemas/User';
import NamedError from '../NamedError';

class User extends Resource implements UserType {
  userId?: number;

  email: string;

  firstName?: string;

  lastName?: string;

  password?: string;

  static schema = UserSchema;

  static async findByCredentials({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new NamedError('Auth', 'Invalid email or password');
    return user;
  }

  async insert(values) {
    try {
      const { email, firstName, lastName } = values;
      let { password } = values;
      if (password) password = await bcrypt.hash(password, 10);
      const {
        rows: [{ userId }]
      } = await pool.query(
        `
        insert into users (email, password, first_name, last_name)
        values ($1, $2, $3, $4)
        returning user_id "userId"
      `,
        [email, password, firstName, lastName]
      );

      this.userId = userId;
      delete this.password;
      return this;
    } catch (e) {
      if (e.constraint === 'users_email_key')
        throw new NamedError('Client', 'Unable to create new user', {
          email: 'Email address is already in use'
        });
      throw e;
    }
  }

  async put(v) {
    return this;
  }

  static async findByEmail(email) {
    const {
      rows: [user],
      rowCount
    } = await pool.query(
      `
        select
          user_id "userId",
          email,
          first_name "firstName",
          last_name "lastName",
          password
        from users
        where
          email = $1
        limit 1
      `,
      [email]
    );
    return rowCount ? new User(user) : null;
  }

  static async getToken(userId, email, type: 'BEARER' | 'REFRESH') {
    const iat = Math.floor(Date.now() / 1000); // NumericDate: seconds since epoch
    const csrf = String(Math.round(Math.random() * 10 ** 10));
    const expiryTime =
      type === 'REFRESH'
        ? parseInt(process.env.REFRESH_TOKEN_EXPIRY, 10) || 60 * 60 * 24 * 7
        : parseInt(process.env.BEARER_TOKEN_EXPIRY, 10) || 60 * 15;
    const content = {
      iat, // issued at
      exp: iat + expiryTime,
      sub: userId, // subject
      email,
      type,
      csrf
    };

    const token = await jwt.sign(content, process.env.JWT_SECRET);
    return [token, csrf];
  }

  toJSON() {
    delete this.password;
    return this;
  }
}

export default User;
