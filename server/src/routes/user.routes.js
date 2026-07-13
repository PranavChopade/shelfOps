import { Router } from 'express';
import { login } from '../controllers/user.controller.js';
const router = Router();

router.post('/login', login);

export default router;
