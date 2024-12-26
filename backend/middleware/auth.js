const jwt = require('jsonwebtoken');

module.exports.userAuthenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, "deexith2024");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Auth failed" });
    }
}