const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const Review = require('../models/review.model');
const Book = require('../models/book.model');

const router = express.Router();

// Validation middleware
const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty()
];

// Create a review for a book
router.post('/:bookId', auth, validateReview, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: req.params.bookId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    const review = new Review({
      user: req.user._id,
      book: req.params.bookId,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await review.save();

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// Update a review
router.put('/:id', auth, validateReview, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized'
      });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized'
      });
    }

    await Review.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

module.exports = router; 