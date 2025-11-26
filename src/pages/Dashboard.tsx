import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  MapPin,
  Phone,
  Check,
  X,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, reviewsAPI, availabilityAPI } from '../utils/api';
import KYCModal from '../components/KYC/KYCModal';

interface DashboardStats {
  totalBookings: number;
  completedOrders: number;
  totalEarnings: number;
  pendingRequests: number;
  avgRating: number;
  monthlyEarnings: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  revenueGrowth: number;
}

interface MonthlyEarning {
  month: string;
  amount: number;
}

interface OrderCalendarEvent {
  id: string;
  title: string;
  customer: string;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
  amount: number;
  type: 'booking' | 'consultation';
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  eventType: string;
  date: Date;
  bookingId: string;
}

interface Booking {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  totalAmount: number;
  serviceIds: any[];
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [analytics, setAnalytics] = useState<DashboardStats>({
    totalBookings: 0,
    completedOrders: 0,
    totalEarnings: 0,
    pendingRequests: 0,
    avgRating: 0,
    monthlyEarnings: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0
  });

  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [orderCalendar, setOrderCalendar] = useState<OrderCalendarEvent[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Show KYC modal if not verified
    if (user && user.aadharStatus !== 'Verified') {
      setShowKYCModal(true);
    }

    if (user && user.aadharStatus === 'Verified') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all dashboard data
      const [
        bookingsResponse,
        analyticsResponse,
        reviewsResponse,
        calendarResponse
      ] = await Promise.all([
        bookingsAPI.getAll(1, 10),
        bookingsAPI.getAnalytics(),
        reviewsAPI.getAll(1, 4),
        availabilityAPI.getCalendar(currentDate.getMonth() + 1, currentDate.getFullYear())
      ]);

      // Set recent bookings
      if (bookingsResponse.success) {
        setRecentBookings(bookingsResponse.bookings || []);
      }

      // Set analytics
      if (analyticsResponse.success) {
        const data = analyticsResponse.analytics;
        setAnalytics({
          totalBookings: data.monthlyBookings || 0,
          completedOrders: data.completedOrders || 0,
          totalEarnings: data.totalRevenue || 0,
          pendingRequests: data.pendingOrders || 0,
          avgRating: 4.7, // Will be updated from reviews
          monthlyEarnings: data.monthlyRevenue || 0,
          weeklyGrowth: 18.5,
          monthlyGrowth: 12.3,
          revenueGrowth: 24.7
        });

        // Generate monthly earnings data
        const earnings: MonthlyEarning[] = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 6; i++) {
          const monthIndex = (currentDate.getMonth() - 5 + i + 12) % 12;
          earnings.push({
            month: months[monthIndex],
            amount: Math.floor(Math.random() * 200000) + 100000 // Mock data for now
          });
        }
        setMonthlyEarnings(earnings);
      }

      // Set reviews
      if (reviewsResponse.success) {
        const reviewData = reviewsResponse.reviews || [];
        setReviews(reviewData.map((review: any) => ({
          id: review._id,
          customerName: review.customerName,
          rating: review.rating,
          comment: review.comment,
          eventType: review.eventType,
          date: new Date(review.createdAt),
          bookingId: review.bookingId
        })));

        // Update average rating
        if (reviewData.length > 0) {
          const avgRating = reviewData.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewData.length;
          setAnalytics(prev => ({ ...prev, avgRating }));
        }
      }

