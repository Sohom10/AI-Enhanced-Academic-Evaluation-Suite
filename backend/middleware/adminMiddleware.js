module.exports = function (req, res, next) {
    // req.user is already set by auth middleware
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    next();
};
