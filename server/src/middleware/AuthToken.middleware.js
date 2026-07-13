import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import ENV from '../config/ENV.js';
import { User } from '../models/user.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';

const AuthToken = AsyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new ApiError(403, 'Unauthorized');
  }
  const decoded = await jwt.verify(token, ENV.JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }
  req.user = user;
  next();
});

export default AuthToken;
