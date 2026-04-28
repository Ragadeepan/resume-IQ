import axios from "axios";
import { env } from "../config/env.js";
import { extractSkillsFromText, normalizeSkill, titleCase } from "./text.js";

const DEVELOPMENT_COMPANIES = [
  "Northstar Labs",
  "AstraWorks",
  "BrightLayer",
  "SignalForge",
  "OrbitIQ",
  "Cinder Systems"
];

const buildQuerySkills = (skills = []) =>
  skills
    .filter(Boolean)
    .slice(0, 3)
    .map((skill) => titleCase(skill));

export const buildJobSearchQuery = (parsedResume) => {
  const querySkills = buildQuerySkills(parsedResume.skills);
  const role = titleCase(parsedResume.roleHint || "Software Engineer");

  return `${[...querySkills, role, "jobs"].filter(Boolean).join(" ")}`.trim();
};

const buildDevelopmentJobs = (query, parsedResume) => {
  const skills = parsedResume.skills.slice(0, 6);
  const roleLabel = titleCase(parsedResume.roleHint || "Software Engineer");
  const applyBaseUrl = "https://www.linkedin.com/jobs/search/";

  return DEVELOPMENT_COMPANIES.slice(0, 5).map((company, index) => ({
    job_title: `${roleLabel}${index % 2 === 0 ? "" : " II"}`,
    employer_name: company,
    job_city: index % 2 === 0 ? "Bengaluru" : "Remote",
    job_state: index % 2 === 0 ? "Karnataka" : null,
    job_country: "India",
    job_apply_link: `${applyBaseUrl}?keywords=${encodeURIComponent(query)}&company=${encodeURIComponent(
      company
    )}`,
    job_employment_type: index % 3 === 0 ? "FULLTIME" : "CONTRACTOR",
    job_publisher: "ResumeIQ Development Fallback",
    job_posted_at_datetime_utc: new Date(Date.now() - index * 86400000).toISOString(),
    job_description: `Build and ship products as a ${roleLabel}. Strong experience with ${skills
      .slice(0, 4)
      .join(", ")} is preferred. Collaborate with product, design, and platform teams to deliver measurable outcomes.`,
    job_highlights: {
      Qualifications: skills.slice(0, 4),
      Responsibilities: [
        `Lead delivery for ${roleLabel.toLowerCase()} features`,
        "Improve performance, reliability, and developer workflows",
        "Translate product goals into measurable technical execution"
      ]
    }
  }));
};

export const searchJobs = async (query) => {
  if (!env.RAPIDAPI_KEY) {
    if (env.NODE_ENV !== "production") {
      return {
        jobs: [],
        source: "development-fallback",
        error: "RapidAPI key is not configured. Development fallback jobs are being used."
      };
    }

    return {
      jobs: [],
      source: "disabled",
      error: "RapidAPI key is not configured."
    };
  }

  try {
    const response = await axios.get(`https://${env.RAPIDAPI_HOST}/search`, {
      headers: {
        "x-rapidapi-key": env.RAPIDAPI_KEY,
        "x-rapidapi-host": env.RAPIDAPI_HOST
      },
      params: {
        query,
        page: 1,
        num_pages: 1,
        country: "us",
        date_posted: "all"
      }
    });

    return {
      jobs: response.data?.data || [],
      source: "live",
      error: null
    };
  } catch (error) {
    return {
      jobs: [],
      source: "error",
      error: error.response?.data?.message || error.message || "Job search failed"
    };
  }
};

const getRequiredSkills = (job) => {
  const highlights = Object.values(job.job_highlights || {}).flat().join(" ");
  const jobText = [job.job_title, job.job_description, highlights].filter(Boolean).join("\n");
  return Array.from(new Set(extractSkillsFromText(jobText))).slice(0, 10);
};

export const scoreJobsAgainstResume = (parsedResume, jobs = []) => {
  const resumeSkills = new Set(parsedResume.skills.map(normalizeSkill));

  return jobs.slice(0, 10).map((job) => {
    const requiredSkills = getRequiredSkills(job);
    const matchedSkills = requiredSkills.filter((skill) => resumeSkills.has(normalizeSkill(skill)));
    const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
    const roleMatch = job.job_title?.toLowerCase().includes(parsedResume.roleHint || "")
      ? 10
      : 0;
    const skillScore = requiredSkills.length
      ? Math.round((matchedSkills.length / requiredSkills.length) * 90)
      : 55;

    return {
      jobTitle: job.job_title || "Untitled role",
      company: job.employer_name || "Unknown company",
      location:
        [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") ||
        job.job_location ||
        "Remote / flexible",
      applyLink: job.job_apply_link || job.job_google_link || "#",
      matchScore: Math.min(skillScore + roleMatch, 100),
      missingSkills,
      requiredSkills,
      metadata: {
        employmentType: job.job_employment_type || null,
        postedAt: job.job_posted_at_datetime_utc || null,
        source: job.job_publisher || null,
        descriptionSnippet: job.job_description?.slice(0, 320) || ""
      }
    };
  });
};

export const refreshJobMatchesForResume = async (db, resume) => {
  const query = buildJobSearchQuery(resume.parsedData);
  const result = await searchJobs(query);
  const shouldUseDevelopmentFallback =
    result.source === "development-fallback" ||
    (result.source === "error" && env.NODE_ENV !== "production");
  const rawJobs = shouldUseDevelopmentFallback
    ? buildDevelopmentJobs(query, resume.parsedData)
    : result.jobs;
  const effectiveSource = shouldUseDevelopmentFallback ? "development-fallback" : result.source;

  await db.jobMatch.deleteMany({
    where: { resumeId: resume.id }
  });

  if (!rawJobs.length) {
    return {
      query,
      source: effectiveSource,
      error: result.error,
      jobs: []
    };
  }

  const scoredJobs = scoreJobsAgainstResume(resume.parsedData, rawJobs);

  if (scoredJobs.length) {
    await db.jobMatch.createMany({
      data: scoredJobs.map((job) => ({
        resumeId: resume.id,
        jobTitle: job.jobTitle,
        company: job.company,
        location: job.location,
        applyLink: job.applyLink,
        matchScore: job.matchScore,
        missingSkills: job.missingSkills,
        requiredSkills: job.requiredSkills,
        metadata: {
          ...job.metadata,
          feedSource: effectiveSource
        }
      }))
    });
  }

  return {
    query,
    source: effectiveSource,
    error: result.error,
    jobs: scoredJobs
  };
};
