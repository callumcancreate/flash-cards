import validateSchema from '../../utils/validateSchema';
import NamedError from './NamedError';

class Resource {
  static schema;

  static validateSchema = validateSchema;

  static find;

  protected async put(...args: any[]) {
    return this;
  }

  protected async insert(...args: any[]) {
    return this;
  }

  constructor(values) {
    const validated = this.validate(values) || {};
    Object.keys(values).forEach((key) => {
      this[key] = validated[key];
    });
  }

  validate(values) {
    const { value, errors } = Resource.validateSchema(
      values,
      (this.constructor as typeof Resource).schema
    );
    if (errors) {
      const error = `Unable to validate ${this.constructor.name || 'resource'}`;
      throw new NamedError('Client', error, errors);
    }
    return value;
  }

  async save() {
    const validated = this.validate(this);
    const { name } = this.constructor;
    const idName = `${name.substr(0, 1).toLowerCase()}${name.substr(1)}Id`;
    return validated[idName] ? this.put(validated) : this.insert(validated);
  }

  static validateId(_id) {
    const id = parseInt(_id, 10);
    if (!id.toString().match(/^\d+$/))
      throw new NamedError('Client', 'Invalid id provided');
    return id;
  }
}

export default Resource;
