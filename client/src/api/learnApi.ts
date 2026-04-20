import type { LearnViewRequest, LearnViewResponse } from "../types/api";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = `Request failed with status ${response.status}`;

  try {
    const errorBody = (await response.json()) as { error?: string; message?: string };
    message = errorBody.error ?? errorBody.message ?? message;
  } catch {
    // Ignore invalid error payloads and fall back to the HTTP status text.
  }

  throw new Error(message);
}

export const learnApi = {
  async markTermViewed(request: LearnViewRequest): Promise<LearnViewResponse> {
    const response = await fetch("/api/learn/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return parseJsonResponse<LearnViewResponse>(response);
  },
};
