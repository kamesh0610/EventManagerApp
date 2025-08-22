import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User,
  Plus,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { CalendarEvent, Availability, TimeSlot } from '../types';
import { bookingsAPI, availabilityAPI } from '../utils/api';
import AvailabilityModal from '../components/Calendar/AvailabilityModal';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDateForAvailability, setSelectedDateForAvailability] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   loadCalendarData();
  // }, [bookings]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const bookingsResponse = await bookingsAPI.getAll();
      if (bookingsResponse.success) {
        const bookingsData = bookingsResponse.bookings || [];
        setBookings(bookingsData);
        
        // Convert bookings to calendar events
        const calendarEvents: CalendarEvent[] = bookingsData.map((booking: any) => ({
          id: booking._id,
          title: `${booking.eventType} - ${booking.customerName}`,
          date: new Date(booking.date),
          time: booking.time,
          type: 'booking' as const,
          bookingId: booking._id,
          customerName: booking.customerName,
          location: booking.location
        }));
        setEvents(calendarEvents);
      }
      
      // Load availability data
      const availabilityResponse = await availabilityAPI.getAll(
        currentDate.getMonth() + 1, 
        currentDate.getFullYear()
      );
      if (availabilityResponse.success) {
        const availabilityData = availabilityResponse.availability || [];
        setAvailabilities(availabilityData.map((avail: any) => ({
          ...avail,
          date: new Date(avail.date)
        })));
      }
      
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

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
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getAvailabilityForDate = (date: Date) => {
    return availabilities.find(availability => 
      availability.date.toDateString() === date.toDateString()
    );
  };

  const getDateStatus = (date: Date) => {
    const hasBookings = getEventsForDate(date).length > 0;
    const availability = getAvailabilityForDate(date);
    
    if (hasBookings) return 'booked';
    if (availability && availability.status === 'available') return 'available';
    if (availability && availability.status === 'unavailable') return 'unavailable';
    return 'none';
  };

  const getDateColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 border-blue-300';
      case 'available': return 'bg-green-100 border-green-300';
      case 'unavailable': return 'bg-red-100 border-red-300';
      default: return 'bg-white border-gray-200';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleSetAvailability = (date: Date) => {
    setSelectedDateForAvailability(date);
    setShowAvailabilityModal(true);
  };

  const handleSaveAvailability = async (date: Date, isFullDay: boolean, timeSlots: TimeSlot[]) => {
    try {
      const response = await availabilityAPI.set({
        date: date.toISOString(),
        isFullDay,
        status: 'available',
        timeSlots
      });
      
      if (response.success) {
        await loadCalendarData();
        alert('Availability set successfully!');
      }
    } catch (error) {
      console.error('Failed to set availability:', error);
      alert('Failed to set availability. Please try again.');
    }
  };

  const handleBlockDate = async (date: Date) => {
    try {
      const response = await availabilityAPI.set({
        date: date.toISOString(),
        isFullDay: true,
        status: 'unavailable',
        timeSlots: []
      });
      
      if (response.success) {
        await loadCalendarData();
        alert('Date blocked successfully!');
      }
    } catch (error) {
      console.error('Failed to block date:', error);
      alert('Failed to block date. Please try again.');
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const availability = getAvailabilityForDate(date);
      const status = getDateStatus(date);
      const isSelected = selectedDate && isSameDate(date, selectedDate);

      days.push(
        <div
          key={day}
          className={`h-24 border cursor-pointer hover:bg-gray-50 transition-colors relative ${
            getDateColor(status)
          } ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="p-1">
            <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
              isToday(date) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              <span>{day}</span>
              {status === 'available' && <CheckCircle size={12} className="text-green-500" />}
              {status === 'unavailable' && <XCircle size={12} className="text-red-500" />}
              {status === 'booked' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 1).map(event => (
                <div
                  key={event.id}
                  className="text-xs px-1 py-0.5 rounded truncate bg-blue-200 text-blue-800"
                  title={event.title}
                >
                  {event.time}
                </div>
              ))}
              {dayEvents.length > 1 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 1} more
                </div>
              )}
              {availability && !dayEvents.length && (
                <div className="text-xs text-green-600">
                  {availability.isFullDay ? 'Full day' : `${availability.timeSlots.length} slots`}
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
  const selectedDateAvailability = selectedDate ? getAvailabilityForDate(selectedDate) : null;
  const selectedBookings = selectedDateEvents.map(event => 
    bookings.find(booking => booking._id === event.bookingId)
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Availability</h1>
          <p className="text-gray-600">Manage your schedule and availability</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => selectedDate && handleSetAvailability(selectedDate)}
            disabled={!selectedDate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Set Available
          </button>
          <button
            onClick={() => selectedDate && handleBlockDate(selectedDate)}
            disabled={!selectedDate}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <XCircle size={20} className="mr-2" />
            Block Date
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calendar Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Not Set</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Date Details Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate 
              ? selectedDate.toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })
              : 'Select a date'
            }
          </h3>

          {selectedDate ? (
            <div className="space-y-4">
              {/* Availability Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Availability Status</h4>
                {selectedDateAvailability ? (
                  <div className="space-y-2">
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedDateAvailability.status === 'available' ? 'bg-green-100 text-green-800' :
                      selectedDateAvailability.status === 'unavailable' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedDateAvailability.status === 'available' ? 'Available' : 'Unavailable'}
                    </div>
                    {selectedDateAvailability.status === 'available' && (
                      <div className="text-sm text-gray-600">
                        {selectedDateAvailability.isFullDay ? (
                          <p>Full day available</p>
                        ) : (
                          <div>
                            <p className="font-medium">Time Slots:</p>
                            {selectedDateAvailability.timeSlots.map(slot => (
                              <p key={slot.id} className="ml-2">
                                {slot.startTime} - {slot.endTime}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No availability set</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSetAvailability(selectedDate)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Settings size={16} className="mr-2" />
                  Set Availability
                </button>
                <button
                  onClick={() => handleBlockDate(selectedDate)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <XCircle size={16} className="mr-2" />
                  Block Date
                </button>
              </div>

              {/* Bookings */}
              {selectedBookings.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Bookings</h4>
                  <div className="space-y-2">
                    {selectedBookings.map(booking => (
                      <div key={booking._id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{booking.eventType}</h5>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-2" />
                            {booking.time}
                          </div>
                          <div className="flex items-center">
                            <User size={14} className="mr-2" />
                            {booking.customerName}
                          </div>
                          <div className="flex items-start">
                            <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{booking.location}</span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {booking.serviceIds?.length || 0} service(s)
                            </span>
                            <span className="font-semibold text-gray-900 text-sm">
                              ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Click on a date to view details and manage availability</p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        selectedDate={selectedDateForAvailability || new Date()}
        onSave={handleSaveAvailability}
        existingAvailability={selectedDateForAvailability ? getAvailabilityForDate(selectedDateForAvailability) : undefined}
      />
    </div>
  );
};

export default Calendar;