const { db } = require('../utils/firebase');
const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/aiService');

// @desc    Create a new exam (Upload question paper)
// @access  Private (Teacher only)
exports.createExam = async (req, res) => {
    try {
        const { title, description, totalMarks } = req.body;

        // Ensure the user is a teacher
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can create exams.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a question paper file' });
        }

        const examId = uuidv4();

        const newExam = {
            _id: examId,
            title,
            description,
            totalMarks,
            teacherId: req.user.id,
            questionPaperUrl: req.file.path,
            questionPaperText: null, // Will be filled by AI
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await db.collection('exams').doc(examId).set(newExam);
        
        // Fire off Question Paper transcription in background
        aiService.transcribeQuestionPaper(newExam.questionPaperUrl, req.file.filename)
            .then(async (text) => {
                console.log(`Successfully transcribed Question Paper for exam ${examId}`);
                await db.collection('exams').doc(examId).update({ questionPaperText: text });
            })
            .catch(err => {
                console.error(`Failed to transcribe Question Paper for exam ${examId}:`, err);
            });

        res.status(201).json(newExam);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all exams
// @access  Private
exports.getExams = async (req, res) => {
    try {
        const examsSnapshot = await db.collection('exams').get();
        const exams = [];

        // We need to fetch the professor details too if possible
        // But for generic listing, let's just return exams
        examsSnapshot.forEach(doc => {
            exams.push({ _id: doc.id, ...doc.data() });
        });

        res.json(exams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get exam by ID
// @access  Private
exports.getExamById = async (req, res) => {
    try {
        const examDoc = await db.collection('exams').doc(req.params.id).get();

        if (!examDoc.exists) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const exam = { _id: examDoc.id, ...examDoc.data() };
        res.json(exam);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    End an exam
// @access  Private (Teacher only)
exports.endExam = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can end exams.' });
        }

        const examRef = db.collection('exams').doc(id);
        const examDoc = await examRef.get();

        if (!examDoc.exists) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (examDoc.data().teacherId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only end your own exams.' });
        }

        await examRef.update({ status: 'closed' });

        res.json({ message: 'Exam closed successfully', status: 'closed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
