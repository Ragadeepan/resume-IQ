import { prisma } from "../utils/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { buildJobSearchQuery, refreshJobMatchesForResume } from "../utils/jobs.js";
import { formatJobMatch } from "../utils/responseShapes.js";

export const getJobs = async (req, res) => {
  const { resumeId, refresh } = req.query;

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: req.user.id
    },
    include: {
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

  const query = buildJobSearchQuery(resume.parsedData);

  if (!refresh && resume.jobMatches.length) {
    res.json({
      resumeId: resume.id,
      query,
      source: resume.jobMatches[0]?.metadata?.feedSource || "cached",
      cached: true,
      jobs: resume.jobMatches.map(formatJobMatch)
    });
    return;
  }

  const result = await refreshJobMatchesForResume(prisma, resume);
  const refreshedResume = await prisma.resume.findUnique({
    where: { id: resume.id },
    include: {
      jobMatches: {
        orderBy: {
          matchScore: "desc"
        }
      }
    }
  });

  res.json({
    resumeId: resume.id,
    query: result.query,
    source: result.source,
    cached: false,
    error: result.error,
    jobs: refreshedResume.jobMatches.map(formatJobMatch)
  });
};
