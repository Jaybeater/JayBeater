export enum AppView {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  FLIGHT_RESULTS = 'FLIGHT_RESULTS',
  CHECK_IN = 'CHECK_IN',
  LUGGAGE_EXTRA = 'LUGGAGE_EXTRA',
  SUCCESS = 'SUCCESS',
  DESTINATION_DETAIL = 'DESTINATION_DETAIL',
  HOTEL_FLOW = 'HOTEL_FLOW'
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  features: string[];
}

export interface User {
  email: string;
  name: string;
  isAuthenticated: boolean;
  faceDataset?: string[]; // Array of base64 images acting as the trained model
}

export interface CheckInStep {
  step: 'face' | 'id' | 'luggage' | 'review';
}

export interface HotelBookingStep {
  step: 'selection' | 'face' | 'id' | 'review';
}

export interface IDCardData {
  name: string;
  idNumber: string;
  isValid: boolean;
}

export interface LuggageAnalysis {
  estimatedWeight: number;
  objectDescription: string; // New field: "Blue Suitcase", "Black Backpack", etc.
  isCarryOnCompliant: boolean;
  reason: string;
}

export interface FaceAnalysisResult {
  match: boolean;
  confidence: number;
  hasObstruction: boolean;
  obstructionDetail: string; // e.g., "Phát hiện khẩu trang", "Phát hiện kính râm"
  hasFace: boolean;
}

export interface ConfirmationState {
  step: 'face' | 'id' | 'luggage';
  imageSrc: string;
  data: any; // FaceAnalysisResult | IDCardData | LuggageAnalysis
}