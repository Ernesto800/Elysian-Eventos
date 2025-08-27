const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada.' });
    }

    try {
        const tokenWithoutBearer = token.split(' ')[1];
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET || 'secret_key');
        
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'El token no es válido.' });
    }
};