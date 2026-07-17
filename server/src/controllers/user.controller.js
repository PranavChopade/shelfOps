import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import ENV from '../config/ENV.js';
import ApiResponse from '../utils/ApiResponce.js';
import transporter, { TemplateReader } from '../utils/transporter.js';
import bcrypt from 'bcryptjs';

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
  const { name, email, role } = req.body;
  const userRole = req.user.role;
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
    throw new ApiError(400, 'user with this email is already exists');
  }
  let password = Math.random().toString(32).slice(2, 10);
  let resetToken = Math.random().toString(32).slice(2, 10);
  const hashedResetToken = await bcrypt.hash(resetToken, 10);
  let resetTokenExpire = Date.now() + 2 * 24 * 60 * 60 * 1000;
  const newUser = await User.create({
    name,
    email,
    role,
    password,
    resetToken: hashedResetToken,
    isActive: false,
    resetTokenExpire,
  });

  let html = TemplateReader();
  html = html
    .replace('{{username}}', `${name}`)
    .replace(
      '{{addNewPassword}}',
      `http://localhost:5173/new_password?resetToken=${resetToken}`,
    );

  let mailOptions = {
    from: ENV.ADMIN_EMAIL,
    to: newUser.email,
    subject: 'Welcome to ShelfOps',
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (emailError) {
    console.error('Email send failed:', emailError);
    throw new ApiError(
      500,
      'Failed to send welcome email: ' + emailError.message,
    );
  }
  const userObject = newUser.toObject();
  delete userObject.password;
  res
    .status(201)
    .json(new ApiResponse(userObject, 'user created successfully'));
});

export const getProfile = AsyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(req.user, 'profile fetched successfully'));
});
export const logout = AsyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: ENV.NODE_ENV === 'production',
  });
  res.status(200).json(new ApiResponse(null, 'logged out successfully'));
});

export const resetPassword = AsyncHandler(async (req, res) => {
  const { newPassword, resetToken } = req.body;
  if (!newPassword || !resetToken) {
    throw new ApiError(400, 'all fields are required');
  }

  // Find user by the stored hashed reset token
  const users = await User.find({ resetToken: { $exists: true } });
  let user = null;
  for (const u of users) {
    const isMatch = await bcrypt.compare(resetToken, u.resetToken);
    if (isMatch) {
      user = u;
      break;
    }
  }

  if (!user) {
    throw new ApiError(404, 'user not found');
  }
  if (!user.resetTokenExpire || user.resetTokenExpire < Date.now()) {
    throw new ApiError(403, 'reset token expired , contact administrator');
  }
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  user.isActive = true;
  await user.save();
  res.status(200).json(new ApiResponse(null, 'Password updated successfully'));
});
