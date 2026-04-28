import { randomUUID } from "crypto";

const memoryState = globalThis.__resumeIqMemoryState || {
  users: [],
  resumes: [],
  analyses: [],
  jobMatches: [],
  authTokens: []
};

if (!globalThis.__resumeIqMemoryState) {
  globalThis.__resumeIqMemoryState = memoryState;
}

const clone = (value) => structuredClone(value);

const compareValues = (left, right, direction = "asc") => {
  const leftValue = left instanceof Date ? left.getTime() : left;
  const rightValue = right instanceof Date ? right.getTime() : right;

  if (leftValue === rightValue) {
    return 0;
  }

  const baseOrder = leftValue > rightValue ? 1 : -1;
  return direction === "desc" ? -baseOrder : baseOrder;
};

const sortRecords = (records, orderBy) => {
  if (!orderBy) {
    return records.map(clone);
  }

  const [field, direction] = Object.entries(orderBy)[0];
  return [...records].sort((left, right) => compareValues(left[field], right[field], direction)).map(clone);
};

const selectFields = (record, select) => {
  if (!record) {
    return null;
  }

  if (!select) {
    return clone(record);
  }

  const selectedRecord = {};

  for (const [field, enabled] of Object.entries(select)) {
    if (enabled) {
      selectedRecord[field] = clone(record[field]);
    }
  }

  return selectedRecord;
};

const findUserRecord = (where = {}) =>
  memoryState.users.find((user) => {
    if (where.id && user.id !== where.id) {
      return false;
    }

    if (where.email && user.email !== where.email) {
      return false;
    }

    return true;
  }) || null;

const findResumeRecord = (where = {}) =>
  memoryState.resumes.find((resume) => {
    if (where.id && resume.id !== where.id) {
      return false;
    }

    if (where.userId && resume.userId !== where.userId) {
      return false;
    }

    return true;
  }) || null;

const findAnalysisRecord = (where = {}) =>
  memoryState.analyses.find((analysis) => {
    if (where.id && analysis.id !== where.id) {
      return false;
    }

    if (where.resumeId && analysis.resumeId !== where.resumeId) {
      return false;
    }

    if (where.shareToken && analysis.shareToken !== where.shareToken) {
      return false;
    }

    if (where.resume?.userId) {
      const resume = findResumeRecord({ id: analysis.resumeId });
      if (!resume || resume.userId !== where.resume.userId) {
        return false;
      }
    }

    return true;
  }) || null;

const matchesNullableField = (actualValue, expectedValue) => {
  if (expectedValue === undefined) {
    return true;
  }

  if (expectedValue === null) {
    return actualValue === null;
  }

  return actualValue === expectedValue;
};

const filterAuthTokenRecords = (where = {}) =>
  memoryState.authTokens.filter((token) => {
    if (where.id && token.id !== where.id) {
      return false;
    }

    if (where.userId && token.userId !== where.userId) {
      return false;
    }

    if (where.tokenHash && token.tokenHash !== where.tokenHash) {
      return false;
    }

    if (where.type && token.type !== where.type) {
      return false;
    }

    if (!matchesNullableField(token.usedAt, where.usedAt)) {
      return false;
    }

    if (!matchesNullableField(token.revokedAt, where.revokedAt)) {
      return false;
    }

    if (where.expiresAt?.gt && !(token.expiresAt > where.expiresAt.gt)) {
      return false;
    }

    return true;
  });

const attachResumeIncludes = (resume, include = {}) => {
  const result = clone(resume);

  if (include.analysis) {
    const analysis = findAnalysisRecord({ resumeId: resume.id });
    result.analysis = analysis ? clone(analysis) : null;
  }

  if (include.jobMatches) {
    const jobMatches = memoryState.jobMatches.filter((jobMatch) => jobMatch.resumeId === resume.id);
    result.jobMatches = sortRecords(jobMatches, include.jobMatches.orderBy);
  }

  return result;
};

const attachAnalysisIncludes = (analysis, include = {}) => {
  const result = clone(analysis);

  if (include.resume) {
    const resumeRecord = findResumeRecord({ id: analysis.resumeId });

    if (!resumeRecord) {
      result.resume = null;
      return result;
    }

    const resumeInclude = include.resume.include || {};
    const resume = clone(resumeRecord);

    if (resumeInclude.user) {
      const userRecord = findUserRecord({ id: resume.userId });
      resume.user = selectFields(userRecord, resumeInclude.user.select);
    }

    if (resumeInclude.jobMatches) {
      const jobMatches = memoryState.jobMatches.filter((jobMatch) => jobMatch.resumeId === resume.id);
      resume.jobMatches = sortRecords(jobMatches, resumeInclude.jobMatches.orderBy);
    }

    result.resume = resume;
  }

  return result;
};

