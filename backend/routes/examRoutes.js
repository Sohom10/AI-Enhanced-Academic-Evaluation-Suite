const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const examController = require('../controllers/examController');
const { upload } = require('../utils/cloudinary');

router.post('/', auth, upload.single('questionPaper'), examController.createExam);
router.get('/', auth, examController.getExams);
router.get('/:id', auth, examController.getExamById);
router.post('/:id/end', auth, examController.endExam);

module.exports = router;
