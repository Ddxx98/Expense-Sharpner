const sequelize = require('../util/database');
require('dotenv').config();
const S3service = require('../services/S3services');

const Expense = require('../models/expense');
const User = require('../models/user');
const Download = require('../models/downloadedFiles');


exports.createExpense = async (req, res) => {
    const { description, category, amount } = req.body;
    // const user = User.findOne({ where: { id: req.user.id } });
    // console.log(user);
    // User.update({ totalExpense: user.totalExpense + amount }, { where: { id: req.user.id } }).then(result =>{}).catch(err => {
    //     return res.status(500).json(err);
    // });

    // Expense.create({ description, category, amount, userId:req.user.id }).then(result => {
    //     return res.status(201).json({ message: "Expense created", result });
    // }).catch(err => {
    //     return res.status(500).json(err);
    // });
    const t = await sequelize.transaction();
    try{
        User.findOne({ where: { id: req.user.id }, transaction: t,}).then(user => {
            User.update({ totalExpense: Number(user.totalExpense) + Number(amount) }, { where: { id: req.user.id } }).then(async result =>{await t.commit();});
        });
        Expense.create({ description, category, amount, userId:req.user.id }).then(result => {
            return res.status(201).json({ message: "Expense created", result });
        });
    } catch(err){
        await t.rollback();
        return res.status(500).json(err);
    }
}

exports.getExpenses = (req, res) => {
    Expense.findAll({where:{userId:req.user.id}}).then(result => {
        return res.status(200).json(result);
    }).catch(err => {
        return res.status(500).json(err);
    }); 
}

exports.deleteExpense = (req, res) => {
    const id = req.params.id;
    try{
        Expense.findOne({ where: { id } }).then(expense => {
            User.findOne({ where: { id: req.user.id } }).then(user => {
                User.update({ totalExpense: Number(user.totalExpense) - Number(expense.amount) }, { where: { id: req.user.id } }).then(result =>{});
            });
        });
        Expense.destroy({ where: { id } }).then(result => {
            return res.status(200).json({ message: "Expense deleted" });
        });
    } catch(err){
        return res.status(500).json(err);
    }
}

exports.downloadExpenses = async (req, res) => {
    try{
        const expenses = await Expense.findAll({where:{userId:req.user.id}})
        const stringfyExpenses = JSON.stringify(expenses);
        const filename = `expenses${req.user.id}/${new Date()}.txt`;
        const fileUrl = await S3service.uploadtoS3(stringfyExpenses, filename, process.env.AWS_BUCKET_NAME);
        console.log(fileUrl);
        if(!fileUrl){
            return res.status(500).json({ message: 'Failed to upload file' });
        }
        await Download.create({ url: fileUrl, userId: req.user.id });
        res.status(200).json({ message: 'Downloaded', fileUrl });
    } catch(err){
        res.status(500).json(err);
    }
}

exports.getDownloadedFiles = (req, res) => {
    Download.findAll({where:{userId:req.user.id}}).then(result => {
        return res.status(200).json(result);
    }).catch(err => {
        return res.status(500).json(err);
    }); 
}