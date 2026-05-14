import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            throw new Error('Authentication failed!');
        }
        const decodedToken = jwt.verify(token, 'your_jwt_secret'); // Use the same secret as in the controller
        req.userData = { userId: decodedToken.userId, email: decodedToken.email, userType: decodedToken.userType };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed!' });
    }
};
