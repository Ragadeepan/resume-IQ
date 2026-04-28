import { env } from "../config/env.js";

export const formatResume = (resume) => ({
  id: resume.id,
  fileUrl: resume.fileUrl,
  originalFileName: resume.originalFileName,
  fileType: resume.fileType,
  uploadedAt: resume.uploadedAt,
  parsedData: resume.parsedData
});

export const formatAnalysis = (analysis) =>
  analysis
    ? {
        id: analysis.id,
        score: analysis.score,
        scoreBreakdown: analysis.scoreBreakdown,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        keywordReport: analysis.keywordReport,
        improvedBullets: analysis.improvedBullets,
        targetJobDescription: analysis.targetJobDescription,
        shareToken: analysis.shareToken,
        shareUrl: `${env.CLIENT_URL}/reports/${analysis.shareToken}`,
        createdAt: analysis.createdAt
      }
    : null;

export const formatJobMatch = (jobMatch) => ({
  id: jobMatch.id,
  jobTitle: jobMatch.jobTitle,
  company: jobMatch.company,
  location: jobMatch.location,
  applyLink: jobMatch.applyLink,
  matchScore: jobMatch.matchScore,
  missingSkills: jobMatch.missingSkills,
  requiredSkills: jobMatch.requiredSkills,
  metadata: jobMatch.metadata,
  createdAt: jobMatch.createdAt
});

export const buildDashboardSummary = (resumes) => {
  const analyzedResumes = resumes.filter((resume) => resume.analysis);
  const averageScore = analyzedResumes.length
    ? Math.round(
        analyzedResumes.reduce((sum, resume) => sum + resume.analysis.score, 0) /
          analyzedResumes.length
      )
    : 0;

  const skillCounts = new Map();
  for (const resume of resumes) {
    for (const skill of resume.parsedData?.skills || []) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }
  }

  const topSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  return {
    totalResumes: resumes.length,
    analyzedResumes: analyzedResumes.length,
    averageScore,
    topSkills
  };
};

export const buildHistoryItems = (resumes) =>
  resumes.map((resume) => ({
    resumeId: resume.id,
    analysisId: resume.analysis?.id || null,
    originalFileName: resume.originalFileName,
    uploadedAt: resume.uploadedAt,
    score: resume.analysis?.score || null,
    shareToken: resume.analysis?.shareToken || null,
    topSkills: (resume.parsedData?.skills || []).slice(0, 5)
  }));
