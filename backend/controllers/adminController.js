const { db } = require('../utils/firebase');
const bcrypt = require('bcryptjs');

// @desc    Get all students and teachers
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            // Don't send passwords
            delete userData.password;
            users.push(userData);
        });

        // Split into students and teachers for easier UI handling
        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');
        const admins = users.filter(u => u.role === 'admin');

        res.json({ students, teachers, admins });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new user (Student or Teacher)
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { name, identifier, password, role } = req.body;

        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

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

        // Don't return the password
        delete newUserData.password;
        res.status(201).json(newUserData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a user
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { identifier } = req.params;

        // Prevent admin from deleting themselves if they are the one logged in
        if (identifier === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const userRef = db.collection('users').doc(identifier);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userRef.delete();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get dashboard statistics
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const examsSnapshot = await db.collection('exams').where('status', '==', 'active').get();
        const activeExamIds = examsSnapshot.docs.map(doc => doc.id);

        let studentCount = 0;
        let teacherCount = 0;

        usersSnapshot.forEach(doc => {
            if (doc.data().role === 'student') studentCount++;
            if (doc.data().role === 'teacher') teacherCount++;
        });

        // Count submissions only for active exams
        let activeSubmissionsCount = 0;
        if (activeExamIds.length > 0) {
            // Firestore 'in' query has a limit of 10 items, so we'll fetch all and filter in memory for robustness
            // OR we can fetch where examId is in the list if list is small.
            // For a dashboard, fetching all submissions and filter is safer if the number of active exams grows.
            const submissionsSnapshot = await db.collection('submissions').get();
            submissionsSnapshot.forEach(doc => {
                if (activeExamIds.includes(doc.data().examId)) {
                    activeSubmissionsCount++;
                }
            });
        }

        res.json({
            students: studentCount,
            teachers: teacherCount,
            exams: examsSnapshot.size,
            submissions: activeSubmissionsCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
