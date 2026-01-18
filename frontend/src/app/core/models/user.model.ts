export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

// Access token in response body (stored in memory), refresh token in HttpOnly cookie
export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: User;
}