      // Set calendar events
      if (calendarResponse.success) {
        const events = calendarResponse.events || [];
        setOrderCalendar(events.map((event: any) => ({
          id: event.id,
          title: event.title,
          customer: event.customerName,
          date: new Date(event.date),
          time: event.time,
          status: event.status === 'Confirmed' ? 'confirmed' : 
                 event.status === 'Pending' ? 'pending' : 'completed',
          amount: event.totalAmount || 0,
          type: 'booking'
        })));
      }

    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.updateStatus(bookingId, 'Confirmed');
      setRecentBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'Confirmed' as const }
            : booking
        )
      );
    } catch (error) {
      console.error('Failed to accept booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.updateStatus(bookingId, 'Cancelled');
      setRecentBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'Cancelled' as const }
            : booking
        )
      );
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  if (user?.aadharStatus !== 'Verified') {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
          <div className="flex items-center">
            <Clock className="text-amber-500 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-medium text-amber-800">
                Aadhar Verification Required
              </h3>
              <p className="text-amber-700 mt-1">
                Please complete your Aadhar verification to access all dashboard features.
              </p>
              <button
                onClick={() => setShowKYCModal(true)}
                className="mt-3 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Complete Verification
              </button>
            </div>
          </div>
        </div>

        <KYCModal 
          isOpen={showKYCModal} 
          onClose={() => setShowKYCModal(false)} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-center">
            <X className="text-red-500 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxEarnings = Math.max(...monthlyEarnings.map(d => d.amount));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return orderCalendar.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getDateStatus = (date: Date) => {
    const events = getEventsForDate(date);
    if (events.length === 0) return 'available';
    if (events.some(e => e.status === 'confirmed')) return 'booked';
    return 'pending';
  };

  const getDateColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-white border-gray-200';
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const status = getDateStatus(date);
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`h-20 border cursor-pointer hover:bg-gray-50 transition-colors relative ${
            getDateColor(status)
          } ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="p-1">
            <div className={`text-sm font-medium mb-1 ${
              isToday ? 'text-blue-600 font-bold' : ''
            }`}>
              {day}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className="text-xs px-1 py-0.5 rounded truncate bg-white bg-opacity-70"
                  title={event.title}
                >
                  {event.time}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-600">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="p-6 space-y-6 bg-cream-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream-500">Dashboard</h1>
          <p className="text-cream-400">Welcome back, {user?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-cream-400">Today's Date</p>
          <p className="font-medium text-cream-500">
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-cream-100 p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cream-600">Total Bookings</p>
              <p className="text-2xl font-bold text-cream-800">{analytics.totalBookings}</p>
              <p className="text-xs text-cream-600">This month</p>
            </div>
            <Calendar className="text-cream-500" size={24} />
          </div>
        </div>

        <div className="bg-cream-100 p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cream-600">Completed Orders</p>
              <p className="text-2xl font-bold text-cream-800">{analytics.completedOrders}</p>
              <p className="text-xs text-cream-600">Lifetime</p>
            </div>
            <Check className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-cream-100 p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cream-600">Total Earnings</p>
              <p className="text-2xl font-bold text-cream-800">₹{(analytics.totalEarnings / 1000).toFixed(0)}K</p>
              <div className="flex items-center mt-1">
                <ArrowUp size={12} className="text-green-500 mr-1" />
                <span className="text-xs text-green-600">+{analytics.revenueGrowth}%</span>
              </div>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-cream-100 p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cream-600">Pending Requests</p>
              <p className="text-2xl font-bold text-cream-800">{analytics.pendingRequests}</p>
              <p className="text-xs text-cream-600">Awaiting response</p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-cream-100 p-4 rounded-xl shadow-sm border border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cream-600">Average Rating</p>
              <p className="text-2xl font-bold text-cream-800">{analytics.avgRating.toFixed(1)}</p>
              <div className="flex items-center mt-1">
                {renderStars(Math.floor(analytics.avgRating))}
              </div>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Calendar */}
        <div className="bg-cream-50 rounded-xl shadow-sm border border-cream-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-cream-800">Order Calendar</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-cream-600" />
                </button>
                <span className="text-sm font-medium text-cream-700">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-cream-600" />
                </button>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center space-x-4 mt-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
                <span className="text-cream-600">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-1"></div>
                <span className="text-cream-600">Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-1"></div>
                <span className="text-cream-600">Pending</span>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-cream-600">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && selectedDateEvents.length > 0 && (
            <div className="p-4 border-t border-cream-200">
              <h4 className="font-medium text-cream-800 mb-2">
                Events on {selectedDate.toLocaleDateString('en-IN')}
              </h4>
              <div className="space-y-2">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-cream-100 rounded">
                    <div>
                      <p className="text-sm font-medium text-cream-800">{event.title}</p>
                      <p className="text-xs text-cream-600">{event.customer} • {event.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Earnings Graph */}
        <div className="bg-cream-50 rounded-xl shadow-sm border border-cream-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-cream-800">Monthly Earnings</h3>
            <p className="text-sm text-cream-600">Revenue trend over the last 6 months</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {monthlyEarnings.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-cream-700 w-8">{month.month}</span>
                    <div className="flex-1 bg-cream-200 rounded-full h-3 w-32">
                      <div 
                        className="bg-cream-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(month.amount / maxEarnings) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-cream-800">₹{(month.amount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-cream-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream-600">This Month Total</span>
                <span className="text-lg font-bold text-cream-700">₹{(analytics.monthlyEarnings / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-cream-50 rounded-xl shadow-sm border border-cream-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-cream-800">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-cream-50 divide-y divide-cream-200">
              {recentBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-cream-100">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-cream-800">{booking.eventType}</div>
                    <div className="text-sm text-cream-600">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-cream-800">{booking.customerName}</div>
                    <div className="text-sm text-cream-600">{booking.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-cream-800">
                      {new Date(booking.date).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-sm text-cream-600">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-cream-800 max-w-xs truncate">{booking.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.status === 'Pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptBooking(booking._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="text-cream-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-cream-800 mb-2">No recent orders</h3>
            <p className="text-cream-600">Your recent bookings will appear here</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-cream-50 rounded-xl shadow-sm border border-cream-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cream-800">Latest Customer Reviews</h3>
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="font-medium">{analytics.avgRating.toFixed(1)}</span>
              <span className="text-cream-600 text-sm">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-cream-200 rounded-lg p-4 bg-cream-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-cream-800">{review.customerName}</h4>
                      <p className="text-sm text-cream-600">{review.eventType}</p>
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-cream-700 mb-3 line-clamp-3">{review.comment}</p>
                  
                  <div className="flex items-center justify-between text-xs text-cream-600">
                    <span>{review.date.toLocaleDateString('en-IN')}</span>
                    <span>Order #{review.bookingId}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star size={48} className="text-cream-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-cream-800 mb-2">No reviews yet</h3>
              <p className="text-cream-600">Customer reviews will appear here after completed events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;