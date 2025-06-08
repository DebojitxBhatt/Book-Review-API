const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const Book = require('../models/book.model');

const router = express.Router();

// Validation middleware
const validateBook = [
  body('title').trim().notEmpty(),
  body('author').trim().notEmpty(),
  body('genre').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() })
];

// Create a new book (authenticated)
router.post('/', auth, validateBook, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
});

// Get all books with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.author) {
      query.author = new RegExp(req.query.author, 'i');
    }
    if (req.query.genre) {
      query.genre = new RegExp(req.query.genre, 'i');
    }

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

// Search books
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    };

    const books = await Book.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(searchQuery);

    res.json({
      success: true,
      data: books,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching books',
      error: error.message
    });
  }
});

// Get book by ID with reviews
router.get('/:id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const book = await Book.findById(req.params.id)
      .populate({
        path: 'reviews',
        options: {
          skip,
          limit,
          sort: { createdAt: -1 }
        },
        populate: {
          path: 'user',
          select: 'username'
        }
      });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const totalReviews = book.totalReviews;

    res.json({
      success: true,
      data: book,
      pagination: {
        current: page,
        total: Math.ceil(totalReviews / limit),
        totalItems: totalReviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

module.exports = router; 