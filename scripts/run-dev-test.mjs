import { spawn } from "node:child_process";

const commonEnv = {
  ...process.env,
  USE_MEMORY_DB: process.env.USE_MEMORY_DB || "true",
  REQUIRE_EMAIL_VERIFICATION: process.env.REQUIRE_EMAIL_VERIFICATION || "false",
  CLOUDINARY_CLOUD_NAME: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_API_SECRET: "",
  GEMINI_API_KEY: "",
  RAPIDAPI_KEY: "",
  SMTP_HOST: "",
  SMTP_USER: "",
  SMTP_PASS: ""
};

const children = [
  spawn("npm run dev --workspace server", {
    stdio: "inherit",
    shell: true,
    env: {
      ...commonEnv,
      PORT: process.env.PORT || "5100",
      CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3100",
      SERVER_URL: process.env.SERVER_URL || "http://localhost:5100"
    }
  }),
  spawn("npm run dev --workspace client", {
    stdio: "inherit",
    shell: true,
    env: {
      ...commonEnv,
      PORT: process.env.CLIENT_PORT || "3100",
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100"
    }
  })
];

let shuttingDown = false;

const stopChild = (child) => {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === "win32") {
    spawn(`taskkill /pid ${child.pid} /T /F`, {
      stdio: "ignore",
      shell: true
    });
    return;
  }

  child.kill("SIGTERM");
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  children.forEach(stopChild);
  process.exit(exitCode);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

children.forEach((child) => {
  child.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 1);
    }
  });
});
