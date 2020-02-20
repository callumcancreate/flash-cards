const validateSchema = require("../utils/validateSchema");

class Resource {
  constructor(values) {
    const validated = this.validate(values) || {};
    for (let key in validated) {
      this[key] = validated[key];
    }
  }

  static schema;
  static validateSchema = validateSchema;

  validate(values) {
    const { value, errors } = Resource.validateSchema(
      values,
      (this.constructor as typeof Resource).schema
    );
    if (errors)
      throw {
        status: 400,
        error: `Unable to validate ${this.constructor.name || "resource"}`,
        errors
      };
    return value;
  }

  static async findById(_id, _sql) {
    const id = this.validateId(_id);
    const sql =
      _sql ||
      `
      SELECT * FROM ${this.tableName}
      WHERE id = $1
    `;
    const { rows } = await client.query(sql, [id]);
    const resource = rows[0];

    if (!resource)
      throw {
        status: 404,
        error: `Unable to find ${this.name} with id ${_id}`
      };
    return new this(resource);
  }

  async save() {
    const validated = this.validate(this);
    return validated.id
      ? await this._put(validated)
      : await this._insert(validated);
  }

  async delete(sql) {
    const result = await client.query(
      sql ||
        `
        DELETE FROM ${this.constructor.tableName}
        WHERE id = $1; 
      `,
      [this.id]
    );
    return result;
  }

  static validateId(_id) {
    try {
      const id = parseInt(_id);
      if (!id.toString().match(/^\d+$/)) throw new Error();
      return id;
    } catch (e) {
      throw { error: "Invalid id provided", status: 400 };
    }
  }
}
export default Resource;
