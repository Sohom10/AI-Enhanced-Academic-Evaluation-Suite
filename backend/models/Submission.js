const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    answerSheetUrl: {
        type: String, // URL from Cloudinary
        required: true,
    },
    extractedText: {
        type: String, // Output from OCR
    },
    aiScore: {
        type: Number, // Score given by AI
    },
    aiFeedback: {
        type: String, // Feedback provided by AI
    },
    finalScore: {
        type: Number, // Manually adjusted score by teacher
    },
    status: {
        type: String,
        enum: ['submitted', 'ai_evaluating', 'evaluated', 'reviewed'],
        default: 'submitted',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Submission', SubmissionSchema);
