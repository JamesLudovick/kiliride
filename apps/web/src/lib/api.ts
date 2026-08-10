import { AuthResponse, AuthUser, getAccessToken } from "./auth";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: "Request failed" }));

    throw new Error(errorBody.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  return request<{ user: AuthUser }>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  type: "SEDAN" | "SUV" | "VAN" | "PICKUP";
  status: "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE";
  driverId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  type: Vehicle["type"];
}

export function getVehicles() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  return request<Vehicle[]>("/vehicles", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createVehicle(data: CreateVehicleInput) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  return request<Vehicle>("/vehicles", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export function updateVehicle(
  id: string,
  data: Partial<CreateVehicleInput>,
) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  return request<Vehicle>(`/vehicles/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export function updateVehicleStatus(
  id: string,
  status: Vehicle["status"],
) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  return request<Vehicle>(`/vehicles/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export function deleteVehicle(id: string) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  return request<{ success: boolean }>(`/vehicles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
