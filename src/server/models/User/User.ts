import bcrypt from 'bcryptjs';
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

  toJSON() {
    delete this.password;
    return this;
  }
}

export default User;
