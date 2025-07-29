import { Request, Response } from 'express';
import User from '../../../models/user.model';

export const getProfileController = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
