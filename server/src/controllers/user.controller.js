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

export const addUser = AsyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    throw new ApiError(400, 'all fields are required');
  }
  if (userRole === 'admin' && role !== 'librarian') {
    throw new ApiError(403, 'you are not allowed to do this operation');
  }
  if (userRole === 'librarian' && role !== 'student') {
    throw new ApiError(403, 'you are not allowed to do this operation');
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError(400, 'user already exists');
  }
  let password = Math.random().toString(32).slice(2, 10);
  const newUser = await User.create({
    name,
    email,
    role,
    password,
    isActive: true,
  });
  if (!newUser) {
    throw new ApiError(400, 'failed to create user');
  }
  const userObject = newUser.toObject();
  delete userObject.password;
  res
    .status(201)
    .json(new ApiResponse(userObject, 'user created successfully'));
});

export const logout = AsyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: ENV.NODE_ENV === 'production',
  });
  res.status(200).json(new ApiResponse(null, 'logged out successfully'));
});
