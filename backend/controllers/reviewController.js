import Review from '../models/Review.js';
import Order from '../models/Order.js';

// Anyone can view reviews for a product — no login required
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Only logged-in users who have actually purchased this product can review it
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if this user has any order containing this product
    const hasPurchased = await Order.findOne({
      userId: req.user._id,
      'items.productId': productId
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }

    // Prevent duplicate reviews on the same product by the same user
    const alreadyReviewed = await Review.findOne({
      productId,
      userId: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      name: req.user.name,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProductReviews, addReview };