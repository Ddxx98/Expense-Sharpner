const express = require('express');

const premiumController = require('../controllers/premium');
const userMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', userMiddleware.userAuthenticate , premiumController.createPremium);

router.put('/', userMiddleware.userAuthenticate , premiumController.updateOrder);

router.get('/leaderboard', userMiddleware.userAuthenticate , premiumController.showLeaderboard);

module.exports = router;