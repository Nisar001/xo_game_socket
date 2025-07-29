import Joi from 'joi';

export const registerValidation = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  avatarUrl: Joi.string().uri().optional().allow(''),
  bio: Joi.string().max(200).optional().allow(''),
  phone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).optional().allow(''),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileValidation = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  avatarUrl: Joi.string().uri().optional().allow(''),
  bio: Joi.string().max(200).optional().allow(''),
  phone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).optional().allow(''),
  status: Joi.string().valid('online', 'offline', 'away', 'busy').optional(),
});

export const changePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});
