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

  companyNumber: string | null;         // ✅ Ajout
  verificationStatus: string;          // ✅ Ajout
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
}

export interface UserPublic {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  bio: string | null;
  point: number;
}
