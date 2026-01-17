export interface BookSearchResult {
  googleBooksId: string;
  title: string;
  authors: string[];
  coverImageUrl?: string;
  publishedDate?: string;
}

export interface SearchResponse {
  items: BookSearchResult[];
  totalItems: number;
}

export interface BookDetails {
  googleBooksId: string;
  title: string;
  authors: string[];
  description?: string;
  coverImageUrl?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  categories?: string[];
}

export enum ReadingStatus {
  WantToRead = 0,
  CurrentlyReading = 1,
  Finished = 2
}

export interface UserBook {
  id: string;
  googleBooksId: string;
  title: string;
  authors: string[];
  coverImageUrl?: string;
  status: ReadingStatus;
  startedAt?: string;
  finishedAt?: string;
  rating?: number;
  notes?: string;
  addedAt: string;
}

export interface AddBookRequest {
  googleBooksId: string;
  status?: ReadingStatus;
}

export interface UpdateBookRequest {
  status?: ReadingStatus;
  startedAt?: string;
  finishedAt?: string;
  rating?: number;
  notes?: string;
}
