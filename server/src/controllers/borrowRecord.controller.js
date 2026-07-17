import { BorrowRecord } from '../models/BorrowRecord.model.js';
import asyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponce.js';
import { Book } from '../models/book.model.js';

export const getBorrowRecordHistory = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const search = req.query.search;
  let filter = {
    userId: id,
  };

  const book = await Book.find({
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ],
  });

  const bookIds = book.map((book) => book._id);
  if (search) {
    filter.bookId = { $in: bookIds };
  }
  const [borrowHistory, count] = await Promise.all([
    BorrowRecord.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('bookId'),
    BorrowRecord.countDocuments(filter),
  ]);

  if (borrowHistory.length === 0) {
    throw new ApiError(404, 'no borrow records found');
  }
  res.status(200).json(
    new ApiResponse(
      {
        borrowHistory,
        limit,
        currentPage: page,
        totalPages: count / limit,
        total: count,
      },
      'borrow records history fetched',
    ),
  );
});

export const borrowBook = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const book = await Book.findOne({ _id: id });
  if (!book) {
    throw new ApiError(404, 'no book found');
  }
  if (book.availableCopies < 1) {
    throw new ApiError(400, 'book copies not available at the moment');
  }
  const borrowBook = await BorrowRecord.create({
    userId,
    bookId: id,
    returnDate: null,
    fine: 0,
    status: 'Borrowed',
  });
  book.availableCopies = book.availableCopies - 1;
  await book.save();
  res
    .status(201)
    .json(new ApiResponse(borrowBook, 'book borrowed successfully'));
});

export const returnBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const borrowRecord = await BorrowRecord.findById(id);
  if (!borrowRecord) {
    throw new ApiError(404, 'record not found');
  }
  if (borrowRecord.status === 'Returned') {
    throw new ApiError(400, 'book already returned');
  }

  const bookData = {
    status: 'Returned',
    returnDate: Date.now(),
  };
  if (Date.now() > borrowRecord.dueDate) {
    bookData.fine = 20;
  }
  const updatedBorrowRecord = await BorrowRecord.findByIdAndUpdate(
    id,
    bookData,
    {
      new: true,
    },
  );
  const book = await Book.findById(borrowRecord.bookId);
  if (!book) {
    throw new ApiError(404, 'book not found');
  }
  book.availableCopies += 1;
  await book.save();

  res
    .status(200)
    .json(new ApiResponse(updatedBorrowRecord, 'book returned successfully'));
});
