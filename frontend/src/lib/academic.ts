/**
 * Academic Evaluation Constants & Shared Utilities
 * Centralized source of truth for status labels, metrics calculation, and grading heuristics.
 */

export const ENGINE_VERSION = "V3.2";
export const SECURITY_STANDARD = "COMPLIANCE ISO:27001";

/**
 * Maps background processing statuses to human-readable labels.
 */
export const getStatusLabel = (status: string | undefined): string => {
    if (!status) return "AWAITING ACTION";
    
    switch (status) {
        case 'ai_scanning': return 'AI Scanning Evidence...';
        case 'ai_transcribing_paper': return 'AI Transcribing Paper...';
        case 'ai_extracting_text': return 'AI Digitizing Answers...';
        case 'ai_scoring': return 'AI Scoring Results...';
        case 'ai_evaluating': return 'AI Evaluating...';
        case 'evaluated': return 'AI Evaluated';
        case 'reviewed': return 'Graded & Reviewed';
        case 'scanned': return 'Awaiting Manual Audit';
        case 'submitted': return 'Analysis Queued';
        default: return status.replace(/_/g, " ").toUpperCase();
    }
};

/**
 * Centralized helper to check if a submission is currently being processed by AI.
 */
export const isProcessing = (status: string | undefined): boolean => {
    if (!status) return false;
    return status.startsWith('ai_');
};

/**
 * Returns a Tailwind color class based on a numerical score 0-100.
 */
export const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-rose-600";
};

/**
 * Local Heuristic Engine:
 * Analyzes string content to extract linguistic metrics when structured AI data is missing.
 */
export const calculateLinguisticMetrics = (text: string, mlFeatures?: any) => {
    const rawText = text || "";
    const words = rawText.trim() ? rawText.trim().split(/\s+/) : [];
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    return {
        wordCount: mlFeatures?.wordCount || words.length,
        keywordDensity: mlFeatures?.keywordDensity || (uniqueWords.size / (words.length || 1)),
        lengthScore: mlFeatures?.lengthScore || (words.length / 500),
        lexicalDiversity: mlFeatures?.lexicalDiversity || (uniqueWords.size / (words.length || 1)),
        complexity: mlFeatures?.complexity || (words.length > 0 ? (rawText.length / words.length) : 0)
    };
};

/**
 * Formats a score/total string.
 */
export const formatScoreDisplay = (score: number | undefined, total: number | string = 25) => {
    if (score === undefined) return "--";
    return `${score} / ${total}`;
};
