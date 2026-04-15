const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const https = require('https');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Standardize on the requested model ID (Gemini 3.1 Flash Lite)
const MODEL_ID = "gemini-3.1-flash-lite-preview";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const customProvider = require('./customModelProvider');

const PROVIDER = process.env.AI_PROVIDER || 'gemini';

function getProvider() {
    return { transcribeQuestionPaper, extractText, evaluateText };
}

function getGradingProvider() {
    if (PROVIDER === 'custom') return customProvider;
    return { evaluateText };
}

// Safety settings - Relaxed for OCR accuracy (student work)
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const GRADING_RUBRIC = `
1. Accuracy & Correctness (50%): Does the student demonstrate a solid understanding of the core concepts?
2. Logical Reasoning (30%): Is the step-by-step thinking sound, even if the final result is slightly off? Give partial credit for effort.
3. Clarity & Presentation (20%): Is the answer expressed clearly and well-structured?
`;

/**
 * Helper to buffer image from URL for Gemini.
 */
async function fetchImageBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error(`Failed to fetch image from ${url}:`, error.message);
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

/**
 * Helper to clean JSON string from Gemini markdown response.
 */
function cleanJson(text) {
    if (!text) return "";
    let cleaned = text.trim();
    cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
        cleaned = cleaned.substring(start, end + 1);
    }
    return cleaned;
}

/**
 * Robustly parses JSON with sanitization.
 */
function safeJsonParse(text) {
    const cleaned = cleanJson(text);
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        try {
            const sanitized = cleaned
                .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "")
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r");
            return JSON.parse(sanitized);
        } catch (e2) {
            console.error("Critical JSON Parsing Error. Raw Content:", text);
            throw new Error(`AI response format error. Please try again.`);
        }
    }
}

/**
 * Helper to extract publicId from Cloudinary URL.
 */
function extractPublicId(urlOrId) {
    if (!urlOrId || !urlOrId.includes("http")) return urlOrId;
    try {
        const parts = urlOrId.split('/upload/');
        if (parts.length < 2) return urlOrId;
        const afterUpload = parts[1];
        const subParts = afterUpload.split('/');
        if (subParts[0].startsWith('v') && subParts.length > 1) {
            subParts.shift();
        }
        const pathWithExt = subParts.join('/');
        const lastDotIndex = pathWithExt.lastIndexOf('.');
        return lastDotIndex !== -1 ? pathWithExt.substring(0, lastDotIndex) : pathWithExt;
    } catch (e) {
        return urlOrId;
    }
}

/**
 * exponential backoff retry for Quota protection.
 */
