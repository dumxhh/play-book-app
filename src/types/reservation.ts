export interface Reservation {
  id: string;
  sport: string;
  date: Date;
  startTime: string;
  endTime: string;
  courtNumber: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Court {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  description?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reservationId?: string;
}

export type SportType = 'futbol' | 'paddle' | 'tenis' | 'golf';