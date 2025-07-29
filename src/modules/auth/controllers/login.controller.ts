import { Request, Response } from 'express';
import User from '../../../models/user.model';
import bcrypt from 'bcrypt';
import { loginValidation } from '../../../utils/input.validations';
import { generateToken } from '../../../helpers/jwt.helper';

export const loginController = async (req: Request, res: Response) => {
  // Validate input
  const { error } = loginValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken({ _id: user._id.toString(), email: user.email });

    res.status(200).json({
      message: 'Login successful',
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
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
