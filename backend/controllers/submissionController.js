const { db } = require('../utils/firebase');
const aiService = require('../services/aiService');
const { v4: uuidv4 } = require('uuid');

// @desc    Submit an answer sheet
// @access  Private (Student only)
exports.submitAnswerSheet = async (req, res) => {
    try {
        const { examId } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can submit exams.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload your answer sheet.' });
        }

        // Get exam
        const examDoc = await db.collection('exams').doc(examId).get();
        if (!examDoc.exists) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        const exam = examDoc.data();

        // Check if exam is active
        if (exam.status === 'closed') {
            return res.status(400).json({ message: 'This exam has ended and is no longer accepting submissions.' });
        }

        // Check if previously submitted
        const submissionQuery = await db.collection('submissions')
            .where('examId', '==', examId)
            .where('studentId', '==', req.user.id)
            .get();

        if (!submissionQuery.empty) {
            return res.status(400).json({ message: 'You have already submitted this exam.' });
        }

        const submissionId = uuidv4();

        const newSubmission = {
            _id: submissionId,
            studentId: req.user.id,
            examId,
            answerSheetUrl: req.file.path,
            publicId: req.file.filename,
            status: 'ai_evaluating',
            aiAttempts: 1, // First automatic attempt
            createdAt: new Date().toISOString()
        };

        await db.collection('submissions').doc(submissionId).set(newSubmission);

        // Prepare exam details for context (using already fetched 'exam')
        const examDetails = `Title: ${exam.title}\nDescription: ${exam.description || ''}\nTotal Marks: ${exam.totalMarks}`;

        // Prepared callback for real-time checkpoints
        const checkpointUpdate = async (updates) => {
            console.log(`[Checkpoint] Submission ${submissionId}:`, Object.keys(updates));
            await db.collection('submissions').doc(submissionId).update({
                ...updates,
                aiError: null // Clear any previous error on successful checkpoint
            });

            // Extra Logic: If AI extracted the Question Paper text, save it to the exam
            if (updates.questionPaperText && !exam.questionPaperText) {
                console.log(`Self-Healing: Saving transcribed Question Paper text to exam ${examId}`);
                await db.collection('exams').doc(examId).update({ questionPaperText: updates.questionPaperText });
            }
        };

        // Fire off AI Evaluation in background
        aiService.evaluateSubmission(
            newSubmission.answerSheetUrl, 
            newSubmission.publicId, 
            examDetails, 
            exam.questionPaperUrl, 
            exam.questionPaperText,
            exam.totalMarks || 100,
            checkpointUpdate
        ).catch(async (err) => {
            console.error(`Auto-eval failure for ${submissionId}:`, err);
            await db.collection('submissions').doc(submissionId).update({ 
                status: 'submitted',
                aiError: err.message || "Automatic evaluation failed."
            });
        });

        res.status(201).json(newSubmission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get submissions for an exam
// @access  Private (Teacher only)
exports.getSubmissionsByExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const submissionsSnapshot = await db.collection('submissions').where('examId', '==', examId).get();
        const submissions = [];

        // Manually populate student details since Firebase isn't relational
        for (const doc of submissionsSnapshot.docs) {
            const subData = doc.data();
            let student = { identifier: subData.studentId, name: 'Unknown' };

            try {
                const studentDoc = await db.collection('users').doc(subData.studentId).get();
                if (studentDoc.exists) {
                    const studentData = studentDoc.data();
                    student = { identifier: studentData.identifier, name: studentData.name || 'Unknown' };
                }
            } catch (err) {
                console.error("Error fetching student details", err);
            }

            submissions.push({
                _id: doc.id,
                ...subData,
                studentId: student // Replaces raw string with object to match frontend expected schema
            });
        }

        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get submissions for logged in student
// @access  Private (Student only)
exports.getMySubmissions = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view their submissions.' });
        }

        const studentId = req.user.id;
        const submissionsSnapshot = await db.collection('submissions').where('studentId', '==', studentId).get();
        const submissions = [];

        for (const doc of submissionsSnapshot.docs) {
            const subData = doc.data();
            let examTitle = "Unknown Exam";
            let totalMarks = "--";
            let examStatus = "active";
            
            try {
                const examDoc = await db.collection('exams').doc(subData.examId).get();
                if (examDoc.exists) {
                    const eData = examDoc.data();
                    examTitle = eData.title;
                    totalMarks = eData.totalMarks;
                    examStatus = eData.status || "active";
                }
            } catch (err) {
                console.error("Error fetching exam details", err);
            }

            submissions.push({
                _id: doc.id,
                ...subData,
                examTitle,
                totalMarks,
                examStatus
            });
        }

        // Sort by newest first
        submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update submission score (Teacher only)
// @access  Private
exports.updateScore = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { finalScore, teacherFeedback } = req.body;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can update scores.' });
        }

        const submissionRef = db.collection('submissions').doc(submissionId);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const updatedData = {
            finalScore,
            teacherFeedback: teacherFeedback || "",
            status: 'reviewed'
        };

        await submissionRef.update(updatedData);

        res.json({ _id: submissionId, ...submissionDoc.data(), ...updatedData });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Re-evaluate a submission with AI
