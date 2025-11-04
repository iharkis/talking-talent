import { useState, useEffect, useMemo } from 'react';
import { businessAnalystService } from '../services/businessAnalystService';
import { BusinessAnalyst, BALevel, CreateBARequest } from '../types';
import { cn } from '../utils/cn';
import { formatDate, formatDateForInput } from '../utils/date';
import { Edit, Trash2, Users, Search } from 'lucide-react';

export function BAManagement() {
  const [businessAnalysts, setBusinessAnalysts] = useState<BusinessAnalyst[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBA, setEditingBA] = useState<BusinessAnalyst | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<BALevel | 'ALL'>('ALL');
  const [lineManagerFilter, setLineManagerFilter] = useState<'ALL' | string>('ALL');

  useEffect(() => {
    loadBusinessAnalysts();
  }, []);

  const loadBusinessAnalysts = () => {
    setBusinessAnalysts(businessAnalystService.getAll());
  };

  // Memoized function to get reporting tree
  const getReportsTree = useMemo(() => {
    const buildTree = (managerId: string): string[] => {
      const directReports = businessAnalysts.filter(ba => ba.lineManagerId === managerId).map(ba => ba.id);
      const indirectReports = directReports.flatMap(reportId => buildTree(reportId));
      return [...directReports, ...indirectReports];
    };
    return buildTree;
  }, [businessAnalysts]);

  const filteredBAs = useMemo(() => {
    return businessAnalysts.filter(ba => {
      const matchesSearch = 
        ba.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ba.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ba.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ba.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'ALL' || ba.level === levelFilter;
      
      const matchesLineManager = lineManagerFilter === 'ALL' || 
        (lineManagerFilter === ba.lineManagerId) ||
        (getReportsTree(lineManagerFilter).includes(ba.id));
      
      return matchesSearch && matchesLevel && matchesLineManager && ba.isActive;
    });
  }, [businessAnalysts, searchTerm, levelFilter, lineManagerFilter, getReportsTree]);

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
    if (confirm('Are you sure you want to deactivate this Consultant?')) {
      businessAnalystService.deactivate(id);
      loadBusinessAnalysts();
    }
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'None';
    const manager = businessAnalysts.find(ba => ba.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';
  };

  // Get all unique line managers for the filter dropdown
  const lineManagers = useMemo(() => {
    const managerIds = [...new Set(businessAnalysts
      .map(ba => ba.lineManagerId)
      .filter(id => id !== undefined))];
    
    return managerIds.map(id => {
      const manager = businessAnalysts.find(ba => ba.id === id);
      return {
        id: id!,
        name: manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown'
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [businessAnalysts]);

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
        <div>
          <h1 className="text-3xl font-semibold text-hippo-dark-text">Consultants</h1>
          <p className="mt-2 text-hippo-dark-text/70">
            Manage your team of consultants
          </p>
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
            <div>
              <select
                value={lineManagerFilter}
                onChange={(e) => setLineManagerFilter(e.target.value)}
                className="px-4 py-3 border border-hippo-light-gray rounded-hippo focus:ring-2 focus:ring-hippo-teal focus:border-hippo-teal transition-all duration-400"
              >
                <option value="ALL">All Line Managers</option>
                {lineManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name} (& their reports)</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-hippo-dark-text/70 font-medium">
            <Users className="h-4 w-4 mr-2" />
            Showing {filteredBAs.length} of {businessAnalysts.filter(ba => ba.isActive).length} active consultants
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
                  Employee No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Profession
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-hippo-dark-text tracking-wide">
                  Line Manager
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
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-hippo-dark-text">
                    {ba.employeeNo || '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-hippo-dark-text">
                    {ba.profession || '-'}
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No consultants found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || levelFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first consultant.'
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
    employeeNo: ba?.employeeNo || '',
    profession: ba?.profession || '',
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
            {ba ? 'Edit Consultant' : 'Add Consultant'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee No</label>
              <input
                type="text"
                value={formData.employeeNo}
                onChange={(e) => setFormData({...formData, employeeNo: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profession</label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
            {ba ? 'Update' : 'Add'} Consultant
          </button>
        </div>
      </div>
    </div>
  );
}