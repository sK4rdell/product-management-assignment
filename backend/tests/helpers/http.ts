import { Result, StatusError } from "@kardell/result";
import { unknown } from "zod";

async function request<T>(
  uri: string,
  options: RequestInit = {}
): Promise<Result<T, StatusError>> {
  try {
    const response = await fetch(`http://localhost:3000/${uri}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      return Result.failure(
        new StatusError(response.statusText, response.status)
      );
    }
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return Result.of(unknown as T);
    }
    const data = await response.json();
    return Result.of(data as T);
  } catch (error) {
    console.error("Failed to make request, error:", error);
    return Result.failure(
      new StatusError(
        error instanceof Error ? error.message : "Unknown error",
        500
      )
    );
  }
}

export const http = {
  get: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
