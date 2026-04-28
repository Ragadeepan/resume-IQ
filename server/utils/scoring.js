import { ATS_WEIGHTS } from "../models/atsWeights.js";
import { extractKeywordsFromDescription, normalizeSkill } from "./text.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const buildKeywordReport = (parsedResume, jobDescription = "") => {
  if (!jobDescription?.trim()) {
    return {
      provided: false,
      matchedKeywords: [],
      missingKeywords: [],
      keywordCoverage: 0
    };
  }

  const desiredKeywords = extractKeywordsFromDescription(jobDescription);
  const resumeSkills = new Set(parsedResume.skills.map(normalizeSkill));
  const lowerResumeText = JSON.stringify(parsedResume).toLowerCase();

  const matchedKeywords = desiredKeywords.filter(
    (keyword) => resumeSkills.has(normalizeSkill(keyword)) || lowerResumeText.includes(keyword)
  );
  const missingKeywords = desiredKeywords.filter((keyword) => !matchedKeywords.includes(keyword));

  return {
    provided: true,
    matchedKeywords,
    missingKeywords,
    keywordCoverage: desiredKeywords.length
      ? Math.round((matchedKeywords.length / desiredKeywords.length) * 100)
      : 0
  };
};

const calculateSkillsScore = (parsedResume, keywordReport) => {
  const skillVolume = clamp(parsedResume.skills.length / 12, 0, 1);
  const keywordCoverage = keywordReport.provided ? keywordReport.keywordCoverage / 100 : skillVolume;
  const blendedScore = keywordReport.provided
    ? keywordCoverage * 0.75 + skillVolume * 0.25
    : skillVolume;

  return Math.round(blendedScore * ATS_WEIGHTS.skills);
};

const calculateExperienceScore = (parsedResume) => {
  const experienceDepth = clamp(parsedResume.experience.length / 4, 0, 1);
  const chronologySignal = clamp(parsedResume.dateMentions / 3, 0, 1);
  const quantifiedImpact = clamp(parsedResume.metricsCount / 4, 0, 1);

  return Math.round(
    (experienceDepth * 0.5 + chronologySignal * 0.2 + quantifiedImpact * 0.3) *
      ATS_WEIGHTS.experience
  );
};

const calculateProjectsScore = (parsedResume) => {
  const projectDepth = clamp(parsedResume.projects.length / 3, 0, 1);
  const bulletStrength = clamp(parsedResume.bulletPoints.length / 6, 0, 1);
  const projectImpact = clamp(parsedResume.metricsCount / 3, 0, 1);

  return Math.round(
    (projectDepth * 0.55 + bulletStrength * 0.25 + projectImpact * 0.2) * ATS_WEIGHTS.projects
  );
};

const calculateEducationScore = (parsedResume) => {
  const base = parsedResume.hasEducation ? 0.75 : parsedResume.education.length ? 0.45 : 0;
  const credentialsBonus = clamp(parsedResume.certifications.length / 2, 0, 0.25);

  return Math.round((base + credentialsBonus) * ATS_WEIGHTS.education);
};

export const calculateATSScore = (parsedResume, keywordReport) => {
  const breakdown = {
    skills: calculateSkillsScore(parsedResume, keywordReport),
    experience: calculateExperienceScore(parsedResume),
    projects: calculateProjectsScore(parsedResume),
    education: calculateEducationScore(parsedResume)
  };

  return {
    score: Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    breakdown
  };
};
