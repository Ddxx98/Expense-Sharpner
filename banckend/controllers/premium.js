const razorpay = require('razorpay');
const Sequelize = require('sequelize');

const Order = require('../models/order');
const User = require('../models/user');
const Expense = require('../models/expense');

const instance = new razorpay({
    key_id: 'rzp_test_LMHe9EIi6NCC7j',
    key_secret: 'oIQI8UQFfq8eEqBPKB6IJSqF'
});

exports.createPremium = (req, res) => {
    const options = {
        amount: 1000,
        currency: "INR",
        receipt: "receipt#1",
        notes: {}
    };
    instance.orders.create(options, (err, order) => {
        if (err) {
            return res.status(500).json(err);
        }
        Order.create({ orderId: order.id, status: "Pending", userId: req.user.id }).then(result => {
            return res.status(200).json({ order, key_id: 'rzp_test_LMHe9EIi6NCC7j' });
        }).catch(err => {
            return res.status(500).json(err);
        });
    });
}

exports.updateOrder = (req, res) => {
    const { orderId, paymentId, status } = req.body;
    let msg = "Order Updated"
    if (status === "Success") {
        User.update({ isPremium: true }, { where: { id: req.user.id } }).then(result => {
            msg = msg + " and User is now premium";
        }).catch(err => {
            return res.status(500).json(err);
        });
    }
    Order.update({ status, paymentId }, { where: { orderId } }).then(result => {
        res.status(200).json({ message: msg });
    }).catch(err => {
        res.status(500).json(err);
    });
}

exports.showLeaderboard = async (req, res) => {
    try {
        // const users = await User.findAll();
        // const leaderboardData = await Promise.all(
        //     users.map(async (user) => {
        //         const expenses = await Expense.findAll({ where: { userId: user.id } });
        //         const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        //         return { name: user.name, totalExpense };
        //     })
        // );
        // leaderboardData.sort((a, b) => b.totalExpense - a.totalExpense);
        // const leaderboardData = await User.findAll({
        //     attributes: ['id', 'name',  [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 0), 'totalExpense']],
        //     include: [
        //         {
        //             model: Expense,
        //             attributes: [],
        //         },
        //     ],
        //     group: ['User.id'], 
        //     order: [['totalExpense', 'DESC']],
        // });
        const leaderboardData = await User.findAll({ order: [['totalExpense', 'DESC']] });
        res.status(200).json(leaderboardData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};