const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();
const sequelize = require('../util/database');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Requests = require('../models/requests');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const t = await sequelize.transaction();
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const request = await Requests.create({ userId: user.id }, { transaction: t });
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = 'Forgot Password Request';
        sendSmtpEmail.htmlContent = `<html><body><p>Click <a href="http://localhost:3000/password/reset/${request.id}">here</a> to reset your password</p></body></html>`;
        sendSmtpEmail.sender = { email: 'deexith2016@gmail.com', name: 'Expense Tracker' };
        sendSmtpEmail.to = [{ email }];
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        await t.commit();
        res.status(200).json({ message: 'Email sent' });
    } catch (err) {
        console.error('Error:', err);
        await t.rollback();
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    try {
        const request = await Requests.findOne({ where: { id } });
        if (!request) {
            return res.status(404).send('<h1>Request not found</h1>');
        }
        if (!request.isActive) {
            return res.status(400).send('<h1>Link expired</h1>');
        }

        res.sendFile(path.join(__dirname, '../views/reset-password.html'));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
};

exports.updatePassword = async (req, res) => {
    const { requestId, newPassword } = req.body;
    const t = await sequelize.transaction();
    try {
        const request = await Requests.findOne({ where: { id: requestId } });
        console.log(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (!request.isActive) {
            return res.status(400).json({ message: 'Link expired' });
        }

        const user = await User.findOne({ where: { id: request.userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hashSync(newPassword, 10);

        await user.update({ password: hashedPassword }, { transaction: t });
        await request.update({ isActive: false }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error:', err);
        await t.rollback();
        res.status(500).json({ message: 'Internal server error' });
    }
};