const express = require('express');
const {
  getPosts,
  getPost,
  getPostBySlug, 
  deletePost,
  updatePost,
  addPost
} = require('../controllers/posts');
const { verifyAdmin } = require('../middlewares/auth');

const router = express.Router();

// Get all posts
router.get('/', getPosts);

router.get('/:slug', getPostBySlug);

// Optional: fallback for numeric IDs only
router.get('/id/:id', getPost);

//  Add a new post
router.post('/', verifyAdmin, addPost);

// Update post
router.put('/:id', verifyAdmin, updatePost);

// Delete post
router.delete('/:id', verifyAdmin, deletePost);

module.exports = router;
