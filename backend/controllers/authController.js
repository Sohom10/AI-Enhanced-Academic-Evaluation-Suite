const { db } = require('../utils/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, identifier, password, role } = req.body;

        // Check if user exists
        const userRef = db.collection('users').doc(identifier);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).json({ message: 'User with this identifier already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserData = {
            name,
            identifier,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
        };

        await userRef.set(newUserData);

        // Create token
        const payload = {
            user: {
                id: identifier, // In Firebase, the document ID is the identifier
                role: role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role, name });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Check if user exists
        const userRef = db.collection('users').doc(identifier);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = userDoc.data();

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: identifier,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, name: user.name });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get current logged in user
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const userRef = db.collection('users').doc(req.user.id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userDoc.data();
        delete user.password; // Don't send password hash
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
