import { InfiniteData } from '@tanstack/react-query';

export interface Event {
  _id: string;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender?: string;
    verified: boolean;
    bio?: string;
    hobbies: string[];
  }
  
export type InfiniteEventsResponse = InfiniteData<EventsResponse>;