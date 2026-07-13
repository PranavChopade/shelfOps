import { Router } from 'express';
import { login, addUser, logout } from '../controllers/user.controller.js';
import verifyRole from '../middleware/verifyRole.middleware.js';
import AuthToken from '../middleware/AuthToken.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/add_user', verifyRole(['admin', 'librarian']), addUser);
router.post('/logout', AuthToken, logout);

export default router;
