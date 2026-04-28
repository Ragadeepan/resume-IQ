import axios from "axios";
import { env } from "../config/env.js";

const GEMINI_ENDPOINTS = [
  {
    model: "gemini-pro",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
  },
  {
    model: "gemini-2.0-flash",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  },
  {
    model: "gemini-2.5-flash",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
  }
];

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const disabledModels = new Set();

const actionVerbMap = {
  worked: "Delivered",
  help: "Supported",
  helped: "Supported",
  made: "Built",
  created: "Designed",
  responsible: "Owned",
  did: "Executed"
};

const defaultAnalysisFallback = {
  strengths: ["Resume structure is parseable and ready for further optimization."],
  weaknesses: ["The resume is solid overall, but stronger tailoring could improve conversion."],
  suggestions: ["Tailor the summary and top bullet points to the role you are targeting."]
};

const safeJsonParse = (text) => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch (nestedError) {
      return null;
    }
  }
};

const cleanStringArray = (value, fallback = []) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 6)
    : fallback;

const extractTextFromGeminiResponse = (responseData) =>
  responseData?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim() || "";

const normalizeAnalysis = (value, fallback = defaultAnalysisFallback) => ({
  strengths: cleanStringArray(value?.strengths, fallback.strengths),
  weaknesses: cleanStringArray(value?.weaknesses, fallback.weaknesses),
  suggestions: cleanStringArray(value?.suggestions, fallback.suggestions)
});

const buildGeminiPrompt = (resumeText) => `
You are ResumeIQ, an expert resume analyst and ATS reviewer.

Analyze the resume/context below and return valid JSON only.

Return JSON with:
{
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:
- Keep each point concise, professional, and actionable.
- Do not use markdown fences.
- Do not invent facts that are not present in the provided resume/context.
- Focus on resume quality, clarity, ATS fit, and recruiter readability.

Resume/context:
${resumeText.slice(0, 14000)}
`.trim();

const wait = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

const postToGemini = async (endpoint, prompt) =>
  axios.post(
    endpoint.url,
    {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      timeout: 20000
    }
  );

const requestGeminiAnalysis = async (endpoint, prompt) => {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await postToGemini(endpoint, prompt);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const shouldRetry = RETRYABLE_STATUSES.has(status);

      if (!shouldRetry || attempt === 2) {
        throw error;
      }

      await wait(800 * (attempt + 1));
    }
  }

  throw lastError;
};

const logGeminiFailure = (endpoint, error) => {
  if (env.NODE_ENV === "production") {
    return;
  }

  const status = error?.response?.status || "n/a";
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Unknown error";

  console.warn(`Gemini endpoint attempt failed for ${endpoint.model}: ${status} ${message}`);
};

const shouldDisableEndpoint = (error) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      ""
  ).toLowerCase();

  if (status === 404) {
    return true;
  }

  if (status === 429 && (message.includes("limit: 0") || message.includes("quota exceeded"))) {
    return true;
  }

  return false;
};

const improveBulletFallback = (bullet) => {
  const trimmed = bullet.replace(/^[-*]\s*/, "").trim();

  if (!trimmed) {
    return "";
  }

  const lower = trimmed.toLowerCase();
  const [leadingWord] = lower.split(" ");
  const strongerVerb = actionVerbMap[leadingWord];

  if (strongerVerb) {
    return `${strongerVerb}${trimmed.slice(leadingWord.length)}`;
  }

  if (/^(built|designed|led|launched|optimized|improved|implemented)\b/i.test(trimmed)) {
    return trimmed;
  }

  return `Delivered ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
};

export const buildImprovedBullets = (parsedResume = {}) =>
  (parsedResume.bulletPoints || []).slice(0, 5).map((bullet) => ({
    original: bullet,
    improved: improveBulletFallback(bullet)
  }));

export const buildFallbackInsights = ({
  parsedResume = {},
  scoreBreakdown = {},
  keywordReport = {}
} = {}) => {
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if ((parsedResume.skills || []).length >= 8) {
    strengths.push("Strong skill coverage across multiple technical areas.");
  }
  if ((parsedResume.experience || []).length >= 2) {
    strengths.push("Experience section shows enough role depth for recruiter scanning.");
  }
  if ((parsedResume.projects || []).length >= 2) {
    strengths.push("Project work adds proof of execution beyond listed skills.");
  }

  if (!parsedResume.metricsCount) {
    weaknesses.push("Bullets rarely quantify impact with numbers, percentages, or scale.");
    suggestions.push("Add measurable results to at least three bullets to improve credibility.");
  }
  if ((scoreBreakdown.education || 0) < 10) {
    weaknesses.push("Education details are thin or not clearly labeled.");
    suggestions.push("Make the education section easier to scan with degree, institution, and graduation date.");
  }
  if ((scoreBreakdown.skills || 0) < 18) {
    weaknesses.push("Skill coverage looks narrow for a competitive technical role.");
    suggestions.push("Add missing tools, frameworks, and platforms that match your target role.");
  }
  if (keywordReport.provided && (keywordReport.missingKeywords || []).length) {
    suggestions.push(
      `Mirror job-description language for missing keywords such as ${keywordReport.missingKeywords
        .slice(0, 5)
        .join(", ")}.`
    );
  }

  if (!strengths.length) {
    strengths.push(defaultAnalysisFallback.strengths[0]);
  }
  if (!weaknesses.length) {
    weaknesses.push(defaultAnalysisFallback.weaknesses[0]);
  }
  if (!suggestions.length) {
    suggestions.push(defaultAnalysisFallback.suggestions[0]);
  }

  return {
    strengths,
    weaknesses,
    suggestions,
    improvedBullets: buildImprovedBullets(parsedResume)
  };
};

export const analyzeResume = async (resumeText) => {
  if (!env.GEMINI_API_KEY || !resumeText?.trim()) {
    return defaultAnalysisFallback;
  }

  const prompt = buildGeminiPrompt(resumeText);

  for (const endpoint of GEMINI_ENDPOINTS) {
    if (disabledModels.has(endpoint.model)) {
      continue;
    }

    try {
      // Try the requested Gemini REST endpoint first, then a current Google model as a safety net.
      const response = await requestGeminiAnalysis(endpoint, prompt);
      const responseText = extractTextFromGeminiResponse(response.data);
      const parsed = safeJsonParse(responseText);

      if (parsed) {
        return normalizeAnalysis(parsed, defaultAnalysisFallback);
      }
    } catch (error) {
      if (shouldDisableEndpoint(error)) {
        disabledModels.add(endpoint.model);
      }
      logGeminiFailure(endpoint, error);
    }
  }

  return defaultAnalysisFallback;
};
