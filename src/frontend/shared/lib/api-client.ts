import { ApiEnvelope } from "@/backend/common/http/types";

export const apiPost = async <T>(path: string, body: object): Promise<T> => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(path, { credentials: "include" });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
};

export const apiPatch = async <T>(path: string, body: object): Promise<T> => {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
};

export const apiDelete = async <T>(path: string): Promise<T> => {
  const response = await fetch(path, {
    method: "DELETE",
    credentials: "include",
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
};
