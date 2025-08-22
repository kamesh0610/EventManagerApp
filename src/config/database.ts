// MongoDB Atlas Configuration
// This file sets up the connection to MongoDB Atlas for production use

export const MONGODB_CONFIG = {
  // Replace with your MongoDB Atlas connection string
  CONNECTION_STRING: process.env.MONGODB_URI || 'mongodb+srv://kamesh:kamesh@1906@projectmanager.jnvudre.mongodb.net/?retryWrites=true&w=majority&appName=ProjectManager',
  
  // Database name
  DATABASE_NAME: 'eventpro',
  
  // Collection names
  COLLECTIONS: {
    EVENT_MANAGERS: 'eventManagers',
    SERVICES: 'services',
    PACKAGES: 'packages',
    BOOKINGS: 'bookings',
    BROADCAST_REQUESTS: 'broadcastRequests',
    AVAILABILITY: 'availability'
  }
};

// MongoDB Schema Definitions for reference
export const SCHEMAS = {
  eventManager: {
    _id: 'ObjectId',
    name: 'String',
    email: 'String (unique)',
    phone: 'String',
    photo: 'String (URL)',
    aadharStatus: 'String (Pending/Verified/Rejected)',
    aadharFront: 'String (URL)',
    aadharBack: 'String (URL)',
    location: {
      lat: 'Number',
      lng: 'Number',
      address: 'String'
    },
    createdAt: 'Date',
    updatedAt: 'Date'
  },
  
  service: {
    _id: 'ObjectId',
    title: 'String',
    category: 'String',
    description: 'String',
    price: 'Number',
    image: 'String (URL)',
    managerId: 'ObjectId (ref: eventManagers)',
    isActive: 'Boolean',
    createdAt: 'Date',
    updatedAt: 'Date'
  },
  
  package: {
    _id: 'ObjectId',
    name: 'String',
    serviceIds: '[ObjectId] (ref: services)',
    combinedPrice: 'Number',
    originalPrice: 'Number',
    managerId: 'ObjectId (ref: eventManagers)',
    isActive: 'Boolean',
    createdAt: 'Date',
    updatedAt: 'Date'
  },
  
  booking: {
    _id: 'ObjectId',
    customerName: 'String',
    customerPhone: 'String',
    customerEmail: 'String',
    eventType: 'String',
    date: 'Date',
    time: 'String',
    location: 'String',
    status: 'String (Pending/Confirmed/Cancelled/Completed)',
    managerId: 'ObjectId (ref: eventManagers)',
    serviceIds: '[ObjectId] (ref: services)',
    totalAmount: 'Number',
    notes: 'String',
    createdAt: 'Date',
    updatedAt: 'Date'
  },
  
  broadcastRequest: {
    _id: 'ObjectId',
    customerName: 'String',
    customerPhone: 'String',
    customerEmail: 'String',
    eventType: 'String',
    guestCount: 'Number',
    date: 'Date',
    time: 'String',
    location: 'String',
    budget: 'Number',
    requirements: 'String',
    status: 'String (Open/Accepted/Expired/Completed)',
    acceptedBy: 'ObjectId (ref: eventManagers)',
    distance: 'Number',
    createdAt: 'Date',
    updatedAt: 'Date'
  },
  
  availability: {
    _id: 'ObjectId',
    managerId: 'ObjectId (ref: eventManagers)',
    date: 'Date',
    timeSlots: [{
      startTime: 'String',
      endTime: 'String',
      status: 'String (available/unavailable/booked)',
      bookingId: 'ObjectId (ref: bookings)'
    }],
    isFullDay: 'Boolean',
    status: 'String (available/unavailable/booked)',
    createdAt: 'Date',
    updatedAt: 'Date'
  }
};

// Example MongoDB connection setup (for backend implementation)
/*
import { MongoClient } from 'mongodb';

let client: MongoClient;
let db: any;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_CONFIG.CONNECTION_STRING);
    await client.connect();
    db = client.db(MONGODB_CONFIG.DATABASE_NAME);
  }
  return { client, db };
}

export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}
*/