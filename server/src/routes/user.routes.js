import { Router } from 'express';
import {
  login,
  addUser,
  getProfile,
  logout,
  resetPassword,
} from '../controllers/user.controller.js';
import verifyRole from '../middleware/verifyRole.middleware.js';
import AuthToken from '../middleware/AuthToken.middleware.js';

const router = Router();

router.post('/login', login);
router.post(
  '/add_user',
  AuthToken,
  verifyRole(['admin', 'librarian']),
  addUser,
);
router.get('/profile', AuthToken, getProfile);
router.post('/logout', AuthToken, logout);
router.post('/new_password', resetPassword);

export default router;
