const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const buildUrl = (path, query = {}) => {
  const url = new URL(path, API_BASE_URL);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const apiRequest = async (path, { method = "GET", token, body, query } = {}) => {
  const headers = new Headers();
  const requestInit = {
    method,
    headers,
    cache: "no-store"
  };

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body instanceof FormData) {
    requestInit.body = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), requestInit);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.details = data?.details || null;
    error.data = data || null;
    throw error;
  }

  return data;
};
