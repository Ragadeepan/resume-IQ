const ACCESS_TOKEN_KEY = "resumeiq_access_token";
const REFRESH_TOKEN_KEY = "resumeiq_refresh_token";
const USER_KEY = "resumeiq_user";
const LAST_RESUME_KEY = "resumeiq_last_resume";

export const getAuthToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getRefreshToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const storeAuthSession = (sessionOrToken, maybeUser) => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof sessionOrToken === "string") {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, sessionOrToken);
    if (maybeUser) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(maybeUser));
    }
    return;
  }

  if (sessionOrToken?.token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, sessionOrToken.token);
  }
  if (sessionOrToken?.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, sessionOrToken.refreshToken);
  }
  if (sessionOrToken?.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(sessionOrToken.user));
  }
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

export const getLastResumeId = () =>
  typeof window !== "undefined" ? window.localStorage.getItem(LAST_RESUME_KEY) : null;

export const setLastResumeId = (resumeId) => {
  if (typeof window === "undefined" || !resumeId) {
    return;
  }

  window.localStorage.setItem(LAST_RESUME_KEY, resumeId);
};
