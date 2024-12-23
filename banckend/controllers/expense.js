const sequelize = require('../util/database');
const aws = require('aws-sdk');
require('dotenv').config();

const Expense = require('../models/expense');
const User = require('../models/user');

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
    // Expense.destroy({ where: { id } }).then(result => {
    //     return res.status(200).json({ message: "Expense deleted" });
    // }).catch(err => {
    //     return res.status(500).json(err);
    // });
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
        const expenses = await req.user.getExpenses();
        const stringfyExpenses = JSON.stringify(expenses);
        const filename = 'expenses.json';
        const fileUrl = uploadtoS3(stringfyExpenses, filename);
        if(!fileUrl){
            return res.status(500).json({ message: 'Failed to upload file' });
        }
        res.status(200).json({ message: 'Downloaded', fileUrl });
    } catch(err){
        res.status(500).json(err);
    }
}

function uploadtoS3(data, filename){
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: data
    };
    s3.upload(params, (err, data) => {
        if(err){
            console.log(err);
            return 
        }
        return data.Location;
    });
}