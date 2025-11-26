import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Eye,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { bookingsAPI } from '../utils/api';

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
  notes?: string;
  createdAt: string;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventType: '',
    date: '',
    time: '',
    location: '',
    serviceIds: [] as string[],
    totalAmount: '',
    notes: ''
  });

  React.useEffect(() => {
    loadBookings();
    loadServices();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      if (response.success) {
        setBookings(response.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch('https://eventbackend-ten.vercel.app/api/services', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('eventManager') || '{}').token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (bookingId: string, newStatus: 'Confirmed' | 'Cancelled') => {
    try {
      const response = await bookingsAPI.updateStatus(bookingId, newStatus);
      if (response.success) {
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        );
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.customerName || !bookingForm.customerEmail || !bookingForm.customerPhone || 
        !bookingForm.eventType || !bookingForm.date || !bookingForm.time || 
        !bookingForm.location || bookingForm.serviceIds.length === 0 || !bookingForm.totalAmount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await bookingsAPI.create({
        customerName: bookingForm.customerName,
        customerPhone: bookingForm.customerPhone,
        customerEmail: bookingForm.customerEmail,
        eventType: bookingForm.eventType,
        date: bookingForm.date,
        time: bookingForm.time,
        location: bookingForm.location,
        serviceIds: bookingForm.serviceIds,
        totalAmount: parseFloat(bookingForm.totalAmount),
        notes: bookingForm.notes
      });

      if (response.success) {
        await loadBookings();
        setShowAddBooking(false);
        setBookingForm({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          eventType: '',
          date: '',
          time: '',
          location: '',
          serviceIds: [],
          totalAmount: '',
          notes: ''
        });
        alert('Booking created successfully!');
      }
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    setBookingForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
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

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    completed: bookings.filter(b => b.status === 'Completed').length
  };

  return (
    <div className="p-6 space-y-6 bg-cream-10 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage all your event bookings</p>
        </div>
        <button
          onClick={() => setShowAddBooking(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <Check className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <Check className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="bg-cream-50 rounded-lg shadow-sm border border-cream-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-600"></div>
          </div>
        </div>
      ) : (
      <div className="bg-cream-50 rounded-lg shadow-sm border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cream-600 uppercase tracking-wider">
                  Amount
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
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-cream-100">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-cream-800">{booking.customerName}</div>
                      <div className="text-sm text-cream-600 flex items-center">
                        <Phone size={12} className="mr-1" />
                        {booking.customerPhone}
                      </div>
                      <div className="text-sm text-cream-600 flex items-center">
                        <Mail size={12} className="mr-1" />
                        {booking.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.eventType}</div>
                      <div className="text-sm text-gray-500 flex items-start">
                        <MapPin size={12} className="mr-1 mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">{booking.location}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {booking.serviceIds.length} service(s)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{booking.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'Confirmed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Accept"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'Cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your bookings will appear here once customers start booking your services'
              }
            </p>
          </div>
        )}
      </div>
      )}

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Booking</h2>
              <button
                onClick={() => setShowAddBooking(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.eventType}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Wedding, Birthday, Corporate Event"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Location *
                </label>
                <textarea
                  value={bookingForm.location}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Services * (Choose at least 1)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {services.map(service => (
                    <div
                      key={service._id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        bookingForm.serviceIds.includes(service._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleServiceSelection(service._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{service.title}</h4>
                          <p className="text-xs text-gray-500">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">₹{service.price?.toLocaleString('en-IN')}</p>
                          <input
                            type="checkbox"
                            checked={bookingForm.serviceIds.includes(service._id)}
                            onChange={() => toggleServiceSelection(service._id)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {bookingForm.serviceIds.length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      Selected: {bookingForm.serviceIds.length} service(s)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹) *
                </label>
                <input
                  type="number"
                  value={bookingForm.totalAmount}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBooking(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingForm.serviceIds.length === 0}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedBooking.customerPhone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedBooking.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-medium text-gray-900">{selectedBooking.eventType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedBooking.date).toLocaleDateString('en-IN')} at {selectedBooking.time}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedBooking.location}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Booked Services</h3>
                <div className="space-y-2">
                  {selectedBooking.serviceIds?.map((service, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{service.title || `Service ${index + 1}`}</p>
                        <p className="text-sm text-gray-500">Event Service</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{service.price?.toLocaleString('en-IN') || 0}</p>
                    </div>
                  )) || (
                    <p className="text-gray-500">No services selected</p>
                  )}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">₹{selectedBooking.totalAmount?.toLocaleString('en-IN') || 0}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Special Notes</h3>
                  <p className="text-gray-700">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                {selectedBooking.status === 'Pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking._id, 'Confirmed');
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Check size={16} className="mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking._id, 'Cancelled');
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <X size={16} className="mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;