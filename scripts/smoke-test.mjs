import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { Blob } from "node:buffer";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const tmpDirectory = path.join(repoRoot, "tmp");
const apiPort = process.env.SMOKE_TEST_PORT || "5050";
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const email = `smoke-${Date.now()}@example.com`;
const password = "Password123!";
const nextPassword = "Password456!";

const log = (message) => {
  process.stdout.write(`${message}\n`);
};

const createSampleResume = async () => {
  await fs.mkdir(tmpDirectory, { recursive: true });

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "Avery Johnson",
            heading: HeadingLevel.TITLE
          }),
          new Paragraph("Full Stack Developer"),
          new Paragraph({
            children: [new TextRun({ text: "Summary", bold: true })]
          }),
          new Paragraph(
            "Full stack engineer with 5 years of experience building React, Next.js, Node.js, and PostgreSQL products."
          ),
          new Paragraph({
            children: [new TextRun({ text: "Skills", bold: true })]
          }),
          new Paragraph("React, Next.js, JavaScript, Node.js, Express, PostgreSQL, Prisma, Docker, AWS"),
          new Paragraph({
            children: [new TextRun({ text: "Experience", bold: true })]
          }),
          new Paragraph("Senior Full Stack Developer | Northstar Labs | Jan 2023 - Present"),
          new Paragraph("Built customer-facing React and Next.js workflows used by 40,000+ monthly users."),
          new Paragraph("Optimized Node.js APIs and PostgreSQL queries to reduce average response time by 38%."),
          new Paragraph("Implemented CI/CD pipelines and Docker-based deployments for three production services."),
          new Paragraph({
            children: [new TextRun({ text: "Projects", bold: true })]
          }),
          new Paragraph("ResumeIQ Analytics Dashboard"),
          new Paragraph("Designed a recruiter dashboard with role-based analytics, charts, and keyword intelligence."),
          new Paragraph("Created an ATS scoring pipeline with resume parsing, OpenAI feedback, and job match scoring."),
          new Paragraph({
            children: [new TextRun({ text: "Education", bold: true })]
          }),
          new Paragraph("Bachelor of Technology in Computer Science | 2021")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(document);
  const filePath = path.join(tmpDirectory, "smoke-resume.docx");
  await fs.writeFile(filePath, buffer);
  return filePath;
};

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Retry until the server is ready.
    }

    await delay(1000);
  }

  throw new Error("Server did not become healthy in time.");
};

const request = async (pathName, { method = "GET", token, body } = {}) => {
  const headers = {};
  const init = {
    method,
    headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBaseUrl}${pathName}`, init);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || `Request failed for ${pathName}`);
  }

  return payload;
};

const requestAllowingError = async (pathName, { method = "GET", token, body } = {}) => {
  const headers = {};
  const init = {
    method,
    headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBaseUrl}${pathName}`, init);
  const payload = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    payload
  };
};

const extractTokenFromUrl = (url, parameterName = "token") =>
  new URL(url).searchParams.get(parameterName);

