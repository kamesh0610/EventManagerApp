import React, { useState } from 'react';
import { X, Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import { TimeSlot } from '../../types';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSave: (date: Date, isFullDay: boolean, timeSlots: TimeSlot[]) => void;
  existingAvailability?: {
    isFullDay: boolean;
    timeSlots: TimeSlot[];
  };
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSave,
  existingAvailability
}) => {
  const [isFullDay, setIsFullDay] = useState(existingAvailability?.isFullDay || false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    existingAvailability?.timeSlots || [
      {
        id: '1',
        startTime: '09:00',
        endTime: '17:00',
        status: 'available'
      }
    ]
  );

  if (!isOpen) return null;

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '17:00',
      status: 'available'
    };
    setTimeSlots(prev => [...prev, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = () => {
    onSave(selectedDate, isFullDay, timeSlots);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Set Availability</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="text-blue-600 mr-3" size={20} />
              <span className="font-medium text-gray-900">
                {selectedDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="fullDay"
                checked={isFullDay}
                onChange={(e) => setIsFullDay(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="fullDay" className="text-sm font-medium text-gray-700">
                Available full day
              </label>
            </div>

            {!isFullDay && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Time Slots</h3>
                  <button
                    onClick={addTimeSlot}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Slot
                  </button>
                </div>

                {timeSlots.map((slot, index) => (
                  <div key={slot.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <Clock size={16} className="text-gray-400" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {timeSlots.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(slot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;