async function withRetry(fn, retries = 3, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const status = error.status || error.statusCode || (error.response ? error.response.status : null);
            const message = error.message || "";
            const isRateLimit = status === 429 || message.includes('429') || message.includes('QUOTA_EXCEEDED');
            
            if (isRateLimit && i < retries - 1) {
                console.warn(`Gemini 429 hit. Waiting ${delay/1000}s... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 1.5; 
                continue;
            }
            if (isRateLimit && i === retries - 1) {
                throw new Error("Gemini API Quota Exceeded. Please wait 1 minute before trying again.");
            }
            throw error;
        }
    }
}

/**
 * Transcribes the official Question Paper.
 */
async function transcribeQuestionPaper(fileUrl, publicIdInput) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) {
        return "MOCK QUESTION PAPER [TRANSCRIPTION]";
    }

    return await withRetry(async () => {
        const publicId = extractPublicId(publicIdInput);
        const prompt = `Transcribe this EXAM QUESTION PAPER exactly as written. Transcribe EVERY question and capturing marks. Respond ONLY with text.`;

        const model = genAI.getGenerativeModel({ model: MODEL_ID, safetySettings });
        let parts = [{ text: prompt }];
        
        if (fileUrl.toLowerCase().endsWith('.pdf')) {
            const details = await cloudinary.api.resource(publicId, { pages: true });
            const totalPages = Math.min(details.pages || 1, 5);
            const pagePromises = Array.from({ length: totalPages }, (_, i) => {
                const pageUrl = cloudinary.url(publicId, { page: i + 1, format: 'jpg', secure: true });
                return fetchImageBuffer(pageUrl);
            });
            const pageBuffers = await Promise.all(pagePromises);
            pageBuffers.forEach((buffer, index) => {
                parts.push({ text: `--- Page ${index + 1} ---` });
                parts.push({ inlineData: { data: buffer.toString("base64"), mimeType: "image/jpeg" } });
            });
        } else {
            const imgBuffer = await fetchImageBuffer(fileUrl.replace("http://", "https://"));
            parts.push({ inlineData: { data: imgBuffer.toString("base64"), mimeType: "image/jpeg" } });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        return response.text().trim() || "No text recognized.";
    });
}

/**
 * Extracts raw text from student handwriting.
 */
async function extractText(fileUrl, publicIdInput) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) {
        return "MOCK AI TRANSCRIPTION";
    }

    return await withRetry(async () => {
        const publicId = extractPublicId(publicIdInput);
        const prompt = `Transcribe the English text from this student submission word for word. Respond only with text.`;

        const model = genAI.getGenerativeModel({ model: MODEL_ID, safetySettings });
        let parts = [{ text: prompt }];
        
        if (fileUrl.toLowerCase().endsWith('.pdf')) {
            const details = await cloudinary.api.resource(publicId, { pages: true });
            const totalPages = Math.min(details.pages || 1, 10);
            const pagePromises = Array.from({ length: totalPages }, (_, i) => {
                const pageUrl = cloudinary.url(publicId, { page: i + 1, format: 'jpg', secure: true });
                return fetchImageBuffer(pageUrl);
            });
            const pageBuffers = await Promise.all(pagePromises);
            pageBuffers.forEach((buffer, index) => {
                parts.push({ text: `--- Page ${index + 1} ---` });
                parts.push({ inlineData: { data: buffer.toString("base64"), mimeType: "image/jpeg" } });
            });
        } else {
            const imgBuffer = await fetchImageBuffer(fileUrl.replace("http://", "https://"));
            parts.push({ inlineData: { data: imgBuffer.toString("base64"), mimeType: "image/jpeg" } });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        return response.text().trim() || "No text recognized.";
    });
}

/**
 * Evaluates student text (No external tools).
 * Includes Consistency Anchoring to prevent score drift during re-evaluations.
 */
async function evaluateText(extractedText, examDetails, questionPaperText, totalMarks = 100, previousResult = null) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) {
        return { detailedReasoning: "Mock reasoning.", aiScore: Math.floor(Math.random() * totalMarks), aiConfidence: 80, aiFeedback: "Good." };
    }

    const prompt = `
      Act as an exceptionally strict human examiner and predictive scoring model. 
      Your task is to predict a RIGOROUS and ACCURATE score for the student's submission.
      Do NOT reward "fluff" or generic sentences. Reward ONLY specific keywords, technical accuracy, and depth of reasoning.
      
      EXAM CONTEXT: ${examDetails}
      QUESTION PAPER: ${questionPaperText || "N/A"}
      STUDENT SUBMISSION (OCR EXTRACTED): ${extractedText}
 
      SCORING RUBRIC:
      ${GRADING_RUBRIC}
 
      STRICTNESS INSTRUCTIONS:
      - If the answer is vague, deduct 30% of that question's marks.
      - If technical terms from the question paper are missing, deduct marks aggressively.
      - A score of ${totalMarks} requires flawless, expert-level academic performance.
      
      SUMMATION CHECK: Perform a question-by-question evaluation. SUM THEM UP. If the sum is 21.5, the score is 21. Do NOT round up to 22. 
 
      Respond STRICTLY in JSON:
      {
        "detailedReasoning": "Provide a thorough breakdown. ${previousResult ? 'Compare your logic with the previous evaluation provided. If you are changing the score, explain EXACTLY why.' : ''}",
        "aiScore": <number_between_0_and_${totalMarks}>,
        "aiConfidence": <accuracy_percentage_0_to_100>,
        "aiFeedback": "Summarize strengths and missing points."
      }

      ${previousResult ? `
      CONSISTENCY ANCHOR:
      This submission was previously evaluated.
      Previous Score: ${previousResult.aiScore}
      Previous Reasoning: ${previousResult.detailedReasoning}
      
      STABILITY RULE: Only deviate from the previous score if you find a clear error in logic or a missed technical keyword. If the previous evaluation was fair, maintain consistency by outputting the same score.
      ` : ''}
    `;

    return await withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: MODEL_ID, safetySettings });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0, responseMimeType: "application/json" }
        });
        const response = await result.response;
        return safeJsonParse(response.text());
    });
}

/**
 * Combined pipeline.
 * Supports OCR Caching and Consistency Anchoring for high-speed, stable re-evaluations.
 */
async function evaluateSubmission(fileUrl, publicIdInput, examDetails, questionPaperUrl, existingQuestionPaperText, totalMarks = 100, onUpdate = null, existingExtractedText = null, previousResult = null) {
    try {
        let questionPaperText = existingQuestionPaperText;
        if (!questionPaperText && questionPaperUrl) {
            console.log("[AI Pipeline] Transcribing Question Paper (One-time cache step)...");
            if (onUpdate) onUpdate({ status: 'ai_transcribing_paper' });
            questionPaperText = await transcribeQuestionPaper(questionPaperUrl, questionPaperUrl);
            if (onUpdate && questionPaperText) onUpdate({ questionPaperText }); // Checkpoint QP transcription
        }

        // SPEED OPTIMIZATION: Skip OCR if text was already extracted previously
        let text = existingExtractedText;
        if (!text) {
            if (onUpdate) onUpdate({ status: 'ai_extracting_text' });
            text = await extractText(fileUrl, publicIdInput);
            // CHECKPOINT: Save extracted text immediately so user can see it
            if (onUpdate) onUpdate({ extractedText: text, status: 'ai_scoring' });
        } else {
            console.log("[AI Pipeline] Skipping OCR - Using cached extractedText for speed.");
            if (onUpdate) onUpdate({ status: 'ai_scoring' });
        }
        
        // Finalize Grading with previous result for consistency
        const details = await evaluateText(text, examDetails, questionPaperText, totalMarks, previousResult);
        
        // Extract Local ML Features (Always run locally as they are fast)
        const customProvider = require('./customModelProvider');
        const mlFeatures = customProvider.extractFeatures ? customProvider.extractFeatures(text, questionPaperText) : null;
        
        const finalResult = { extractedText: text, mlFeatures, ...details, status: 'evaluated' };
        if (onUpdate) onUpdate(finalResult);

        return finalResult;
    } catch (e) {
        console.error("Hybrid Pipeline failed:", e);
        throw e;
    }
}

module.exports = { 
    transcribeQuestionPaper: (f, p) => getProvider().transcribeQuestionPaper(f, p),
    extractText: (f, p) => getProvider().extractText(f, p),
    evaluateText: (t, e, q, m) => getProvider().evaluateText(t, e, q, m),
    evaluateSubmission 
};
