const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const submissionController = require('../controllers/submissionController');
const { upload } = require('../utils/cloudinary');

router.post('/', auth, upload.single('answerSheet'), submissionController.submitAnswerSheet);
router.get('/exam/:examId', auth, submissionController.getSubmissionsByExam);
router.get('/student/my-submissions', auth, submissionController.getMySubmissions);
router.get('/:submissionId', auth, submissionController.getSubmissionById);
router.post('/:submissionId/re-evaluate', auth, submissionController.reEvaluate);
router.post('/:submissionId/scan', auth, submissionController.scanSubmission);
router.post('/:submissionId/grade', auth, submissionController.gradeSubmission);
router.put('/:submissionId/score', auth, submissionController.updateScore);

module.exports = router;
