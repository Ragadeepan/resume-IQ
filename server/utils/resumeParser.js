import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { extractSkillsFromText, normalizeWhitespace } from "./text.js";
import { HttpError } from "./httpError.js";

const SECTION_LABELS = {
  summary: ["summary", "profile", "professional summary", "about"],
  skills: ["skills", "technical skills", "core skills", "competencies", "tech stack"],
  experience: ["experience", "work experience", "professional experience", "employment", "career history"],
  projects: ["projects", "selected projects", "personal projects", "notable projects"],
  education: ["education", "academic background", "qualifications"],
  certifications: ["certifications", "licenses", "awards"]
};

const ROLE_HINTS = [
  "software engineer",
  "full stack developer",
  "frontend developer",
  "back end developer",
  "backend developer",
  "web developer",
  "data analyst",
  "data scientist",
  "product manager",
  "ui ux designer",
  "devops engineer"
];

const degreePattern =
  /\b(bachelor|master|b\.tech|m\.tech|bsc|msc|mba|phd|associate|diploma|computer science|engineering)\b/i;

const monthPattern =
  /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/i;

const cleanLine = (line) =>
  line
    .replace(/[\u2022\u25CF\u25AA]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const normalizeHeading = (line) =>
  line
    .toLowerCase()
    .replace(/[:|-]+$/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSectionKey = (line) => {
  const normalized = normalizeHeading(line);

  return (
    Object.entries(SECTION_LABELS).find(([, labels]) =>
      labels.some((label) => normalized === label || normalized.startsWith(`${label} `))
    )?.[0] || null
  );
};

const extractSectionContent = (line) => {
  const parts = line.split(":");

  if (parts.length <= 1) {
    return "";
  }

  return parts.slice(1).join(":").trim();
};

const collectBullets = (lines = []) =>
  lines
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length >= 18)
    .slice(0, 8);

const deriveRoleHint = (rawText, skills) => {
  const headerChunk = rawText
    .split("\n")
    .slice(0, 12)
    .join(" ")
    .toLowerCase();

  const detectedRole = ROLE_HINTS.find((role) => headerChunk.includes(role));
  if (detectedRole) {
    return detectedRole;
  }

  if (skills.includes("react") && skills.includes("node.js")) {
    return "full stack developer";
  }

  if (skills.includes("react") || skills.includes("next.js")) {
    return "frontend developer";
  }

  if (skills.includes("node.js") || skills.includes("express")) {
    return "backend developer";
  }

  if (skills.includes("machine learning") || skills.includes("data analysis")) {
    return "data analyst";
  }

  return "software engineer";
};

const buildSectionMap = (rawText) => {
  const lines = rawText
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  const sections = {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: []
  };

  let currentSection = "summary";

  for (const line of lines) {
    const nextSection = getSectionKey(line);

    if (nextSection) {
      currentSection = nextSection;
      const inlineContent = extractSectionContent(line);
      if (inlineContent) {
        sections[currentSection].push(inlineContent);
      }
      continue;
    }

    sections[currentSection].push(line);
  }

  return sections;
};

const splitSectionEntries = (lines = []) =>
  lines
    .join("\n")
    .split(/\n(?=[A-Z][A-Za-z0-9/&(),.\s-]{5,}$)/)
    .flatMap((entry) => entry.split(/\n{2,}/))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 10)
    .slice(0, 10);

export const extractResumeText = async (file) => {
  if (file.mimetype === "application/pdf") {
    const result = await pdfParse(file.buffer);
    return normalizeWhitespace(result.text);
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeWhitespace(result.value);
  }

  throw new HttpError(400, "Unsupported file type");
};

export const parseResumeText = (rawText) => {
  const normalizedText = normalizeWhitespace(rawText);

  if (!normalizedText || normalizedText.length < 40) {
    throw new HttpError(
      422,
      "Resume text extraction returned too little content. Please upload a clearer file."
    );
  }

  const sections = buildSectionMap(normalizedText);
  const skills = Array.from(
    new Set([
      ...extractSkillsFromText(sections.skills.join("\n")),
      ...extractSkillsFromText(normalizedText)
    ])
  );

  const experienceEntries = splitSectionEntries(sections.experience);
  const projectEntries = splitSectionEntries(sections.projects);
  const educationEntries = splitSectionEntries(sections.education);
  const bulletPoints = collectBullets([...sections.experience, ...sections.projects]);
  const metricsCount = bulletPoints.filter((bullet) => /\d|%|\$/.test(bullet)).length;
  const dateMentions = experienceEntries.filter(
    (entry) => monthPattern.test(entry) || /\b(20\d{2}|19\d{2})\b/.test(entry)
  ).length;
  const hasEducation = educationEntries.some((entry) => degreePattern.test(entry));

  return {
    skills,
    education: educationEntries,
    experience: experienceEntries,
    projects: projectEntries,
    certifications: splitSectionEntries(sections.certifications),
    bulletPoints,
    summary: sections.summary.slice(0, 4).join(" "),
    roleHint: deriveRoleHint(normalizedText, skills),
    metricsCount,
    dateMentions,
    hasEducation
  };
};

