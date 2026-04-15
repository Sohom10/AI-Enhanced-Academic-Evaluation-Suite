const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questionPaperUrl: {
        type: String, // URL from Cloudinary
        required: true,
    },
    rubricUrl: {
        type: String, // Optional URL for grading rubric
    },
    totalMarks: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Exam', ExamSchema);
