import { Router } from 'express';
import {
  getBorrowRecordHistory,
  borrowBook,
  returnBook,
} from '../controllers/borrowRecord.controller.js';
import AuthToken from '../middleware/AuthToken.middleware.js';
const router = Router();

router.post('/books/:id/borrow', AuthToken, borrowBook);
router.patch('/books/:id/return', AuthToken, returnBook);
router.get('/users/:id/borrow_history', AuthToken, getBorrowRecordHistory);
export default router;
