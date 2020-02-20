const defaultOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
  presence: "required"
};

export default function validateSchema(values, Schema, options = {}) {
  const { value, error } = Schema.validate(values, {
    ...defaultOptions,
    ...options
  });
  let errors;

  if (error) {
    errors = error.details.reduce((map, item) => {
      map[item.path.join(".")] = item.message;
      return map;
    }, {});
  }
  return { value, error, errors };
}