const run = async () => {
  const resumePath = await createSampleResume();
  const serverProcess = spawn("node", ["server/index.js"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: apiPort,
      SERVER_URL: apiBaseUrl,
      CLIENT_URL: "http://localhost:3000",
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5433/resumeiq?schema=public",
      USE_MEMORY_DB: process.env.USE_MEMORY_DB || "true",
      REQUIRE_EMAIL_VERIFICATION: process.env.REQUIRE_EMAIL_VERIFICATION || "true",
      JWT_SECRET: process.env.JWT_SECRET || "resumeiq-local-dev-secret-12345",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
      GEMINI_API_KEY: "",
      RAPIDAPI_KEY: "",
      SMTP_HOST: "",
      SMTP_USER: "",
      SMTP_PASS: "",
      NODE_ENV: process.env.NODE_ENV || "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  serverProcess.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });

  serverProcess.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  try {
    log("Waiting for API health...");
    await waitForHealth();

    log("Registering smoke-test user...");
    const registerResponse = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Smoke Test User",
        email,
        password
      }
    });

    log("Logging in...");
    let verifiedBeforeInitialLogin = false;
    let loginResponse = await requestAllowingError("/auth/login", {
      method: "POST",
      body: {
        email,
        password
      }
    });

    if (!loginResponse.ok && loginResponse.status === 403) {
      log("Verifying email before first login...");
      const verificationUrl =
        loginResponse.payload?.details?.verificationUrl || registerResponse.debug?.verificationUrl || "";
      const verifyTokenFromLoginBlock = extractTokenFromUrl(verificationUrl);
      if (verifyTokenFromLoginBlock) {
        await request("/auth/verify-email", {
          method: "POST",
          body: {
            token: verifyTokenFromLoginBlock
          }
        });
        verifiedBeforeInitialLogin = true;
      }

      loginResponse = await requestAllowingError("/auth/login", {
        method: "POST",
        body: {
          email,
          password
        }
      });
    }

    if (!loginResponse.ok) {
      throw new Error(loginResponse.payload.message || "Login failed during smoke test");
    }

    let session = loginResponse.payload;

    log("Verifying email...");
    const verifyToken = extractTokenFromUrl(registerResponse.debug?.verificationUrl || "");
    if (verifyToken && !verifiedBeforeInitialLogin) {
      session = await request("/auth/verify-email", {
        method: "POST",
        body: {
          token: verifyToken
        }
      });
    }

    log("Refreshing session...");
    session = await request("/auth/refresh", {
      method: "POST",
      body: {
        refreshToken: session.refreshToken
      }
    });

    log("Testing password reset flow...");
    const forgotPasswordResponse = await request("/auth/forgot-password", {
      method: "POST",
      body: {
        email
      }
    });
    const resetToken = extractTokenFromUrl(forgotPasswordResponse.debug?.resetUrl || "");
    if (resetToken) {
      session = await request("/auth/reset-password", {
        method: "POST",
        body: {
          token: resetToken,
          password: nextPassword
        }
      });
    }

    log("Logging in with reset password...");
    session = await request("/auth/login", {
      method: "POST",
      body: {
        email,
        password: nextPassword
      }
    });

    const token = session.token;
    const formData = new FormData();
    const fileBuffer = await fs.readFile(resumePath);
    formData.append(
      "resume",
      new Blob([fileBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }),
      "smoke-resume.docx"
    );

    log("Uploading sample resume...");
    const uploadResponse = await request("/upload", {
      method: "POST",
      token,
      body: formData
    });

    log("Running analysis...");
    const analyzeResponse = await request("/analyze", {
      method: "POST",
      token,
      body: {
        resumeId: uploadResponse.resume.id,
        jobDescription:
          "We are hiring a full stack developer with React, Next.js, Node.js, PostgreSQL, Docker, CI/CD, and API design experience."
      }
    });

    log("Fetching dashboard and jobs...");
    const dashboardResponse = await request(`/dashboard?resumeId=${uploadResponse.resume.id}`, {
      token
    });
    const jobsResponse = await request(`/jobs?resumeId=${uploadResponse.resume.id}`, {
      token
    });
    const sharedReportResponse = await request(
      `/dashboard/report/${analyzeResponse.analysis.shareToken}`
    );

    log("");
    log("Smoke test passed.");
    log(`Registered user: ${registerResponse.user.email}`);
    log(`Email verified: ${session.user.emailVerified}`);
    log(`Uploaded resume id: ${uploadResponse.resume.id}`);
    log(`ATS score: ${analyzeResponse.analysis.score}`);
    log(`Keyword coverage: ${analyzeResponse.analysis.keywordReport?.keywordCoverage ?? 0}%`);
    log(`Job source: ${jobsResponse.source}`);
    log(`Job matches returned: ${jobsResponse.jobs.length}`);
    log(`Shared report candidate: ${sharedReportResponse.candidate}`);
    log(
      `Dashboard selected resume: ${dashboardResponse.selected?.resume?.originalFileName || "n/a"}`
    );
  } finally {
    serverProcess.kill("SIGTERM");
    await delay(1000);
  }
};

run().catch((error) => {
  const hint = error.message.includes("Can't reach database server")
    ? " Start PostgreSQL first with `npm run db:up`, then rerun the smoke test."
    : "";
  console.error(`Smoke test failed: ${error.message}${hint}`);
  process.exit(1);
});
