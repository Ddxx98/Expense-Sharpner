const express = require('express');
const userMiddleware = require('../middleware/auth');

const expenseController = require('../controllers/expense');

const router = express.Router();

router.post('/', userMiddleware.userAuthenticate , expenseController.createExpense);

router.get('/', userMiddleware.userAuthenticate, expenseController.getExpenses); 

router.delete('/:id', userMiddleware.userAuthenticate, expenseController.deleteExpense);

router.get('/download', userMiddleware.userAuthenticate, expenseController.downloadExpenses);

router.get('/downloaded', userMiddleware.userAuthenticate, expenseController.getDownloadedFiles);

module.exports = router;