const express = require('express');
const { register, login } = require('../controllers/userController.js');
const  errorHandler  = require('../middlewares/errorHandler');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.use(authMiddleware);
// define protected routes here

router.use(errorHandler);

module.exports = router;