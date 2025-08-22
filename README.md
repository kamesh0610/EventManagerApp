# EventPro - Event Manager Dashboard

A comprehensive event management system with authentication, KYC verification, and complete booking management.

## 🚀 Features

### 🔐 Authentication & KYC
- **Multi-method Authentication**: Email and phone login/signup
- **KYC Verification**: Aadhar card upload (front & back) with status tracking
- **Access Control**: Restricted access until KYC verification is complete
- **Status Management**: Pending/Verified/Rejected status tracking

### 📋 Dashboard & Profile
- **Professional Dashboard**: Clean sidebar navigation and top navbar
- **Profile Management**: Photo, name, verification badge display
- **Analytics**: Total bookings, upcoming events, pending requests
- **Quick Actions**: Add service, update availability, view schedule

### 🛠 Service Management
- **Complete CRUD**: Add, edit, delete services with image upload
- **20+ Categories**: Stage decoration, photography, DJ, catering, etc.
- **Bundle Packages**: Combine multiple services with discounted pricing
- **Service Categories**: All event service types supported

### 📦 Booking Management
- **Full Lifecycle**: Pending → Confirmed → Completed/Cancelled
- **Customer Details**: Name, phone, email, event requirements
- **Service Integration**: Link bookings to specific services
- **Status Tracking**: Accept/reject functionality with notifications

### 📡 Broadcast Request System
- **Location-based**: Requests within 10km radius
- **Detailed Requirements**: Event type, guest count, budget, location
- **Accept/Ignore**: Simple workflow for lead management
- **Auto-conversion**: Accepted requests become bookings

### 🗓 Calendar & Availability
- **Visual Calendar**: Monthly view with color-coded status
- **Availability Management**: Set available/unavailable dates and time slots
- **Conflict Prevention**: Auto-check availability before booking
- **Status Indicators**: 
  - 🟢 Green: Available
  - 🔴 Red: Unavailable  
  - 🔵 Blue: Booked
- **Time Slot Management**: Full day or specific time ranges
- **Quick Controls**: Set availability, block dates, free up slots

### ⚙️ Settings & Profile
- **Profile Updates**: Edit personal information
- **KYC Management**: Upload/re-upload documents
- **Security**: Password change functionality
- **Account Management**: Logout and session control

## 🎨 Design Excellence

- **Apple-level Aesthetics**: Clean, professional interface
- **Responsive Design**: Optimized for desktop and mobile
- **Modern UI**: Card-based layouts with subtle shadows
- **Interactive Elements**: Smooth animations and hover effects
- **Color System**: Comprehensive palette with proper contrast
- **Micro-interactions**: Enhanced user experience

## 🗄️ Database Integration

### MongoDB Atlas Ready
The application is prepared for MongoDB Atlas integration with:

- **Connection Configuration**: Pre-configured for MongoDB Atlas
- **Schema Definitions**: Complete data models for all entities
- **Collection Structure**: Organized collections for scalability

### Collections:
- `eventManagers`: User profiles and KYC data
- `services`: Service offerings and categories
- `packages`: Bundled service packages
- `bookings`: Customer bookings and status
- `broadcastRequests`: Customer event requests
- `availability`: Manager availability and time slots

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Installation
```bash
# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Setup environment variables
cp .env.example .env
# Update .env with your MongoDB Atlas connection string

# Start development server
npm run dev

# Start backend server (in another terminal)
npm run server
```

### MongoDB Atlas Setup
1. **Create MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create a Cluster**: Set up a free cluster
3. **Create Database User**: Add a user with read/write permissions
4. **Get Connection String**: Copy your connection string
5. **Update Environment**: Add to `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventpro?retryWrites=true&w=majority
   ```

### Environment Variables
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventpro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🔧 **Backend API Endpoints**

### Authentication
- `POST /api/auth/register` - Register new event manager
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/phone-login` - Login with phone/OTP
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/upload-kyc` - Upload KYC documents

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-photo` - Upload profile photo

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/categories/list` - Get service categories

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/stats/dashboard` - Get booking statistics

### Broadcast Requests
- `GET /api/broadcasts` - Get broadcast requests
- `POST /api/broadcasts` - Create broadcast request
- `PUT /api/broadcasts/:id/accept` - Accept broadcast request
- `GET /api/broadcasts/my/accepted` - Get accepted requests

### Availability Management
- `GET /api/availability` - Get availability
- `POST /api/availability` - Set availability
- `PUT /api/availability/:id` - Update availability
- `GET /api/availability/calendar/:month/:year` - Get calendar data
- `POST /api/availability/check` - Check availability

## 📱 Usage

### For Event Managers:
1. **Sign up** with email or phone
2. **Complete KYC** by uploading Aadhar card
3. **Add services** in various categories
4. **Set availability** using the calendar
5. **Manage bookings** from customers
6. **Accept broadcast requests** for new leads

### Key Workflows:
- **Service Creation**: Add → Categorize → Price → Upload Image
- **Availability Management**: Calendar → Select Date → Set Time Slots
- **Booking Process**: Request → Review → Accept/Reject → Confirm
- **Package Creation**: Select Services → Set Combined Price → Save

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Database**: MongoDB Atlas (ready)
- **Authentication**: Firebase Auth (simulated)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ | Email/Phone login & signup |
| KYC Verification | ✅ | Aadhar upload & status tracking |
| Service Management | ✅ | CRUD operations with categories |
| Booking System | ✅ | Full lifecycle management |
| Calendar Integration | ✅ | Availability & conflict management |
| Broadcast Requests | ✅ | Location-based lead system |
| Package Creation | ✅ | Bundle services with pricing |
| Profile Management | ✅ | Settings & account control |
| Responsive Design | ✅ | Mobile & desktop optimized |
| MongoDB Ready | ✅ | Schema & connection configured |

## 🎯 Production Ready

This application is built with production standards:
- **Scalable Architecture**: Modular component structure
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized rendering and state management
- **Security**: Input validation and secure practices
- **Accessibility**: WCAG compliant design
- **SEO Ready**: Proper meta tags and structure

## 📞 Support

For technical support or feature requests, please refer to the documentation or contact the development team.

---

**EventPro** - Empowering event managers with professional tools for business growth.