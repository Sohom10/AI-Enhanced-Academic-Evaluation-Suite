const axios = require('axios');

/**
 * Traditional ML Feature Extraction
 * Analyzes word count, keyword overlap, and complexity.
 * This model is designed to be fully deterministic and explainable.
 */
function extractFeatures(text, questionPaperText) {
    const clean = (t) => (t || "").toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(w => w.length > 2);
    const words = clean(text);
    const qWords = clean(questionPaperText);
    
    const lexicalDiversity = new Set(words).size / (words.length || 1);
    
    // Fuzzy Match logic: count word as a match if it's very similar to any qWord
    // This handles minor transcription errors from the OCR step.
    const matches = words.filter(word => {
        return qWords.some(qw => {
            if (word === qw) return true;
            if (word.startsWith(qw) || qw.startsWith(word)) return true;
            let common = 0;
            for (let char of word) if (qw.includes(char)) common++;
            return common / qw.length > 0.8;
        });
    }).length;

    const keywordDensity = matches / (qWords.length || 1);
    const lengthScore = Math.min(words.length / 50, 1.0);
    
    // Self-Correction: If text exists but matches are 0, use a baseline of 0.05
    const baseline = text.trim().length > 0 ? 0.05 : 0;

    return {
        wordCount: words.length,
        keywordDensity: Math.max(keywordDensity, baseline),
        lengthScore: Math.max(lengthScore, baseline),
        lexicalDiversity: Math.max(lexicalDiversity, baseline),
        complexity: Math.max(text.length / (words.length || 1), baseline * 10)
    };
}

/**
 * Traditional ML Prediction Logic (Hybrid Mode)
 * Predicts the score using a feature-weighted regressor model.
 */
async function traditionalMLPredict(features, totalMarks) {
    console.log("[Local ML] Calculating grade from features:", JSON.stringify(features));
    
    // STRICTNESS IMPLEMENTATION:
    // 1. Power Curve: Squaring the keyword density makes it much harder to get a 100% score.
    // An answer with 50% density now effectively contributes only ~35% towards the keyword component.
    const strictDensity = Math.pow(features.keywordDensity, 1.25);
    
    // 2. Penalty Factors:
    let penalty = 0;
    let penaltyReason = "";

    // Repetitive or nonsense detection (Lexical Diversity)
    if (features.lexicalDiversity < 0.25 && features.wordCount > 10) {
        penalty += 0.2;
        penaltyReason += "[Low Lexical Diversity: Repetitive/Generic Text] ";
    }

    // Complexity Penalty (Too simple for high marks)
    if (features.complexity < 4 && features.wordCount > 5) {
        penalty += 0.1;
        penaltyReason += "[Low Linguistic Complexity] ";
    }

    // 3. Balanced Weighted scoring (Strict Edition): 
    const basePrediction = (strictDensity * 0.8) + (features.lengthScore * 0.2);
    
    // Apply aggregate penalties
    const finalizedPrediction = Math.max(0, basePrediction - penalty);
    const aiScore = Math.floor(finalizedPrediction * totalMarks);
    
    return {
        aiScore: Math.min(aiScore, totalMarks),
        aiConfidence: Math.round(features.keywordDensity * 100),
        detailedReasoning: `HYBRID ML EVALUATION (STRICT MODE):
        - Algorithm: Non-Linear Heuristic Regressor
        - Strict Density (Adjusted): ${(strictDensity * 100).toFixed(1)}%
        - Structural Depth: ${(features.lengthScore * 100).toFixed(1)}%
        - Lexical Quality: ${(features.lexicalDiversity * 100).toFixed(1)}%
        ${penalty > 0 ? `- PENALTIES APPLIED: ${penaltyReason}` : "- Consistency Check: Passed"}`
    };
}

/**
 * Main Entry Point for evaluateText.
 * This is called by Step 3 of the AI Pipeline.
 */
async function evaluateText(extractedText, examDetails, questionPaperText, totalMarks = 100, onStatus = null) {
    if (onStatus) onStatus('ai_scoring');
    console.log("[Local ML] Starting Step 3/3 (Grading Logic)...");
    
    const features = extractFeatures(extractedText, questionPaperText);
    const prediction = await traditionalMLPredict(features, totalMarks);

    console.log(`[Local ML] DONE. Score: ${prediction.aiScore}/${totalMarks}`);
    return {
        ...prediction,
        mlFeatures: features,
        aiFeedback: "Graded using Local Traditional ML model (Step 3 only)."
    };
}

module.exports = {
    // OCR functions are now stubs because Step 1 & 2 use Gemini in Hybrid Mode
    transcribeQuestionPaper: async () => "", 
    extractText: async () => "",
    evaluateText
};
