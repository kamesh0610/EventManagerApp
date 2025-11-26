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
  XCircle,
  CalendarDays
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
  const [error, setError] = useState('');

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError('');
      
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
      
    } catch (error: any) {
      console.error('Failed to load calendar data:', error);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    if (hasBookings) return 'booked';
    if (availability && availability.weekendAvailability && isWeekend && 
        ((availability.weekendAvailability.saturday && date.getDay() === 6) ||
         (availability.weekendAvailability.sunday && date.getDay() === 0))) return 'weekend-only';
    if (availability && availability.status === 'available') return 'available';
    if (availability && availability.status === 'unavailable') return 'unavailable';
    return 'none';
  };

  const getDateColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-cream-400 border-cream-500 text-white';
      case 'available': return 'bg-cream-200 border-cream-300 text-cream-800';
      case 'weekend-only': return 'bg-purple-200 border-purple-300 text-purple-800';
      case 'unavailable': return 'bg-red-200 border-red-300 text-red-800';
      default: return 'bg-cream-100 border-cream-200 text-cream-700';
    }
  };

  const handleSetWeekendAvailability = async (date: Date) => {
    // Check if it's the 1st day of the month
    if (date.getDate() === 1) {
      alert('❌ Cannot set availability for the 1st day of the month. Please choose another date.');
      return;
    }

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (!isWeekend) {
      alert('❌ Weekend availability can only be set for Saturday or Sunday.');
      return;
    }

    try {
      const weekendAvailability = {
        saturday: date.getDay() === 6,
        sunday: date.getDay() === 0
      };

      const response = await availabilityAPI.set({
        date: date.toISOString(),
        isFullDay: true,
        status: 'available',
        weekendAvailability,
        timeSlots: []
      });
      
      if (response.success) {
        await loadCalendarData();
        alert('Weekend availability set successfully!');
      }
    } catch (error) {
      console.error('Failed to set weekend availability:', error);
      alert('Failed to set weekend availability. Please try again.');
    }
  };

  const handleSetMonthWeekendAvailability = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(currentDate);
      
      const weekendDates = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isFirstDay = date.getDate() === 1;
        
        if (isWeekend && !isFirstDay) {
          weekendDates.push(date);
        }
      }
      
      if (weekendDates.length === 0) {
        alert('No weekend dates available to set in this month.');
        return;
      }
      
      const confirmMessage = `Set weekend availability for all ${weekendDates.length} weekend dates in ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?\n\nTime: 00:00 to 23:59`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      for (const date of weekendDates) {
        const weekendAvailability = {
          saturday: date.getDay() === 6,
          sunday: date.getDay() === 0
        };
        
        await availabilityAPI.set({
          date: date.toISOString(),
          isFullDay: true,
          status: 'available',
          weekendAvailability,
          timeSlots: [{
            id: '1',
            startTime: '00:00',
            endTime: '23:59',
            status: 'available'
          }]
        });
      }
      
      await loadCalendarData();
      alert(`Weekend availability set for all ${weekendDates.length} weekend dates!`);
      
    } catch (error) {
      console.error('Failed to set month weekend availability:', error);
      alert('Failed to set weekend availability. Please try again.');
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

  const handleSaveAvailability = async (date: Date, isFullDay: boolean, timeSlots: TimeSlot[], weekendAvailability?: any) => {
    // Check if it's the 1st day of the month
    if (date.getDate() === 1) {
      alert('❌ Cannot set availability for the 1st day of the month. Please choose another date.');
      return;
    }

    try {
      const response = await availabilityAPI.set({
        date: date.toISOString(),
        isFullDay,
        status: 'available',
        timeSlots,
        weekendAvailability: weekendAvailability || {
          saturday: date.getDay() === 6,
          sunday: date.getDay() === 0
        }
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
    // Check if it's the 1st day of the month
    if (date.getDate() === 1) {
      alert('❌ Cannot block the 1st day of the month. Please choose another date.');
      return;
    }

    try {
      const response = await availabilityAPI.set({
        date: date.toISOString(),
        isFullDay: true,
        status: 'unavailable',
        timeSlots: [],
        weekendAvailability: {
          saturday: false,
          sunday: false
        }
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
      days.push(<div key={`empty-${i}`} className="h-24 border border-cream-300"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const availability = getAvailabilityForDate(date);
      const status = getDateStatus(date);
      const isSelected = selectedDate && isSameDate(date, selectedDate);
      const isFirstDay = date.getDate() === 1;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push(
        <div
          key={day}
          className={`h-24 border transition-colors relative ${
            isFirstDay ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-cream-100'
          } ${
            isFirstDay ? 'bg-gray-200 border-gray-400' : getDateColor(status)
          } ${isSelected ? 'ring-2 ring-cream-600' : ''}`}
          onClick={() => !isFirstDay && setSelectedDate(date)}
        >
          <div className="p-1">
            <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
              isToday(date) ? 'text-cream-800 font-bold' : ''
            } ${isFirstDay ? 'text-gray-500' : ''}`}>
              <span>{day}</span>
              {isFirstDay && <span className="text-xs text-gray-500">🚫</span>}
              {isWeekend && !isFirstDay && <span className="text-xs text-purple-600">📅</span>}
              {status === 'available' && <CheckCircle size={12} className="text-green-600" />}
              {status === 'unavailable' && <XCircle size={12} className="text-red-600" />}
              {status === 'booked' && <div className="w-2 h-2 bg-cream-800 rounded-full"></div>}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 1).map(event => (
                <div
                  key={event.id}
                  className="text-xs px-1 py-0.5 rounded truncate bg-cream-600 text-white"
                  title={event.title}
                >
                  {event.time}
                </div>
              ))}
              {dayEvents.length > 1 && (
                <div className="text-xs text-cream-700">
                  +{dayEvents.length - 1} more
                </div>
              )}
              {availability && !dayEvents.length && (
                <div className="text-xs text-green-700">
                  {availability.isFullDay ? 'Full day' : `${availability.timeSlots?.length || 0} slots`}
                </div>
              )}
              {isFirstDay && (
                <div className="text-xs text-gray-500">
                  Blocked
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
      <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300 p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-center">
            <XCircle className="text-red-500 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Calendar</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={loadCalendarData}
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

  return (
    <div className="min-h-screen bg-cream-10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream-800">Calendar & Availability</h1>
          <p className="text-cream-700">Manage your schedule and availability</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => selectedDate && handleSetAvailability(selectedDate)}
            disabled={!selectedDate || (selectedDate && selectedDate.getDate() === 1)}
            className="bg-gradient-to-r from-cream-600 to-cream-700 text-white px-4 py-2 rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 disabled:opacity-50 flex items-center shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Set Available
          </button>
          <button
            onClick={() => selectedDate && handleSetWeekendAvailability(selectedDate)}
            disabled={!selectedDate || (selectedDate && selectedDate.getDate() === 1)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 flex items-center shadow-lg"
          >
            <CalendarIcon size={20} className="mr-2" />
            Weekend Only
          </button>
          <button
            onClick={handleSetMonthWeekendAvailability}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 flex items-center shadow-lg"
          >
            <CalendarDays size={20} className="mr-2" />
            Set All Weekends
          </button>
          <button
            onClick={() => selectedDate && handleBlockDate(selectedDate)}
            disabled={!selectedDate || (selectedDate && selectedDate.getDate() === 1)}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 flex items-center shadow-lg"
          >
            <XCircle size={20} className="mr-2" />
            Block Date
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-cream-50/80 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-cream-200">
        <h3 className="text-sm font-medium text-cream-800 mb-3">Calendar Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cream-200 border border-cream-300 rounded mr-2"></div>
            <span className="text-cream-700">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cream-400 border border-cream-500 rounded mr-2"></div>
            <span className="text-cream-700">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 border border-red-300 rounded mr-2"></div>
            <span className="text-cream-700">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cream-100 border border-cream-200 rounded mr-2"></div>
            <span className="text-cream-700">Not Set</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2"></div>
            <span className="text-cream-700">1st Day (Blocked)</span>
          </div>
          <div className="flex items-center">
            <span className="text-purple-600 mr-2">📅</span>
            <span className="text-cream-700">Weekend</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-200 border border-purple-300 rounded mr-2"></div>
            <span className="text-cream-700">Weekend Only</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-cream-50/80 backdrop-blur-lg rounded-xl shadow-lg border border-cream-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-cream-300">
            <h2 className="text-lg font-semibold text-cream-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-cream-700" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm bg-gradient-to-r from-cream-600 to-cream-700 text-white rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 shadow-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-cream-700" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-cream-700">
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
        <div className="bg-cream-50/80 backdrop-blur-lg rounded-xl shadow-lg border border-cream-200 p-4">
          <h3 className="text-lg font-semibold text-cream-800 mb-4">
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
              <div className="p-3 bg-cream-200 rounded-lg">
                <h4 className="font-medium text-cream-800 mb-2">Availability Status</h4>
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
                      <div className="text-sm text-cream-700">
                        {selectedDateAvailability.isFullDay ? (
                          <p>Full day available</p>
                        ) : (
                          <div>
                            <p className="font-medium">Time Slots:</p>
                            {selectedDateAvailability.timeSlots?.map(slot => (
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
                  <p className="text-sm text-cream-700">No availability set</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSetAvailability(selectedDate)}
                  disabled={selectedDate.getDate() === 1}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-cream-600 to-cream-700 text-white rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 text-sm disabled:opacity-50 shadow-lg"
                >
                  <Settings size={16} className="mr-2" />
                  Set Availability
                </button>
                <button
                  onClick={() => handleSetWeekendAvailability(selectedDate)}
                  disabled={selectedDate.getDate() === 1}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-sm disabled:opacity-50 shadow-lg"
                >
                  <CalendarIcon size={16} className="mr-2" />
                  Weekend Only
                </button>
                <button
                  onClick={() => handleBlockDate(selectedDate)}
                  disabled={selectedDate.getDate() === 1}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 text-sm disabled:opacity-50 shadow-lg"
                >
                  <XCircle size={16} className="mr-2" />
                  Block Date
                </button>
              </div>

              {/* Bookings */}
              {selectedBookings.length > 0 && (
                <div>
                  <h4 className="font-medium text-cream-800 mb-2">Bookings</h4>
                  <div className="space-y-2">
                    {selectedBookings.map(booking => (
                      <div key={booking._id} className="p-3 border border-cream-300 rounded-lg bg-cream-100">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-cream-800">{booking.eventType}</h5>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-cream-700">
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

                        <div className="mt-2 pt-2 border-t border-cream-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-cream-600">
                              {booking.serviceIds?.length || 0} service(s)
                            </span>
                            <span className="font-semibold text-cream-800 text-sm">
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
              <CalendarIcon size={48} className="text-cream-600 mx-auto mb-4" />
              <p className="text-cream-700">Click on a date to view details and manage availability</p>
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