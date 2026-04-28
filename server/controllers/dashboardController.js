import { prisma } from "../utils/prisma.js";
import { HttpError } from "../utils/httpError.js";
import {
  buildDashboardSummary,
  buildHistoryItems,
  formatAnalysis,
  formatJobMatch,
  formatResume
} from "../utils/responseShapes.js";
import { env } from "../config/env.js";

export const getDashboard = async (req, res) => {
  const { resumeId } = req.query;

  const resumes = await prisma.resume.findMany({
    where: {
      userId: req.user.id
    },
    include: {
      analysis: true,
      jobMatches: {
        orderBy: {
          matchScore: "desc"
        }
      }
    },
    orderBy: {
      uploadedAt: "desc"
    }
  });

  const selectedResume =
    resumes.find((resume) => resume.id === resumeId) ||
    resumes.find((resume) => resume.analysis) ||
    resumes[0] ||
    null;

  res.json({
    summary: buildDashboardSummary(resumes),
    history: buildHistoryItems(resumes),
    selected: selectedResume
      ? {
          resume: formatResume(selectedResume),
          analysis: formatAnalysis(selectedResume.analysis),
          jobMatches: selectedResume.jobMatches.map(formatJobMatch)
        }
      : null
  });
};

export const shareAnalysis = async (req, res) => {
  const { analysisId } = req.params;

  const analysis = await prisma.analysis.findFirst({
    where: {
      id: analysisId,
      resume: {
        userId: req.user.id
      }
    }
  });

  if (!analysis) {
    throw new HttpError(404, "Analysis not found");
  }

  res.json({
    shareToken: analysis.shareToken,
    shareUrl: `${env.CLIENT_URL}/reports/${analysis.shareToken}`
  });
};

export const getSharedReport = async (req, res) => {
  const { shareToken } = req.params;

  const analysis = await prisma.analysis.findUnique({
    where: { shareToken },
    include: {
      resume: {
        include: {
          user: {
            select: {
              name: true
            }
          },
          jobMatches: {
            orderBy: {
              matchScore: "desc"
            }
          }
        }
      }
    }
  });

  if (!analysis) {
    throw new HttpError(404, "Shared report not found");
  }

  res.json({
    candidate: analysis.resume.user.name,
    resume: formatResume(analysis.resume),
    analysis: formatAnalysis(analysis),
    jobMatches: analysis.resume.jobMatches.map(formatJobMatch)
  });
};

