import mongoose from 'mongoose';
import 'colors'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected'.bgGreen.white);
  } catch (err) {
    console.error('MongoDB connection failed'.bgRed.white, err);
    process.exit(1);
  }
};