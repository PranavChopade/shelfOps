import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import ENV from '../config/ENV.js';
import ApiResponse from '../utils/ApiResponce.js';
export const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'both fields are required');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const token = jwt.sign({ _id: user._id }, ENV.JWT_SECRET, {
    expiresIn: '2d',
  });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: ENV.NODE_ENV === 'production',
    maxAge: 2 * 24 * 60 * 60 * 1000, //2 days
  });
  const userObject = user.toObject();
  delete userObject.password;
  res.status(200).json(new ApiResponse(userObject, 'logged in successfully'));
});
