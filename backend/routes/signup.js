const express = require('express');

const signupController = require('../controllers/singnup');
const userMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', signupController.createUser);

router.put('/', userMiddleware.userAuthenticate , signupController.updateUserpremium);

module.exports = router;