import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Upload, X, Save } from 'lucide-react';
import { Service, ServiceCategory, Package as ServicePackage } from '../types';
import { servicesAPI } from '../utils/api';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Stage Decoration' as ServiceCategory,
    description: '',
    price: '',
    image: null as File | null
  });

  const [packageForm, setPackageForm] = useState({
    name: '',
    selectedServices: [] as string[],
    combinedPrice: ''
  });

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      if (response.success) {
        setServices(response.services || []);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await servicesAPI.getCategories();
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    if (editingService) {
      setFormData({
        title: editingService.title,
        category: editingService.category,
        description: editingService.description,
        price: editingService.price.toString(),
        image: null
      });
    }
  }, [editingService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const serviceFormData = new FormData();
      serviceFormData.append('title', formData.title);
      serviceFormData.append('category', formData.category);
      serviceFormData.append('description', formData.description);
      serviceFormData.append('price', formData.price);
      
      if (formData.image) {
        serviceFormData.append('image', formData.image);
      }

      let response;
      if (editingService) {
        response = await servicesAPI.update(editingService._id, serviceFormData);
      } else {
        response = await servicesAPI.create(serviceFormData);
      }

      if (response.success) {
        await loadServices(); // Reload services
        resetForm();
        alert(editingService ? 'Service updated successfully!' : 'Service created successfully!');
      } else {
        alert('Failed to save service. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to save service:', error);
      alert(error.message || 'Failed to save service. Please try again.');
    }

    resetForm();
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageForm.name || packageForm.selectedServices.length === 0 || !packageForm.combinedPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedServiceObjects = services.filter(s => packageForm.selectedServices.includes(s._id));
    const originalPrice = selectedServiceObjects.reduce((sum, service) => sum + service.price, 0);

    const newPackage: ServicePackage = {
      _id: Date.now().toString(),
      name: packageForm.name,
      serviceIds: packageForm.selectedServices,
      services: selectedServiceObjects,
      combinedPrice: parseInt(packageForm.combinedPrice),
      originalPrice,
      managerId: '1',
      createdAt: new Date()
    };

    setPackages(prev => [...prev, newPackage]);
    setPackageForm({ name: '', selectedServices: [], combinedPrice: '' });
    setShowCreatePackage(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Stage Decoration',
      description: '',
      price: '',
      image: null
    });
    setShowAddService(false);
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowAddService(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await servicesAPI.delete(serviceId);
        if (response.success) {
          await loadServices(); // Reload services
          alert('Service deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const handleDeletePackage = (packageId: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setPackages(prev => prev.filter(p => p._id !== packageId));
    }
  };

  const toggleServiceSelection = (serviceId: string) => {
    setPackageForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600">Manage your event services and packages</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreatePackage(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Package size={20} className="mr-2" />
            Create Package
          </button>
          <button
            onClick={() => setShowAddService(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'packages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Packages ({packages.length})
          </button>
        </nav>
      </div>

      {/* Add/Edit Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Premium Wedding Photography"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your service in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Image
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="text-gray-400 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.image && (
                    <p className="text-xs text-green-600 mt-1">{formData.image.name}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Save size={16} className="mr-2" />
                  {editingService ? 'Update' : 'Add'} Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreatePackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Service Package</h2>
              <button
                onClick={() => setShowCreatePackage(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePackage} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Complete Wedding Package"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Services * (Choose at least 2)
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {services.map(service => (
                    <div
                      key={service._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        packageForm.selectedServices.includes(service._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleServiceSelection(service._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-500">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{service.price.toLocaleString('en-IN')}</p>
                          <input
                            type="checkbox"
                            checked={packageForm.selectedServices.includes(service._id)}
                            onChange={() => toggleServiceSelection(service._id)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {packageForm.selectedServices.length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      Selected: {packageForm.selectedServices.length} service(s)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Price (₹) *
                </label>
                <input
                  type="number"
                  value={packageForm.combinedPrice}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, combinedPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="85000"
                  min="0"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePackage(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={packageForm.selectedServices.length < 2}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Package size={16} className="mr-2" />
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {service.image && (
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{service.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    {service.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    ₹{service.price.toLocaleString('en-IN')}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Service"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first service</p>
              <button
                onClick={() => setShowAddService(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Service
              </button>
            </div>
          )}
        </div>
          )}
        </>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {packages.map(pkg => (
            <div key={pkg._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-500">{pkg.services.length} services included</p>
                </div>
                <button
                  onClick={() => handleDeletePackage(pkg._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Package"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {pkg.services.map(service => (
                  <div key={service._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{service.title}</span>
                    <span className="text-sm text-gray-500">₹{service.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Original Price:</span>
                  <span className="text-sm text-gray-500 line-through">₹{pkg.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Package Price:</span>
                  <span className="text-xl font-bold text-green-600">₹{pkg.combinedPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-green-600 font-medium">
                    Save ₹{(pkg.originalPrice - pkg.combinedPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
              <p className="text-gray-600 mb-4">Create your first service package to offer bundled deals</p>
              <button
                onClick={() => setShowCreatePackage(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Package
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Services;