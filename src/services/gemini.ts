/**
 * Gemini AI Service Layer — Enhancement layer for hints, query explanations, and remediation.
 * Features graceful offline fallbacks when API key or network connection is unavailable.
 */

export class GeminiService {
  private apiKey: string | null = null;

  constructor() {
    // Read API key from environment variable if available
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  }

  public async generateHint(prompt: string, starterCode: string): Promise<string> {
    if (!this.apiKey) {
      return "AI hint: Pay close attention to table join keys, filter conditions, and syntax clauses.";
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert SQL tutor for SkillPilot. Provide a concise, 1-2 sentence hint for this SQL problem without giving away the complete solution directly:\n\nPrompt: ${prompt}\nStarter Code: ${starterCode}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "AI hint: Ensure your ON and WHERE conditions filter records accurately.";
    } catch (e) {
      console.warn('Gemini API call failed, using deterministic fallback hint:', e);
      return "AI explanations are temporarily unavailable. Check your JOIN predicates and WHERE filters.";
    }
  }

  public async generateExplanation(
    prompt: string,
    userAnswer: string,
    evalFeedback: string,
    errorPatterns: string[]
  ): Promise<string> {
    if (!this.apiKey) {
      return `Deterministic Feedback: ${evalFeedback} Focus on correcting ${errorPatterns.join(', ') || 'syntax and logic'}.`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an encouraging, technical SQL tutor. Explain why the user's attempt had issues and provide a clear 2-sentence explanation of the underlying SQL concept.\n\nProblem Prompt: ${prompt}\nUser Submission: ${userAnswer}\nEvaluation Feedback: ${evalFeedback}\nDetected Misconceptions: ${errorPatterns.join(', ')}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || evalFeedback;
    } catch (e) {
      console.warn('Gemini API call failed, using deterministic fallback explanation:', e);
      return `AI explanations are temporarily unavailable. ${evalFeedback}`;
    }
  }
}

export const geminiService = new GeminiService();
