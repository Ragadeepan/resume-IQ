import { randomBytes } from "crypto";
import { prisma } from "../utils/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { buildKeywordReport, calculateATSScore } from "../utils/scoring.js";
import { analyzeResume as analyzeResumeWithGemini, buildFallbackInsights } from "../utils/ai.js";
import { refreshJobMatchesForResume } from "../utils/jobs.js";
import { formatAnalysis, formatJobMatch, formatResume } from "../utils/responseShapes.js";

export const analyzeResume = async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: req.user.id
    },
    include: {
      analysis: true,
      jobMatches: {
        orderBy: {
          matchScore: "desc"
        }
      }
    }
  });

  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }

  const keywordReport = buildKeywordReport(resume.parsedData, jobDescription);
  const atsReport = calculateATSScore(resume.parsedData, keywordReport);
  const fallbackInsights = buildFallbackInsights({
    parsedResume: resume.parsedData,
    scoreBreakdown: atsReport.breakdown,
    keywordReport
  });
  const analysisContext = [
    "Resume raw text:",
    resume.rawText,
    "Parsed resume summary:",
    JSON.stringify(resume.parsedData, null, 2),
    "ATS score breakdown:",
    JSON.stringify(atsReport.breakdown, null, 2),
    "Keyword report:",
    JSON.stringify(keywordReport, null, 2),
    jobDescription ? `Target job description:\n${jobDescription}` : null
  ]
    .filter(Boolean)
    .join("\n\n");
  const geminiAnalysis = await analyzeResumeWithGemini(analysisContext);
  const aiInsights = {
    strengths: geminiAnalysis.strengths?.length ? geminiAnalysis.strengths : fallbackInsights.strengths,
    weaknesses: geminiAnalysis.weaknesses?.length ? geminiAnalysis.weaknesses : fallbackInsights.weaknesses,
    suggestions: geminiAnalysis.suggestions?.length ? geminiAnalysis.suggestions : fallbackInsights.suggestions,
    improvedBullets: fallbackInsights.improvedBullets
  };

  const shareToken = resume.analysis?.shareToken || randomBytes(18).toString("hex");

  await prisma.analysis.upsert({
    where: { resumeId: resume.id },
    update: {
      score: atsReport.score,
      scoreBreakdown: atsReport.breakdown,
      strengths: aiInsights.strengths,
      weaknesses: aiInsights.weaknesses,
      suggestions: aiInsights.suggestions,
      keywordReport,
      improvedBullets: aiInsights.improvedBullets,
      targetJobDescription: jobDescription || null
    },
    create: {
      resumeId: resume.id,
      score: atsReport.score,
      scoreBreakdown: atsReport.breakdown,
      strengths: aiInsights.strengths,
      weaknesses: aiInsights.weaknesses,
      suggestions: aiInsights.suggestions,
      keywordReport,
      improvedBullets: aiInsights.improvedBullets,
      targetJobDescription: jobDescription || null,
      shareToken
    }
  });

  const jobSync = await refreshJobMatchesForResume(prisma, resume);

  const updatedResume = await prisma.resume.findUnique({
    where: { id: resume.id },
    include: {
      analysis: true,
      jobMatches: {
        orderBy: {
          matchScore: "desc"
        }
      }
    }
  });

  res.json({
    message: "Resume analyzed successfully",
    meta: {
      jobQuery: jobSync.query,
      jobSource: jobSync.source,
      jobError: jobSync.error
    },
    resume: formatResume(updatedResume),
    analysis: formatAnalysis(updatedResume.analysis),
    jobMatches: updatedResume.jobMatches.map(formatJobMatch)
  });
};
