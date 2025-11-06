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

  companyNumber: string | null;
  verificationStatus: string;
}


export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  bio: string;
  profilePhoto: string | null;
}


export interface UserRanking {
  userId: number;
  username: string;
  point: number;
  profilePhoto?: string | null;
}

export interface UserPublic {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  bio: string | null;
  point: number;
  profilePhoto?: string | null;
}

export interface UserBadge {
  id: number;
  name: string;
  iconUrl: string;
}
