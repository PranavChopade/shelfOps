import AsyncHandler from '../utils/AsyncHandler.js';
import { Book } from '../models/book.model.js';
import ApiResponse from '../utils/ApiResponce.js';
import ApiError from '../utils/ApiError.js';
import { BorrowRecord } from '../models/BorrowRecord.model.js';

export const addBook = AsyncHandler(async (req, res) => {
  const { title, author, totalCopies } = req.body;

  if (!['title', 'author'].every((field) => req.body[field])) {
    throw new ApiError(400, 'all fields are required');
  }
  if (totalCopies !== undefined) {
    const copies = Number(totalCopies);
    if (!Number.isInteger(copies) || copies < 1) {
      throw new ApiError(400, 'totalCopies must be a positive integer');
    }
  }
  const existingBook = await Book.findOne({
    title: { $regex: `^${title}$`, $options: 'i' },
    author: { $regex: `^${author}$`, $options: 'i' },
  });
  if (existingBook) {
    throw new ApiError(409, 'book already exists');
  }

  const book = await Book.create({
    title,
    author,
    totalCopies,
    availableCopies: totalCopies,
  });
  res.status(201).json(new ApiResponse(book, 'book created successfully'));
});

export const getBooks = AsyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || 1));
  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  const skip = (page - 1) * limit;
  const search = req.query.search;
  let filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { author: { $regex: search.trim(), $options: 'i' } },
    ];
  }
  const [books, count] = await Promise.all([
    Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Book.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      {
        books,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalBooks: count,
      },
      'books fetched successfully',
    ),
  );
});

export const getBook = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) {
    throw new ApiError(404, 'book not found');
  }
  res.status(200).json(new ApiResponse(book, 'book fetched successfully'));
});

export const updateBook = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, author, totalCopies } = req.body;

  if (!['title', 'author'].every((field) => req.body[field])) {
    throw new ApiError(400, 'all fields are required');
  }

  const updateFields = {};
  if (title) {
    updateFields.title = title;
  }
  if (author) {
    updateFields.author = author;
  }
  if (totalCopies !== undefined) {
    const copies = Number(totalCopies);
    if (!Number.isInteger(copies) || copies < 1) {
      throw new ApiError(400, 'totalCopies must be a positive integer');
    }
    updateFields.totalCopies = copies;
  }
  const updatedBook = await Book.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true },
  );
  if (!updatedBook) {
    throw new ApiError(404, 'book not found');
  }

  res
    .status(200)
    .json(new ApiResponse(updatedBook, 'book updated successfully'));
});

export const deleteBook = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const isBookBorrowed = await BorrowRecord.findById(id);
  if (isBookBorrowed && isBookBorrowed.status('Borrowed')) {
    throw new ApiError(401, 'book is borrowed, cannot delete');
  }
  const book = await Book.findByIdAndDelete(id);
  if (!book) {
    throw new ApiError(404, 'book not found');
  }
  res.status(200).json(new ApiResponse(null, 'book deleted successfully'));
});
