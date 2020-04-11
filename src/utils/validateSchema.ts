const defaultOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
  presence: 'required',
};

export default function validateSchema(values, Schema, options = {}) {
  const { value, error } = Schema.validate(values, {
    ...defaultOptions,
    ...options,
  });
  let errors;

  if (error) {
    errors = error.details.reduce((map, item) => {
      const newMap = { ...map };
      newMap[item.path.join('.')] = item.message;
      return newMap;
    }, {});
  }
  return { value, error, errors };
}
