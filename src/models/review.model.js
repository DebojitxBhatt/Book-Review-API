const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Update book's average rating after saving/updating review
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Book = mongoose.model('Book');
  
  const stats = await Review.aggregate([
    { $match: { book: this.book } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(this.book, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Book.findByIdAndUpdate(this.book, {
      averageRating: 0,
      totalReviews: 0
    });
  }
});

// Update book's average rating after deleting review
reviewSchema.post('remove', async function() {
  await this.constructor.post('save').apply(this);
});

module.exports = mongoose.model('Review', reviewSchema); 