// @access  Private (Teacher only)
exports.reEvaluate = async (req, res) => {
    try {
        const { submissionId } = req.params;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can re-evaluate submissions.' });
        }

        const submissionRef = db.collection('submissions').doc(submissionId);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const submission = submissionDoc.data();
        const attempts = submission.aiAttempts || 0;
        
        // Get exam details for context
        const examDoc = await db.collection('exams').doc(submission.examId).get();
        if (!examDoc.exists) {
            return res.status(404).json({ message: 'Associated exam not found' });
        }
        const exam = examDoc.data();
        const examDetails = `Title: ${exam.title}\nDescription: ${exam.description || ''}\nTotal Marks: ${exam.totalMarks}`;

        // Get Cloudinary publicId from URL if not stored separately
        // Multer-cloudinary typically stores it, but if not we can derive or use a dummy if the service handles it
        // In our case, we used req.file.filename as publicId earlier. 
        // Let's assume we can get it from the URL or if we don't have it, we might need to store it.
        // For now, let's try to pass the URL as publicId or similar if the service can handle it.
        // Actually, aiService.js uses publicId for PDF splitting. 
        // If it's an image, publicId isn't strictly needed if we use the URL.
        
        // Let's improve aiService.js to handle missing publicId for images better, or just store it.
        // Looking at submitAnswerSheet, we did: const publicId = req.file.filename;
        // We should have stored it! Let's check if it's in the DB.
        // It's not in the newSubmission object in submitAnswerSheet!
        
        const initialStatus = exam.questionPaperText ? 'ai_extracting_text' : 'ai_transcribing_paper';
        await submissionRef.update({ 
            status: initialStatus,
            aiAttempts: attempts + 1
        });

        res.json({ message: 'Re-evaluation started', status: initialStatus });

        // Fire off AI Evaluation asynchronously
        try {
            let questionPaperText = exam.questionPaperText;
            
            // Pass existing data for OCR caching and scoring consistency
            const result = await aiService.evaluateSubmission(
                submission.answerSheetUrl, 
                submission.publicId || submission.answerSheetUrl, 
                examDetails,
                exam.questionPaperUrl,
                exam.questionPaperText,
                exam.totalMarks || 100,
                (status) => submissionRef.update({ status }),
                submission.extractedText, // Pass cached OCR text
                { aiScore: submission.aiScore, detailedReasoning: submission.detailedReasoning } // Pass previous result for anchoring
            );

            // Self-Healing: If AI extracted the Question Paper text, save it to the exam for future submissions
            if (result.questionPaperText && !exam.questionPaperText) {
                console.log(`Self-Healing: Saving transcribed Question Paper text to exam ${submission.examId}`);
                await db.collection('exams').doc(submission.examId).update({ questionPaperText: result.questionPaperText });
            }

            await submissionRef.update({
                extractedText: result.extractedText || "No text could be recognized in the document.",
                detailedReasoning: result.detailedReasoning,
                aiScore: result.aiScore,
                aiConfidence: result.aiConfidence || 100,
                aiFeedback: result.aiFeedback,
                mlFeatures: result.mlFeatures || null,
                status: 'evaluated',
                aiError: null
            });
        } catch (err) {
            console.error(`Error re-evaluating submission ${submissionId}:`, err);
            await submissionRef.update({ 
                status: 'submitted',
                aiError: err.message || "Re-evaluation failed."
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// @desc    Scan a submission for text ONLY (OCR)
// @access  Private (Teacher only)
exports.scanSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can scan submissions.' });
        }

        const submissionRef = db.collection('submissions').doc(submissionId);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const submission = submissionDoc.data();
        const attempts = submission.aiAttempts || 0;

        await submissionRef.update({ 
            status: 'ai_scanning',
            aiAttempts: attempts + 1,
            aiError: null 
        });

        res.json({ message: 'Scanning started', status: 'ai_scanning' });

        // Run OCR in background
        try {
            const text = await aiService.extractText(submission.answerSheetUrl, submission.publicId || submission.answerSheetUrl);
            await submissionRef.update({
                extractedText: text || "No text could be recognized in the document.",
                status: 'scanned',
                aiError: null
            });
        } catch(err) {
            console.error(`Error scanning submission ${submissionId}:`, err);
            await submissionRef.update({ 
                status: 'submitted',
                aiError: err.message || "Failed to extract text."
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Grade a submission based on extracted text
// @access  Private (Teacher only)
exports.gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can grade submissions.' });
        }

        const submissionRef = db.collection('submissions').doc(submissionId);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const submission = submissionDoc.data();
        const attempts = submission.aiAttempts || 0;
        
        if (!submission.extractedText) {
            return res.status(400).json({ message: 'Please scan the document first to extract text.' });
        }

        const examDoc = await db.collection('exams').doc(submission.examId).get();
        const exam = examDoc.data();
        const examDetails = `Title: ${exam.title}\nDescription: ${exam.description || ''}\nTotal Marks: ${exam.totalMarks}`;

        await submissionRef.update({ 
            status: 'ai_evaluating',
            aiAttempts: attempts + 1
        });

        res.json({ message: 'Evaluation started', status: 'ai_evaluating' });

        // Run Evaluation in background
        try {
            let questionPaperText = exam.questionPaperText;
            if (!questionPaperText && exam.questionPaperUrl) {
                console.log(`Self-Healing: Extracting Question Paper text for exam ${submission.examId}...`);
                questionPaperText = await aiService.transcribeQuestionPaper(exam.questionPaperUrl, exam.questionPaperUrl);
                await db.collection('exams').doc(submission.examId).update({ questionPaperText });
            }

            const result = await aiService.evaluateText(
                submission.extractedText, 
                examDetails, 
                questionPaperText,
                exam.totalMarks || 100
            );
            await submissionRef.update({
                detailedReasoning: result.detailedReasoning,
                aiScore: result.aiScore,
                aiConfidence: result.aiConfidence || 100,
                aiFeedback: result.aiFeedback,
                status: 'evaluated',
                aiError: null
            });
        } catch (err) {
            console.error(`Error grading submission ${submissionId}:`, err);
            await submissionRef.update({ 
                status: 'scanned',
                aiError: err.message || "Failed to grade submission."
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get singular submission by ID
// @access  Private
exports.getSubmissionById = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submissionDoc = await db.collection('submissions').doc(submissionId).get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const subData = submissionDoc.data();

        // Check ownership/access
        if (req.user.role === 'student' && subData.studentId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Populate student info
        let student = { identifier: subData.studentId, name: 'Unknown' };
        try {
            const studentDoc = await db.collection('users').doc(subData.studentId).get();
            if (studentDoc.exists) {
                const studentData = studentDoc.data();
                student = { identifier: studentData.identifier, name: studentData.name || 'Unknown' };
            }
        } catch (err) {
            console.error("Error fetching student details", err);
        }

        // Populate exam info
        let examTitle = "Unknown Exam";
        let totalMarks = 25;
        try {
            const examDoc = await db.collection('exams').doc(subData.examId).get();
            if (examDoc.exists) {
                const eData = examDoc.data();
                examTitle = eData.title;
                totalMarks = eData.totalMarks || 25;
            }
        } catch (err) {
            console.error("Error fetching exam details", err);
        }

        res.json({
            ...subData,
            studentId: student,
            examTitle,
            totalMarks
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
