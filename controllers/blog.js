const path = require('path');
const crypto = require('crypto');
const db = require('../db.js');
const config = require('../config');
const { remote_server_api } = config;
const localServerApi = process.env.LOCAL_SERVER_API || `http://localhost:${config.port || 5000}`;

// Helper to build full thumbnail URL
const buildThumbnailUrl = (filename) => {
  if (!filename) return null;
  if (/^https?:\/\//i.test(filename)) return filename;
  const isLocal = process.env.NODE_ENV !== 'production';
  return isLocal
    ? `${localServerApi}/uploads/images/${filename}`
    : `${remote_server_api}/uploads/images/${filename}`;
};

// Utility to create slugs from titles
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and symbols with "-"
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens

// GET all published posts with optional category filter
const getPublishedPosts = async (req, res) => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;
    let query = `
      SELECT id, thumbnail, title, slug, excerpt, content, category, status, 
             author_name, author_avatar, created_at, updated_at, published_at, 
             view_count, likes_count, comments_count 
      FROM posts 
      WHERE status = 'published'
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [data] = await db.query(query, params);
    const posts = data.map(post => ({
      ...post,
      thumbnailUrl: buildThumbnailUrl(post.thumbnail)
    }));
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching published posts:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET all posts (including drafts) for admin
const getAllPosts = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = `
      SELECT id, thumbnail, title, slug, excerpt, content, category, status, 
             author_name, author_avatar, created_at, updated_at, published_at, 
             view_count, likes_count, comments_count 
      FROM posts
    `;
    const params = [];

    const conditions = [];
    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('title LIKE ?');
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [data] = await db.query(query, params);
    const posts = data.map(post => ({
      ...post,
      thumbnailUrl: buildThumbnailUrl(post.thumbnail)
    }));
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching all posts:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET single post by slug (published only)
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [data] = await db.query(
      `SELECT id, thumbnail, title, slug, excerpt, content, category, status, 
              author_name, author_avatar, created_at, updated_at, published_at, 
              view_count, likes_count, comments_count 
       FROM posts 
       WHERE slug = ? AND status = 'published'`,
      [slug]
    );
    
    if (!data.length) return res.status(404).json({ message: "Post not found" });

    const post = data[0];
    post.thumbnailUrl = buildThumbnailUrl(post.thumbnail);
    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post by slug:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET single post by ID (for admin editing)
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query(
      `SELECT id, thumbnail, title, slug, excerpt, content, category, status, 
              author_name, author_avatar, created_at, updated_at, published_at, 
              view_count, likes_count, comments_count 
       FROM posts 
       WHERE id = ?`,
      [id]
    );
    
    if (!data.length) return res.status(404).json({ message: "Post not found" });

    const post = data[0];
    post.thumbnailUrl = buildThumbnailUrl(post.thumbnail);
    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// Increment view count for a post
const incrementViewCount = async (req, res) => {
  try {
    const { postId } = req.params;
    await db.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ? AND status = "published"', [postId]);
    res.status(200).json({ message: "View count incremented" });
  } catch (err) {
    console.error('Error incrementing view count:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get popular posts by view count
const getPopularPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const [data] = await db.query(
      `SELECT id, thumbnail, title, slug, excerpt, category, view_count, likes_count, comments_count 
       FROM posts 
       WHERE status = 'published' 
       ORDER BY view_count DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    const posts = data.map(post => ({
      ...post,
      thumbnailUrl: buildThumbnailUrl(post.thumbnail)
    }));
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching popular posts:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get related posts by category
const getRelatedPosts = async (req, res) => {
  try {
    const { category, currentPostId } = req.params;
    const { limit = 3 } = req.query;
    
    const [data] = await db.query(
      `SELECT id, thumbnail, title, slug, excerpt, category, view_count, likes_count, comments_count 
       FROM posts 
       WHERE status = 'published' AND category = ? AND id != ? 
       ORDER BY published_at DESC 
       LIMIT ?`,
      [category, currentPostId, parseInt(limit)]
    );
    
    const posts = data.map(post => ({
      ...post,
      thumbnailUrl: buildThumbnailUrl(post.thumbnail)
    }));
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching related posts:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get category counts
const getCategoryCounts = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM posts 
       WHERE status = 'published' 
       GROUP BY category`
    );
    
    const counts = {};
    data.forEach(row => {
      counts[row.category] = row.count;
    });
    res.status(200).json(counts);
  } catch (err) {
    console.error('Error fetching category counts:', err);
    res.status(500).json({ error: err.message });
  }
};

// ADD a new post
const addPost = async (req, res) => {
  const { thumbnail, title, slug: requestedSlug, excerpt, content, category, status, author_name, author_avatar } = req.body;
  
  if (!title || !content || content.trim() === "") {
    return res.status(400).json({ error: "Title and content are required." });
  }

  const filename = thumbnail ? (/^https?:\/\//i.test(thumbnail) ? thumbnail : path.basename(thumbnail)) : null;
  const slug = slugify(requestedSlug || title);
  const postStatus = status || 'draft';
  const postCategory = category || 'Company News';
  const publishedAt = postStatus === 'published' ? new Date() : null;

  const query = `
    INSERT INTO posts 
    (thumbnail, title, slug, excerpt, content, category, status, author_name, author_avatar, published_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    filename, title, slug, excerpt || null, content, postCategory, postStatus, 
    author_name || null, author_avatar || null, publishedAt
  ];

  try {
    const [result] = await db.query(query, values);
    res.status(201).json({
      message: "Post created successfully",
      postId: result.insertId,
      slug,
      thumbnailUrl: buildThumbnailUrl(filename)
    });
  } catch (err) {
    console.error('Error creating post:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "A post with this slug already exists." });
    }
    res.status(500).json({ error: err.message });
  }
};

// UPDATE a post
const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { thumbnail, title, slug: requestedSlug, excerpt, content, category, status, author_name, author_avatar } = req.body;

  if (!title || !content || content.trim() === "") {
    return res.status(400).json({ error: "Title and content cannot be empty." });
  }

  const filename = thumbnail ? (/^https?:\/\//i.test(thumbnail) ? thumbnail : path.basename(thumbnail)) : null;
  const slug = slugify(requestedSlug || title);
  const postCategory = category || 'Company News';
  
  // If status is being changed to published and wasn't before, set published_at
  let updateQuery = `
    UPDATE posts 
    SET title = ?, slug = ?, excerpt = ?, content = ?, category = ?, 
        author_name = ?, author_avatar = ?
  `;
  const values = [title, slug, excerpt || null, content, postCategory, author_name || null, author_avatar || null];

  if (filename) {
    updateQuery += ', thumbnail = ?';
    values.push(filename);
  }

  if (status) {
    updateQuery += ', status = ?';
    values.push(status);
    
    // Set published_at if transitioning to published
    updateQuery += `, published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END`;
    values.push(status);
  }

  updateQuery += ' WHERE id = ?';
  values.push(postId);

  try {
    await db.query(updateQuery, values);
    res.status(200).json({
      message: "Post updated successfully",
      slug,
      thumbnailUrl: filename ? buildThumbnailUrl(filename) : null
    });
  } catch (err) {
    console.error('Error updating post:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "A post with this slug already exists." });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE a post
const deletePost = async (req, res) => {
  try {
    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: err.message });
  }
};

// COMMENTS
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const [data] = await db.query(
      `SELECT id, post_id, author_name, author_email, content, status, created_at 
       FROM blog_comments 
       WHERE post_id = ? AND status = 'approved' 
       ORDER BY created_at ASC`,
      [postId]
    );
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: err.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const { status, postId } = req.query;
    let query = `
      SELECT c.*, p.title as post_title 
      FROM blog_comments c
      LEFT JOIN posts p ON c.post_id = p.id
    `;
    const params = [];

    const conditions = [];
    if (status && status !== 'All') {
      conditions.push('c.status = ?');
      params.push(status);
    }
    if (postId) {
      conditions.push('c.post_id = ?');
      params.push(postId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';

    const [data] = await db.query(query, params);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching all comments:', err);
    res.status(500).json({ error: err.message });
  }
};

const submitComment = async (req, res) => {
  const { post_id, author_name, author_email, content } = req.body;
  
  if (!post_id || !author_name || !author_email || !content || content.trim() === "") {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (content.length > 1000) return res.status(400).json({ error: "Comments cannot exceed 1000 characters." });

  try {
    const [result] = await db.query(
      `INSERT INTO blog_comments (post_id, author_name, author_email, content, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [post_id, author_name, author_email, content]
    );
    
    // Update comment count
    await db.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [post_id]);
    
    res.status(201).json({
      message: "Comment submitted successfully",
      commentId: result.insertId
    });
  } catch (err) {
    console.error('Error submitting comment:', err);
    res.status(500).json({ error: err.message });
  }
};

const moderateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    await db.query('UPDATE blog_comments SET status = ? WHERE id = ?', [status, commentId]);
    res.status(200).json({ message: `Comment ${status} successfully` });
  } catch (err) {
    console.error('Error moderating comment:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const [comment] = await db.query('SELECT post_id FROM blog_comments WHERE id = ?', [commentId]);
    
    if (comment.length > 0) {
      await db.query('DELETE FROM blog_comments WHERE id = ?', [commentId]);
      await db.query('UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?', [comment[0].post_id]);
    }
    
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: err.message });
  }
};

// LIKES
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, anonymous_fingerprint } = req.body;
    
    if (!user_id && !anonymous_fingerprint) {
      return res.status(400).json({ error: "Either user_id or anonymous_fingerprint is required." });
    }

    // Check if already liked
    let checkQuery = 'SELECT id FROM blog_likes WHERE post_id = ?';
    const checkParams = [postId];
    
    if (user_id) {
      checkQuery += ' AND user_id = ?';
      checkParams.push(user_id);
    } else {
      checkQuery += ' AND anonymous_fingerprint = ?';
      checkParams.push(anonymous_fingerprint);
    }

    const [existing] = await db.query(checkQuery, checkParams);

    if (existing.length > 0) {
      // Remove like
      await db.query('DELETE FROM blog_likes WHERE id = ?', [existing[0].id]);
      await db.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [postId]);
      res.status(200).json({ liked: false });
    } else {
      // Add like
      await db.query(
        'INSERT INTO blog_likes (post_id, user_id, anonymous_fingerprint) VALUES (?, ?, ?)',
        [postId, user_id || null, anonymous_fingerprint || null]
      );
      await db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      res.status(200).json({ liked: true });
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: err.message });
  }
};

const hasUserLiked = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, anonymous_fingerprint } = req.query;
    
    if (!user_id && !anonymous_fingerprint) {
      return res.status(200).json({ liked: false });
    }

    let query = 'SELECT id FROM blog_likes WHERE post_id = ?';
    const params = [postId];
    
    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    } else {
      query += ' AND anonymous_fingerprint = ?';
      params.push(anonymous_fingerprint);
    }

    const [data] = await db.query(query, params);
    res.status(200).json({ liked: data.length > 0 });
  } catch (err) {
    console.error('Error checking like status:', err);
    res.status(500).json({ error: err.message });
  }
};

// NEWSLETTER
const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    await db.query(
      `INSERT INTO newsletter_subscribers (email, active, subscribed_at, unsubscribe_token) 
       VALUES (?, 1, NOW(), ?) 
       ON DUPLICATE KEY UPDATE active = 1, unsubscribed_at = NULL`,
      [email, crypto.randomBytes(24).toString('hex')]
    );
    res.status(201).json({ message: "Successfully subscribed to newsletter" });
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
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
};
