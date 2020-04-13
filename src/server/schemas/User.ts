import Joi from '@hapi/joi';

const userId = Joi.number().label('User ID');
const email = Joi.string().label('Email');
const firstName = Joi.string().label('First Name');
const lastName = Joi.string().label('Last Name');
const password = Joi.string().label('Password');

export const UserSchema = Joi.object({
  userId: userId.optional(),
  email,
  firstName: firstName.optional(),
  lastName: lastName.optional(),
  password: password.optional()
});

export const CreateUserSchema = Joi.object({
  email,
  password,
  firstName: firstName.optional(),
  lastName: lastName.optional()
});

export const LoginSchema = Joi.object({
  email,
  password
});
