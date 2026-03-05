


const express = require('express')
const router = express.Router();
const { verifyAdmin } = require('../middlewares/auth');

const { GetContacts, submitContact

} = require('../controllers/contacts')

// GET method route


router.post('/', submitContact);
router.get('/', verifyAdmin, GetContacts)

module.exports = router