export const memoryDb = {
  user: {
    async findUnique({ where, select } = {}) {
      return selectFields(findUserRecord(where), select);
    },

    async create({ data, select } = {}) {
      const now = new Date();
      const user = {
        id: randomUUID(),
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        ...clone(data)
      };

      memoryState.users.push(user);
      return selectFields(user, select);
    },

    async update({ where, data, select } = {}) {
      const user = findUserRecord(where);

      if (!user) {
        return null;
      }

      Object.assign(user, clone(data), { updatedAt: new Date() });
      return selectFields(user, select);
    }
  },

  resume: {
    async create({ data } = {}) {
      const now = new Date();
      const resume = {
        id: randomUUID(),
        uploadedAt: now,
        updatedAt: now,
        cloudinaryPublicId: null,
        ...clone(data)
      };

      memoryState.resumes.push(resume);
      return clone(resume);
    },

    async findFirst({ where, include } = {}) {
      const resume = findResumeRecord(where);
      return resume ? attachResumeIncludes(resume, include) : null;
    },

    async findMany({ where = {}, include, orderBy } = {}) {
      const resumes = memoryState.resumes.filter((resume) => {
        if (where.userId && resume.userId !== where.userId) {
          return false;
        }

        return true;
      });

      return sortRecords(resumes, orderBy).map((resume) => attachResumeIncludes(resume, include));
    },

    async findUnique({ where, include } = {}) {
      const resume = findResumeRecord(where);
      return resume ? attachResumeIncludes(resume, include) : null;
    }
  },

  analysis: {
    async upsert({ where, update, create } = {}) {
      const existingAnalysis = findAnalysisRecord(where);

      if (existingAnalysis) {
        Object.assign(existingAnalysis, clone(update), {
          updatedAt: new Date()
        });
        return clone(existingAnalysis);
      }

      const now = new Date();
      const analysis = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...clone(create)
      };

      memoryState.analyses.push(analysis);
      return clone(analysis);
    },

    async findFirst({ where } = {}) {
      const analysis = findAnalysisRecord(where);
      return analysis ? clone(analysis) : null;
    },

    async findUnique({ where, include } = {}) {
      const analysis = findAnalysisRecord(where);
      return analysis ? attachAnalysisIncludes(analysis, include) : null;
    }
  },

  jobMatch: {
    async deleteMany({ where } = {}) {
      const matches = memoryState.jobMatches.filter((jobMatch) => jobMatch.resumeId === where.resumeId);
      memoryState.jobMatches = memoryState.jobMatches.filter((jobMatch) => jobMatch.resumeId !== where.resumeId);
      globalThis.__resumeIqMemoryState.jobMatches = memoryState.jobMatches;

      return {
        count: matches.length
      };
    },

    async createMany({ data } = {}) {
      const createdAt = new Date();
      const nextJobMatches = data.map((jobMatch) => ({
        id: randomUUID(),
        createdAt,
        ...clone(jobMatch)
      }));

      memoryState.jobMatches.push(...nextJobMatches);
      return {
        count: nextJobMatches.length
      };
    }
  },

  authToken: {
    async create({ data } = {}) {
      const authToken = {
        id: randomUUID(),
        createdAt: new Date(),
        usedAt: null,
        revokedAt: null,
        ...clone(data)
      };

      memoryState.authTokens.push(authToken);
      return clone(authToken);
    },

    async findFirst({ where, include } = {}) {
      const tokenRecord = filterAuthTokenRecords(where)[0] || null;

      if (!tokenRecord) {
        return null;
      }

      const result = clone(tokenRecord);

      if (include?.user) {
        const user = findUserRecord({ id: tokenRecord.userId });
        result.user = user ? clone(user) : null;
      }

      return result;
    },

    async update({ where, data } = {}) {
      const tokenRecord = filterAuthTokenRecords(where)[0] || null;

      if (!tokenRecord) {
        return null;
      }

      Object.assign(tokenRecord, clone(data));
      return clone(tokenRecord);
    },

    async updateMany({ where, data } = {}) {
      const tokenRecords = filterAuthTokenRecords(where);

      for (const tokenRecord of tokenRecords) {
        Object.assign(tokenRecord, clone(data));
      }

      return {
        count: tokenRecords.length
      };
    }
  }
};
