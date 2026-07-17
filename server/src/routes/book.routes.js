import { Router } from 'express';
import AuthToken from '../middleware/AuthToken.middleware.js';
import verifyRole from '../middleware/verifyRole.middleware.js';
import {
  addBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} from '../controllers/book.controller.js';

const router = Router();

router.post('/add_book', AuthToken, verifyRole(['librarian']), addBook);
router.get('/get_books', AuthToken, getBooks);
router.get('/get_book/:id', AuthToken, getBook);
router.patch(
  '/update_book/:id',
  AuthToken,
  verifyRole(['librarian']),
  updateBook,
);
router.delete(
  '/delete_book/:id',
  AuthToken,
  verifyRole(['librarian']),
  deleteBook,
);

export default router;
