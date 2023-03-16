const express = require('express');
const { register, login } = require('../controllers/authController');
const  errorHandler  = require('../middlewares/errorHandler');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// define protected routes here

router.use(errorHandler);

module.exports = router;