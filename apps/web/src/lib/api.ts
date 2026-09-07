import {
  AuthResponse,
  AuthUser,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
} from "./auth";

const API_URL = "";

interface ApiErrorBody {
  message?: string | string[];
}

async function parseError(response: Response): Promise<string> {
  const body = await response
    .json()
    .catch(() => ({ message: "Request failed" })) as ApiErrorBody;

  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }

  return body.message ?? "Request failed";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function refreshSession(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token.");
  }

  const auth = await request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  saveAuthSession(auth);

  return auth;
}

async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No active login session.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  try {
    return await request<T>(path, {
      ...options,
      headers,
    });
  } catch (error) {
    if (
      retry &&
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      try {
        const auth = await refreshSession();

        const retryHeaders = new Headers(options.headers);
        retryHeaders.set(
          "Authorization",
          `Bearer ${auth.accessToken}`,
        );

        return await request<T>(path, {
          ...options,
          headers: retryHeaders,
        });
      } catch {
        clearAuthSession();
        throw new Error("Your session has expired. Please sign in again.");
      }
    }

    throw error;
  }
}

export function getCurrentUser() {
  return authenticatedRequest<{ user: AuthUser }>("/auth/me");
}

export function logout() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    return Promise.resolve({ success: true });
  }

  return request<{ success: boolean }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  }).finally(() => {
    clearAuthSession();
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
  return authenticatedRequest<Vehicle[]>("/vehicles");
}

export function createVehicle(data: CreateVehicleInput) {
  return authenticatedRequest<Vehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVehicle(
  id: string,
  data: Partial<CreateVehicleInput>,
) {
  return authenticatedRequest<Vehicle>(`/vehicles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function updateVehicleStatus(
  id: string,
  status: Vehicle["status"],
) {
  return authenticatedRequest<Vehicle>(`/vehicles/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteVehicle(id: string) {
  return authenticatedRequest<{ success: boolean }>(
    `/vehicles/${id}`,
    {
      method: "DELETE",
    },
  );
}


export type DriverAvailability =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "ON_TRIP"
  | "OFF_DUTY";

export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  licenseNumber: string;
  availability: DriverAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverInput {
  name: string;
  email: string;
  phone?: string;
  licenseNumber: string;
}

export function getDrivers() {
  return authenticatedRequest<Driver[]>("/drivers");
}

export function createDriver(data: CreateDriverInput) {
  return authenticatedRequest<Driver>("/drivers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDriver(
  id: string,
  data: Partial<CreateDriverInput>,
) {
  return authenticatedRequest<Driver>(`/drivers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}


export function updateDriverAvailability(
  id: string,
  availability: DriverAvailability,
) {
  return authenticatedRequest<Driver>(`/drivers/${id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ availability }),
  });
}



export interface Customer {
  id: string;
  userId: string | null;

  name: string;
  email: string | null;
  phone: string | null;

  licenseNumber: string | null;
  passportNumber: string | null;
  address: string | null;

  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;

  _count?: {
    Booking: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  passportNumber?: string;
  address?: string;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID";

export interface Booking {
  id: string;
  referenceNumber: string;
  customerId: string;
  driverId: string | null;
  vehicleId: string | null;
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  dropoffDate: string;
  passengerCount: number;
  fare: string | number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: Customer;

  driver?: {
    id: string;
    userId: string;
    licenseNumber: string;
    availability: DriverAvailability;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
  } | null;

  vehicle?: Vehicle | null;
}

export interface CreateBookingInput {
  customerId: string;
  driverId?: string;
  vehicleId?: string;
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  dropoffDate: string;
  passengerCount: number;
  fare: number;
  notes?: string;
}

export function getCustomers() {
  return authenticatedRequest<Customer[]>("/customers");
}

export function createCustomer(data: CreateCustomerInput) {
  return authenticatedRequest<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCustomer(
  id: string,
  data: Partial<CreateCustomerInput>,
) {
  return authenticatedRequest<Customer>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getBookings() {
  return authenticatedRequest<Booking[]>("/bookings");
}

export function getBooking(id: string) {
  return authenticatedRequest<Booking>(`/bookings/${id}`);
}

export function createBooking(data: CreateBookingInput) {
  return authenticatedRequest<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBooking(
  id: string,
  data: Partial<CreateBookingInput>,
) {
  return authenticatedRequest<Booking>(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus,
) {
  return authenticatedRequest<Booking>(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateBookingPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
) {
  return authenticatedRequest<Booking>(`/bookings/${id}/payment-status`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}

export function cancelBooking(id: string) {
  return authenticatedRequest<Booking>(`/bookings/${id}/cancel`, {
    method: "POST",
  });
}
