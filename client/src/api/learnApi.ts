import type {
  LearnNextRequest,
  LearnNextResponse,
  LearnViewRequest,
  LearnViewResponse,
} from "../types/api";

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
  async getNextTerm(request: LearnNextRequest = {}): Promise<LearnNextResponse> {
    const params = new URLSearchParams();

    if (request.preferredSystem) {
      params.set("preferredSystem", request.preferredSystem);
    }

    if (request.preferredTermType) {
      params.set("preferredTermType", request.preferredTermType);
    }

    if (request.excludeKcIds && request.excludeKcIds.length > 0) {
      params.set("excludeKcIds", request.excludeKcIds.join(","));
    }

    const query = params.toString();
    const response = await fetch(`/api/learn/next${query ? `?${query}` : ""}`);

    return parseJsonResponse<LearnNextResponse>(response);
  },

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
