import { aiModel, firebaseConfig } from './firebase';

/**
 * Gemini AI Service Layer — Powered by Firebase AI / Google Gen AI.
 * Uses Firebase Configured SDK and API key for AI hints, explanations, and remediation.
 */
export class GeminiService {
  public async generateHint(prompt: string, starterCode: string): Promise<string> {
    const hintPrompt = `You are an expert SQL tutor for SkillPilot. Provide a concise, 1-2 sentence hint for this SQL problem without giving away the complete solution directly:\n\nPrompt: ${prompt}\nStarter Code: ${starterCode}`;

    // 1. Try Firebase AI SDK
    if (aiModel) {
      try {
        const result = await aiModel.generateContent(hintPrompt);
        const text = result.response.text();
        if (text) return text.trim();
      } catch (err) {
        console.warn('Firebase AI SDK request failed, trying Direct API fallback:', err);
      }
    }

    // 2. Direct REST API request using Firebase Config API Key
    try {
      const apiKey = firebaseConfig.apiKey;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: hintPrompt }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : "AI hint: Pay close attention to table join keys, filter conditions, and syntax clauses.";
    } catch (e) {
      console.warn('Firebase AI API request failed, using fallback hint:', e);
      return "AI hint: Check your JOIN predicates and WHERE filters to ensure matching keys.";
    }
  }

  public async generateExplanation(
    prompt: string,
    userAnswer: string,
    evalFeedback: string,
    errorPatterns: string[]
  ): Promise<string> {
    const explanationPrompt = `You are an encouraging, technical SQL tutor for SkillPilot. Explain why the user's attempt had issues and provide a clear 2-sentence explanation of the underlying SQL concept.\n\nProblem Prompt: ${prompt}\nUser Submission: ${userAnswer}\nEvaluation Feedback: ${evalFeedback}\nDetected Misconceptions: ${errorPatterns.join(', ')}`;

    // 1. Try Firebase AI SDK
    if (aiModel) {
      try {
        const result = await aiModel.generateContent(explanationPrompt);
        const text = result.response.text();
        if (text) return text.trim();
      } catch (err) {
        console.warn('Firebase AI SDK request failed, trying Direct API fallback:', err);
      }
    }

    // 2. Direct REST API request using Firebase Config API Key
    try {
      const apiKey = firebaseConfig.apiKey;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: explanationPrompt }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : evalFeedback;
    } catch (e) {
      console.warn('Firebase AI API request failed, using deterministic feedback:', e);
      return `AI explanations are temporarily unavailable. ${evalFeedback}`;
    }
  }
}

export const geminiService = new GeminiService();
