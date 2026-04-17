import type { GetDashboardResponse } from "../types/api";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = `Request failed with status ${response.status}`;

  try {
    const errorBody = (await response.json()) as { error?: string; message?: string };
    message = errorBody.error ?? errorBody.message ?? message;
  } catch {
    // Fall back to the HTTP status when the error payload is not JSON.
  }

  throw new Error(message);
}

export const dashboardApi = {
  async getDashboardData(): Promise<GetDashboardResponse> {
    const response = await fetch("/api/dashboard");
    return parseJsonResponse<GetDashboardResponse>(response);
  },
};
