const express = require('express');
const articleController = require('../controllers/article');

const router = express.Router();

// Route to get all posts
router.get('/',articleController.getAllBlogs);



module.exports = router;