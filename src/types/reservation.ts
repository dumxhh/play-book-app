export interface Reservation {
  id: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_id?: string;
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