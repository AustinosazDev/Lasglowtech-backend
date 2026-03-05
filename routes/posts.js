const express = require('express');
const {
  getPosts,
  getPost,
  getPostBySlug, 
  deletePost,
  updatePost,
  addPost
} = require('../controllers/posts');

const router = express.Router();

// Get all posts
router.get('/', getPosts);

router.get('/:slug', getPostBySlug);

// Optional: fallback for numeric IDs only
router.get('/id/:id', getPost);

//  Add a new post
router.post('/', addPost);

// Update post
router.put('/:id', updatePost);

// Delete post
router.delete('/:id', deletePost);

module.exports = router;
