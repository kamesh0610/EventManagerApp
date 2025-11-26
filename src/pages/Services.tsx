import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Package, Upload, X, Save } from 'lucide-react';
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
    <div className="min-h-screen bg-cream-10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream-800">My Services</h1>
          <p className="text-cream-700">Manage your event services and packages</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreatePackage(true)}
            className="bg-gradient-to-r from-cream-500 to-cream-600 text-white px-4 py-2 rounded-lg hover:from-cream-600 hover:to-cream-700 transition-all duration-300 flex items-center shadow-lg transform hover:scale-105"
          >
            <Package size={20} className="mr-2" />
            Create Package
          </button>
          <button
            onClick={() => setShowAddService(true)}
            className="bg-gradient-to-r from-cream-600 to-cream-700 text-white px-4 py-2 rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 flex items-center shadow-lg transform hover:scale-105"
          >
            <Plus size={20} className="mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream-50/80 backdrop-blur-lg rounded-xl shadow-lg border border-cream-200 p-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
              activeTab === 'services'
                ? 'border-cream-600 text-cream-800'
                : 'border-transparent text-cream-600 hover:text-cream-700 hover:border-cream-300'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
              activeTab === 'packages'
                ? 'border-cream-600 text-cream-800'
                : 'border-transparent text-cream-600 hover:text-cream-700 hover:border-cream-300'
            }`}
          >
            Packages ({packages.length})
          </button>
        </nav>
      </div>

      {/* Add/Edit Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-cream-50/95 backdrop-blur-lg rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cream-800">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={resetForm}
                className="text-cream-600 hover:text-cream-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-cream-800"
                  placeholder="e.g., Premium Wedding Photography"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-cream-800"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-cream-800"
                  rows={3}
                  placeholder="Describe your service in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-cream-800"
                  placeholder="25000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Service Image
                </label>
                <div className="relative border-2 border-dashed border-cream-400 rounded-lg p-4 text-center hover:border-cream-500 transition-colors cursor-pointer bg-cream-100">
                  <Upload className="text-cream-600 mx-auto mb-2" size={24} />
                  <p className="text-sm text-cream-700">Click to upload image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.image && (
                    <p className="text-xs text-cream-600 mt-1">{formData.image.name}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 border border-cream-400 text-cream-700 rounded-lg hover:bg-cream-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cream-600 to-cream-700 text-white rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 flex items-center justify-center shadow-lg"
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
          <div className="bg-cream-50/95 backdrop-blur-lg rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cream-800">Create Service Package</h2>
              <button
                onClick={() => setShowCreatePackage(false)}
                className="text-cream-600 hover:text-cream-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePackage} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-cream-800"
                  placeholder="e.g., Complete Wedding Package"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-800 mb-3">
                  Select Services * (Choose at least 2)
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {services.map(service => (
                    <div
                      key={service._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        packageForm.selectedServices.includes(service._id)
                          ? 'border-cream-600 bg-cream-200'
                          : 'border-cream-300 hover:border-cream-400 bg-cream-100'
                      }`}
                      onClick={() => toggleServiceSelection(service._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-cream-800">{service.title}</h4>
                          <p className="text-sm text-cream-600">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-cream-800">₹{service.price.toLocaleString('en-IN')}</p>
                          <input
                            type="checkbox"
                            checked={packageForm.selectedServices.includes(service._id)}
                            onChange={() => toggleServiceSelection(service._id)}
                            className="mt-1 text-cream-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {packageForm.selectedServices.length > 0 && (
                  <div className="mt-2 p-2 bg-cream-200 rounded">
                    <p className="text-sm text-cream-700">
                      Selected: {packageForm.selectedServices.length} service(s)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-800 mb-1">
                  Package Price (₹) *
                </label>
                <input
                  type="number"
                  value={packageForm.combinedPrice}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, combinedPrice: e.target.value }))}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-cream-800"
                  placeholder="85000"
                  min="0"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePackage(false)}
                  className="flex-1 py-2 px-4 border border-cream-400 text-cream-700 rounded-lg hover:bg-cream-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={packageForm.selectedServices.length < 2}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cream-600 to-cream-700 text-white rounded-lg hover:from-cream-700 hover:to-cream-800 disabled:opacity-50 transition-all duration-300 flex items-center justify-center shadow-lg"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-600"></div>
            </div>
          ) : (
            <div className="bg-cream-50/80 backdrop-blur-lg rounded-xl shadow-lg border border-cream-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service._id} className="bg-gradient-to-br from-cream-600 to-cream-700 rounded-xl shadow-lg border border-cream-300 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    {service.image && (
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">{service.title}</h3>
                        <span className="text-xs bg-cream-200 text-cream-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-cream-100 text-sm mb-4 line-clamp-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">
                          ₹{service.price.toLocaleString('en-IN')}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-2 text-cream-200 hover:bg-cream-500 rounded-lg transition-colors"
                            title="Edit Service"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-2 text-red-300 hover:bg-red-600 rounded-lg transition-colors"
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
                    <Package size={48} className="text-cream-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-cream-800 mb-2">No services yet</h3>
                    <p className="text-cream-700 mb-4">Start by adding your first service</p>
                    <button
                      onClick={() => setShowAddService(true)}
                      className="bg-gradient-to-r from-cream-600 to-cream-700 text-white px-4 py-2 rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 shadow-lg"
                    >
                      Add Service
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="bg-cream-50/80 backdrop-blur-lg rounded-xl shadow-lg border border-cream-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {packages.map(pkg => (
              <div key={pkg._id} className="bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl shadow-lg border border-cream-300 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-cream-800">{pkg.name}</h3>
                    <p className="text-sm text-cream-600">{pkg.services.length} services included</p>
                  </div>
                  <button
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {pkg.services.map(service => (
                    <div key={service._id} className="flex items-center justify-between py-2 px-3 bg-cream-300 rounded-lg">
                      <span className="text-sm font-medium text-cream-800">{service.title}</span>
                      <span className="text-sm text-cream-700">₹{service.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-400 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cream-600">Original Price:</span>
                    <span className="text-sm text-cream-600 line-through">₹{pkg.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-cream-800">Package Price:</span>
                    <span className="text-xl font-bold text-cream-700">₹{pkg.combinedPrice.toLocaleString('en-IN')}</span>
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
                <Package size={48} className="text-cream-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-cream-800 mb-2">No packages yet</h3>
                <p className="text-cream-700 mb-4">Create your first service package to offer bundled deals</p>
                <button
                  onClick={() => setShowCreatePackage(true)}
                  className="bg-gradient-to-r from-cream-600 to-cream-700 text-white px-4 py-2 rounded-lg hover:from-cream-700 hover:to-cream-800 transition-all duration-300 shadow-lg"
                >
                  Create Package
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;