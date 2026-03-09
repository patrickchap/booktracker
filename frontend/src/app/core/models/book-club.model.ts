export interface CurrentBook {
  title: string;
  coverImageUrl: string | null;
  authors: string[];
}

export interface BookClub {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  privacy: 'Public' | 'Private';
  memberCount: number;
  currentBook: CurrentBook | null;
  createdByUserId: string;
}

export interface CreateClubRequest {
  name: string;
  privacy: 'Public' | 'Private';
  invitedUserIds: string[];
}

export interface UserSearchResult {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}
