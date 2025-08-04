import { useState, useEffect } from 'react';
import { businessAnalystService } from '../services/businessAnalystService';
import { BusinessAnalyst, BALevel, CreateBARequest } from '../types';
import { cn } from '../utils/cn';
import { formatDate, formatDateForInput } from '../utils/date';
import { Plus, Edit, Trash2, Users, Search, Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react';

export function BAManagement() {
  const [businessAnalysts, setBusinessAnalysts] = useState<BusinessAnalyst[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBA, setEditingBA] = useState<BusinessAnalyst | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<BALevel | 'ALL'>('ALL');
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    loadBusinessAnalysts();
  }, []);

  const loadBusinessAnalysts = () => {
    setBusinessAnalysts(businessAnalystService.getAll());
  };

  const filteredBAs = businessAnalysts.filter(ba => {
    const matchesSearch = 
      ba.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ba.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ba.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ba.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' || ba.level === levelFilter;
    
    return matchesSearch && matchesLevel && ba.isActive;
  });

  const handleCreateOrUpdate = (data: CreateBARequest) => {
    try {
      if (editingBA) {
        businessAnalystService.update(editingBA.id, data);
      } else {
        businessAnalystService.create(data);
      }
      loadBusinessAnalysts();
      setShowForm(false);
      setEditingBA(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDeactivate = (id: string) => {
    if (confirm('Are you sure you want to deactivate this Business Analyst?')) {
      businessAnalystService.deactivate(id);
      loadBusinessAnalysts();
    }
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'None';
    const manager = businessAnalysts.find(ba => ba.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';
  };

  const getLevelColor = (level: BALevel) => {
    switch (level) {
      case BALevel.PRINCIPAL: return 'bg-hippo-teal/20 text-hippo-teal border border-hippo-teal/30';
      case BALevel.LEAD: return 'bg-hippo-dark-blue/10 text-hippo-dark-blue border border-hippo-dark-blue/20';
      case BALevel.SENIOR: return 'bg-green-100 text-green-800 border border-green-200';
      case BALevel.INTERMEDIATE: return 'bg-orange-100 text-orange-800 border border-orange-200';
      case BALevel.CONSULTANT: return 'bg-hippo-light-gray/50 text-hippo-dark-text border border-hippo-light-gray';
      default: return 'bg-hippo-light-gray/50 text-hippo-dark-text border border-hippo-light-gray';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-hippo-dark-text">Business Analysts</h1>
            <p className="mt-2 text-hippo-dark-text/70">
              Manage your team of business analysts
            </p>
          </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="bg-hippo-teal text-hippo-white px-6 py-3 rounded-hippo hover:bg-hippo-teal-hover flex items-center font-medium transition-all duration-400 shadow-md hover:shadow-lg"
          >
            <Upload className="h-5 w-5 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-hippo-teal text-hippo-white px-6 py-3 rounded-hippo hover:bg-hippo-teal-hover flex items-center font-medium transition-all duration-400 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Business Analyst
          </button>
        </div>
        </div>
      </div>

      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle">
        <div className="p-6 border-b border-hippo-light-gray/30 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hippo-dark-text/40" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-hippo-light-gray rounded-hippo focus:ring-2 focus:ring-hippo-teal focus:border-hippo-teal transition-all duration-400"
              />
            </div>
            <div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as BALevel | 'ALL')}
                className="px-4 py-3 border border-hippo-light-gray rounded-hippo focus:ring-2 focus:ring-hippo-teal focus:border-hippo-teal transition-all duration-400"
              >
                <option value="ALL">All Levels</option>
                {Object.values(BALevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-hippo-dark-text/70 font-medium">
            <Users className="h-4 w-4 mr-2" />
            Showing {filteredBAs.length} of {businessAnalysts.filter(ba => ba.isActive).length} active business analysts
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hippo-light-gray/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Name & Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Line Manager
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Start Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-hippo-white divide-y divide-hippo-light-gray/30">
              {filteredBAs.map((ba) => (
                <tr key={ba.id} className="hover:bg-hippo-light-gray/20 transition-colors duration-400">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-hippo-dark-text">
                        {ba.firstName} {ba.lastName}
                      </div>
                      {ba.email && (
                        <div className="text-sm text-hippo-dark-text/60">{ba.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex px-3 py-1 text-xs font-semibold rounded-hippo',
                      getLevelColor(ba.level)
                    )}>
                      {ba.level}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-hippo-dark-text font-medium">
                    {getManagerName(ba.lineManagerId)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-hippo-dark-text/80">
                    {ba.department || '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-hippo-dark-text/80">
                    {ba.startDate ? formatDate(ba.startDate) : '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingBA(ba);
                          setShowForm(true);
                        }}
                        className="text-hippo-teal hover:text-hippo-teal-hover p-2 rounded-hippo hover:bg-hippo-teal/10 transition-all duration-400"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(ba.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-hippo hover:bg-red-50 transition-all duration-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBAs.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No business analysts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || levelFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first business analyst.'
              }
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <BAForm
          ba={editingBA}
          managers={businessAnalysts.filter(ba => ba.isActive)}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingBA(null);
          }}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onSuccess={() => {
            loadBusinessAnalysts();
            setShowBulkUpload(false);
          }}
          onCancel={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  );
}

interface BAFormProps {
  ba: BusinessAnalyst | null;
  managers: BusinessAnalyst[];
  onSubmit: (data: CreateBARequest) => void;
  onCancel: () => void;
}

function BAForm({ ba, managers, onSubmit, onCancel }: BAFormProps) {
  const [formData, setFormData] = useState<CreateBARequest>({
    firstName: ba?.firstName || '',
    lastName: ba?.lastName || '',
    email: ba?.email || '',
    level: ba?.level || BALevel.CONSULTANT,
    lineManagerId: ba?.lineManagerId || '',
    department: ba?.department || '',
    startDate: ba?.startDate || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {ba ? 'Edit Business Analyst' : 'Add Business Analyst'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value as BALevel})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(BALevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Line Manager</label>
            <select
              value={formData.lineManagerId}
              onChange={(e) => setFormData({...formData, lineManagerId: e.target.value || undefined})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Line Manager</option>
              {managers.filter(m => m.id !== ba?.id).map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName} ({manager.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData.startDate ? formatDateForInput(formData.startDate) : ''}
              onChange={(e) => setFormData({...formData, startDate: e.target.value ? new Date(e.target.value) : undefined})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            className="btn-hippo-cta text-sm"
          >
            {ba ? 'Update' : 'Add'} Business Analyst
          </button>
        </div>
      </div>
    </div>
  );
}

interface BulkUploadModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function BulkUploadModal({ onSuccess, onCancel }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    created: number;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const csvContent = await file.text();
      const uploadResult = businessAnalystService.bulkCreate(csvContent);
      setResult(uploadResult);
      
      if (uploadResult.success) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        created: 0,
        errors: [error instanceof Error ? error.message : 'Upload failed'],
        warnings: []
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,level,startDate,lineManagerName
Sarah,Jones,sarah.jones@company.com,Lead,2023-10-01,
John,Smith,john.smith@company.com,Senior,2024-01-15,Sarah Jones
Jane,Doe,jane.doe@company.com,Intermediate,2024-02-01,
Mike,Johnson,mike.johnson@company.com,Principal,2023-12-01,Sarah Jones`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ba_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Bulk Upload Business Analysts
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format</h4>
            <p className="text-sm text-gray-600 mb-3">
              Upload a CSV file with the following columns. Required columns are marked with *.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>firstName*</strong> - First name</div>
                <div><strong>lastName*</strong> - Last name</div>
                <div><strong>email</strong> - Email address</div>
                <div><strong>level*</strong> - Principal, Lead, Senior, Intermediate, Consultant</div>
                <div><strong>startDate</strong> - YYYY-MM-DD format</div>
                <div className="col-span-1"><strong>lineManagerName</strong> - Full name of line manager (must exist or be in same file)</div>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Download CSV Template
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {result && (
            <div className={cn(
              'rounded-lg p-4',
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            )}>
              <div className="flex items-center mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <h4 className={cn(
                  'font-medium',
                  result.success ? 'text-green-900' : 'text-red-900'
                )}>
                  {result.success ? 'Upload Successful!' : 'Upload Failed'}
                </h4>
              </div>
              
              <p className={cn(
                'text-sm mb-3',
                result.success ? 'text-green-700' : 'text-red-700'
              )}>
                {result.success 
                  ? `Successfully created ${result.created} business analyst${result.created !== 1 ? 's' : ''}.`
                  : `Failed to upload. ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found.`
                }
              </p>

              {result.errors.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-red-900 mb-1">Errors:</h5>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-yellow-900 mb-1">Warnings:</h5>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            {result?.success ? 'Close' : 'Cancel'}
          </button>
          {!result?.success && (
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg',
                !file || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 text-sm rounded-lg'
                  : 'btn-hippo-cta text-sm'
              )}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}