import { Request, Response } from 'express';
import User from '../../../models/user.model';
import bcrypt from 'bcrypt';
import { registerValidation } from '../../../utils/input.validations';
import { generateToken } from '../../../helpers/jwt.helper';

export const registerController = async (req: Request, res: Response) => {
  // Validate input
  const { error } = registerValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, avatarUrl, bio, phone } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatarUrl,
      bio,
      phone
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phone: user.phone,
        status: user.status,
        lastSeen: user.lastSeen,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
