import { aiModel, firebaseConfig } from './firebase';

const isDev = import.meta.env.DEV;

/**
 * Gemini AI Service Layer — Powered by Firebase AI / Google Gen AI.
 * Uses Firebase Configured SDK and API key for AI hints, explanations, and remediation.
 */
export class GeminiService {
  public async generateHint(prompt: string, starterCode: string): Promise<string> {
    const hintPrompt = `You are an expert SQL tutor for SkillPilot. Respond in a witty, sarcastic, and playful tone (light taunts are OK) while remaining helpful and respectful — no profanity, no personal attacks, and avoid toxic language. Provide a concise (1-2 sentence) hint that nudges the learner without revealing the full solution. Include the essential technical cue(s) the student needs to make progress.\n\nProblem: ${prompt}\nStarter Code: ${starterCode}`;

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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: hintPrompt }]
            }
          ]
        })
      });

      if (!response.ok) {
        let bodyText = '';
        try {
          bodyText = JSON.stringify(await response.json());
        } catch (err) {
          bodyText = await response.text().catch(() => '<unreadable body>');
        }
        if (isDev) console.error('Generative API request failed for hint', { url, status: response.status, statusText: response.statusText, body: bodyText });
        throw new Error(`Generative API error ${response.status}`);
      }

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

    // Update: make explanations witty and slightly sarcastic while keeping them instructive and respectful.
    // Ask for short, actionable remediation steps, and optionally a one-line playful taunt.
    const wittyExplanationPrompt = `You are a witty, sarcastic, and playful SQL tutor for SkillPilot — keep it fun but always respectful (no profanity or personal attacks). Briefly explain why the user's attempt failed and present the correct concept in 2-3 clear sentences. Then give 2 short, actionable steps the learner can take to fix their query and one concise example if helpful. You may include a light, good-natured taunt (one sentence) at the end to keep tone playful.\n\nProblem Prompt: ${prompt}\nUser Submission: ${userAnswer}\nEvaluation Feedback: ${evalFeedback}\nDetected Misconceptions: ${errorPatterns.join(', ')}`;

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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: explanationPrompt }]
            }
          ]
        })
      });

      if (!response.ok) {
        let bodyText = '';
        try {
          bodyText = JSON.stringify(await response.json());
        } catch (err) {
          bodyText = await response.text().catch(() => '<unreadable body>');
        }
        if (isDev) console.error('Generative API request failed for explanation', { url, status: response.status, statusText: response.statusText, body: bodyText });
        throw new Error(`Generative API error ${response.status}`);
      }

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
