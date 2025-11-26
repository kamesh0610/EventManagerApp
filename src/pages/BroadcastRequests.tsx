import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Check, 
  X,
  Eye,
  Filter
} from 'lucide-react';
import { broadcastAPI } from '../utils/api';

interface BroadcastRequest {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  guestCount: number;
  date: string;
  time: string;
  location: string;
  budget: number;
  requirements: string;
  status: 'Open' | 'Accepted' | 'Expired' | 'Completed';
  acceptedBy?: string;
  distance?: number;
  createdAt: string;
}

const BroadcastRequests: React.FC = () => {
  const [requests, setRequests] = useState<BroadcastRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BroadcastRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadBroadcastRequests();
  }, []);

  const loadBroadcastRequests = async () => {
    try {
      setLoading(true);
      const response = await broadcastAPI.getAll();
      if (response.success) {
        setRequests(response.broadcasts || []);
      }
    } catch (error) {
      console.error('Failed to load broadcast requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status.toLowerCase() === statusFilter;
  });

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await broadcastAPI.accept(requestId);
      if (response.success) {
        setRequests(prev => 
          prev.map(request => 
            request._id === requestId 
              ? { ...request, status: 'Accepted' as const }
              : request
          )
        );
        alert('Broadcast request accepted successfully!');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleIgnoreRequest = (requestId: string) => {
    setRequests(prev => prev.filter(request => request._id !== requestId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDistanceColor = (distance?: number) => {
    if (!distance) return 'text-gray-500';
    if (distance <= 3) return 'text-green-600';
    if (distance <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === 'Open').length,
    accepted: requests.filter(r => r.status === 'Accepted').length,
    completed: requests.filter(r => r.status === 'Completed').length
  };

  return (
    <div className="p-6 bg-cream-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast Requests</h1>
          <p className="text-gray-600">Event requests from customers in your area</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Radio className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Open</p>
              <p className="text-2xl font-bold text-green-600">{stats.open}</p>
            </div>
            <Clock className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
            </div>
            <Check className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            </div>
            <Check className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="open">Open</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-600"></div>
        </div>
      ) : (
      <div className="bg-cream-50 rounded-xl shadow-sm border border-cream-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <div key={request._id} className="bg-white rounded-xl shadow-sm border border-cream-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-cream-800">{request.eventType}</h3>
                <p className="text-sm text-cream-600">{request.customerName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
                {request.distance && (
                  <span className={`text-sm font-medium ${getDistanceColor(request.distance)}`}>
                    {request.distance}km
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-cream-600">
                <Calendar size={16} className="mr-2" />
                {new Date(request.date).toLocaleDateString('en-IN')} at {request.time}
              </div>
              <div className="flex items-center text-sm text-cream-600">
                <MapPin size={16} className="mr-2" />
                {request.location}
              </div>
              <div className="flex items-center text-sm text-cream-600">
                <Users size={16} className="mr-2" />
                {request.guestCount} guests
              </div>
              <div className="flex items-center text-sm text-cream-600">
                <DollarSign size={16} className="mr-2" />
                Budget: ₹{request.budget.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-cream-700 line-clamp-3">{request.requirements}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-cream-200">
              <button
                onClick={() => setSelectedRequest(request)}
                className="flex items-center text-cream-600 hover:text-cream-700 transition-colors"
              >
                <Eye size={16} className="mr-1" />
                View Details
              </button>
              
              {request.status === 'Open' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Check size={14} className="mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleIgnoreRequest(request._id)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <X size={14} className="mr-1" />
                    Ignore
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
      )}

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Radio size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">
            {statusFilter !== 'all' 
              ? 'No requests match the selected filter'
              : 'New broadcast requests from customers will appear here'
            }
          </p>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className=" bg-cream-10 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-cream-10 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
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
                    <p className="font-medium text-gray-900">{selectedRequest.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedRequest.customerPhone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedRequest.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-medium text-gray-900">{selectedRequest.eventType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guest Count</p>
                    <p className="font-medium text-gray-900">{selectedRequest.guestCount} guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRequest.date).toLocaleDateString('en-IN')} at {selectedRequest.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium text-gray-900">₹{selectedRequest.budget.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedRequest.location}</p>
                    {selectedRequest.distance && (
                      <p className={`text-sm font-medium ${getDistanceColor(selectedRequest.distance)}`}>
                        {selectedRequest.distance}km from your location
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-700">{selectedRequest.requirements}</p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                {selectedRequest.status === 'Open' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleAcceptRequest(selectedRequest._id);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Check size={16} className="mr-2" />
                      Accept Request
                    </button>
                    <button
                      onClick={() => {
                        handleIgnoreRequest(selectedRequest._id);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <X size={16} className="mr-2" />
                      Ignore
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

export default BroadcastRequests;