export interface EventManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  aadharStatus: 'Pending' | 'Verified' | 'Rejected';
  aadharNumber?: string;
  aadharFront?: string;
  aadharBack?: string;
  verifiedName?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
}

export interface Service {
  _id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  price: number;
  image?: string;
  managerId: string;
  createdAt: Date;
}

export type ServiceCategory = 
  | 'Stage Decoration'
  | 'Balloon Decoration'
  | 'Floral Arrangement'
  | 'Makeup Services'
  | 'Welcome Hosts'
  | 'Photography & Videography'
  | 'Live Streaming'
  | 'DJ Services'
  | 'Live Music Performers'
  | 'Traditional Artists'
  | 'Kids Entertainment'
  | 'Anchors / Emcees'
  | 'Mehndi (Henna)'
  | 'Grooming & Spa'
  | 'Return Gifts'
  | 'Invitation & Sign Boards'
  | 'Food Stalls / Add-ons'
  | 'Tent & Furniture Rental'
  | 'Helpers & Crew'
  | 'Grand Entry Setup';

export interface Package {
  _id: string;
  name: string;
  serviceIds: string[];
  services: Service[];
  combinedPrice: number;
  originalPrice: number;
  managerId: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  date: Date;
  time: string;
  location: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  managerId: string;
  serviceIds: string[];
  services: Service[];
  totalAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface BroadcastRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  guestCount: number;
  date: Date;
  time: string;
  location: string;
  budget: number;
  requirements: string;
  status: 'Open' | 'Accepted' | 'Expired' | 'Completed';
  acceptedBy?: string;
  distance?: number;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'booking' | 'busy' | 'available';
  bookingId?: string;
  customerName?: string;
  location?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  eventType: string;
  date: Date;
  bookingId: string;
}

export interface OrderCalendarEvent {
  id: string;
  title: string;
  customer: string;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
  amount: number;
  type: 'booking' | 'consultation';
}

export interface CompletedOrder {
  id: string;
  customerName: string;
  eventType: string;
  completedDate: Date;
  amount: number;
  services: string[];
  rating: number;
  duration: string;
}

export interface Availability {
  sunday: boolean;
  saturday: boolean;
  weekendAvailability: Availability | undefined;
  id: string;
  managerId: string;
  date: Date;
  timeSlots: TimeSlot[];
  isFullDay: boolean;
  status: 'available' | 'unavailable' | 'booked';
  createdAt: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'unavailable' | 'booked';
  bookingId?: string;
}