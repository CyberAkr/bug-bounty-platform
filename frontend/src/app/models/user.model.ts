export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  username: string;
  bio: string;
  preferredLanguage: string;
  profilePhoto: string | null;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  bio: string;
  profilePhoto: string | null;
}
