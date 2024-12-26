const express = require('express');

const passwordController = require('../controllers/password');

const router = express.Router();

router.post('/forgot', passwordController.forgotPassword);

router.get('/reset/:id', passwordController.resetPassword);

router.post('/update', passwordController.updatePassword);

module.exports = router;