export interface UserResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  username: string | null;
  bio: string | null;
  preferredLanguage: 'fr' | 'en';
  profilePhoto: string | null;
  companyNumber?: string | null;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  bankAccount?: string | null; //  AJOUT
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
