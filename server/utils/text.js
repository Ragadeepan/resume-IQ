import { SKILL_ALIASES, SKILL_TAXONOMY } from "../models/skillTaxonomy.js";

const STOP_WORDS = new Set([
  "and",
  "with",
  "for",
  "the",
  "that",
  "from",
  "into",
  "through",
  "while",
  "using",
  "used",
  "build",
  "built",
  "work",
  "worked",
  "experience",
  "project",
  "projects",
  "resume",
  "role",
  "team",
  "lead",
  "managed"
]);

export const normalizeWhitespace = (value = "") =>
  value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeSkill = (skill = "") => {
  const cleaned = skill.toLowerCase().trim();
  return SKILL_ALIASES[cleaned] || cleaned;
};

export const extractSkillsFromText = (text = "") => {
  const lowerText = text.toLowerCase();
  const matchedSkills = SKILL_TAXONOMY.filter((skill) => lowerText.includes(skill));

  const tokenizedSkills = lowerText
    .split(/[\n,|/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeSkill)
    .filter((item) => SKILL_TAXONOMY.includes(item));

  return Array.from(new Set([...matchedSkills, ...tokenizedSkills])).sort();
};

export const extractKeywordsFromDescription = (text = "") => {
  const normalized = text.toLowerCase();
  const hardSkills = extractSkillsFromText(normalized);

  const softKeywords = normalized
    .split(/[^a-z0-9+.#/-]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  return Array.from(new Set([...hardSkills, ...softKeywords])).slice(0, 30);
};

export const titleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

