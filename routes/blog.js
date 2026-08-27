const express = require('express');
const { verifyAdmin } = require('../middlewares/auth');
const {
  // Posts
  getPublishedPosts,
  getAllPosts,
  getPostBySlug,
  getPostById,
  incrementViewCount,
  getPopularPosts,
  getRelatedPosts,
  getCategoryCounts,
  addPost,
  updatePost,
  deletePost,
  
  // Comments
  getComments,
  getAllComments,
  submitComment,
  moderateComment,
  deleteComment,
  
  // Likes
  toggleLike,
  hasUserLiked,
  
  // Newsletter
  subscribeToNewsletter
} = require('../controllers/blog');

const router = express.Router();

// PUBLIC POST ENDPOINTS
// Get all published posts with filtering
router.get('/published', getPublishedPosts);

// Get popular posts
router.get('/popular', getPopularPosts);

// Get category counts
router.get('/categories/counts', getCategoryCounts);

// Get single post by slug (published)
router.get('/slug/:slug', getPostBySlug);

// Get related posts
router.get('/related/:category/:currentPostId', getRelatedPosts);

// Get comments for a post
router.get('/:postId/comments', getComments);

// Check if user liked a post
router.get('/:postId/like/status', hasUserLiked);

// ADMIN POST ENDPOINTS
// Get all posts (including drafts)
router.get('/admin/all', getAllPosts);

// Get single post by ID (for admin)
router.get('/admin/:id', getPostById);

// Create new post
router.post('/', addPost);

// Update post
router.put('/:id', updatePost);

// Delete post
router.delete('/:id', deletePost);

// COMMENT ENDPOINTS
// Get all comments for admin
router.get('/comments/admin/all', verifyAdmin, getAllComments);

// Submit comment
router.post('/comments', submitComment);

// Moderate comment
router.put('/comments/:commentId/moderate', verifyAdmin, moderateComment);

// Delete comment
router.delete('/comments/:commentId', verifyAdmin, deleteComment);

// LIKE ENDPOINTS
// Toggle like
router.post('/:postId/like', toggleLike);

// VIEW COUNT ENDPOINT
// Increment view count
router.post('/:postId/view', incrementViewCount);

// NEWSLETTER ENDPOINT
// Subscribe to newsletter
router.post('/newsletter/subscribe', subscribeToNewsletter);

module.exports = router;