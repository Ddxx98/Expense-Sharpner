const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
//apiKey.apiKey = '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';
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Forgot Password";
    sendSmtpEmail.htmlContent = `<html><body><p>Click <a href="http://localhost:3000/reset-password/${email}">here</a> to reset your password</p></body></html>`;
    sendSmtpEmail.sender = { email: "deexith2016@gmail.com", name: "Deexith" };
    sendSmtpEmail.to = [{ email }];
    apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
        res.status(200).json({ message: "Email sent" });
    }).catch(err => {
        res.status(500).json(err);
    });
}