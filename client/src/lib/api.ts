// API configuration and utilities
// Use localhost for development, AWS for production
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/v1"
    : "http://ec2-16-170-98-58.eu-north-1.compute.amazonaws.com:8000/api/v1";

// Debug logging for API URL
console.log("🔧 API Configuration:", {
  envApiUrl: process.env.NEXT_PUBLIC_API_URL,
  finalApiUrl: API_BASE_URL,
  nodeEnv: process.env.NODE_ENV,
});

// Helper function to get API base URL for use in components
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  method?: string;
  errors?: any[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVerified: boolean;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Enhanced debug logging
    console.log("🔗 Making API request:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
      baseURL: this.baseURL,
      endpoint,
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent,
    });

    try {
      const response = await fetch(url, config);

      console.log("📡 API response received:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ API error response:", {
          status: response.status,
          data,
        });
        // Handle API error responses
        throw new ApiError(
          data.message || "An error occurred",
          response.status,
          data,
        );
      }

      console.log("✅ API request successful:", data);
      return data;
    } catch (error) {
      console.error("🚨 API request failed:", {
        error,
        url,
        baseURL: this.baseURL,
        endpoint,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack,
      });

      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors with enhanced debugging
      const networkError = new ApiError(
        `Network error connecting to ${url}. Please check your connection and server availability. If this persists, verify the server is running at ${this.baseURL}`,
        0,
        {
          originalError: error,
          url,
          baseURL: this.baseURL,
          timestamp: new Date().toISOString(),
          errorType: (error as Error).name,
          errorMessage: (error as Error).message,
        },
      );

      console.error("🚨 Complete network error details:", {
        error: networkError,
        originalError: error,
        stack: (error as Error).stack,
        requestDetails: { url, method: config.method, headers: config.headers },
      });

      throw networkError;
    }
  }

  async signUp(data: SignUpRequest): Promise<ApiResponse<AuthData>> {
    return this.request<AuthData>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInRequest): Promise<ApiResponse<AuthData>> {
    return this.request<AuthData>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async getProfile(token: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>("/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export class ApiError extends Error {
  public statusCode: number;
  public data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const api = new ApiClient(API_BASE_URL);
