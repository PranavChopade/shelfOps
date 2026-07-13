import ApiError from '../utils/ApiError.js';
const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'you are not allowed');
    }
    next();
  };
};

export default verifyRole;
