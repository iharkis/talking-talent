import { useState } from 'react';
import { dataExportService } from '../services/dataExportService';
import { createSampleData } from '../utils/sampleData';
import { STORAGE_KEYS } from '../utils/storage';
import { Settings as SettingsIcon, Download, Upload, Database, Trash2, AlertTriangle } from 'lucide-react';

export function Settings() {
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    try {
      const result = dataExportService.exportAll();
      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setMessage({ type: 'success', text: 'Data exported successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Export failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed' });
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Please paste data to import' });
      return;
    }

    try {
      const result = dataExportService.importData(importData);
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully imported ${result.imported} items` 
        });
        setImportData('');
        window.location.reload();
      } else {
        setMessage({ 
          type: 'error', 
          text: `Import failed: ${result.errors.join(', ')}` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed - invalid data format' });
    }
  };

  const handleCreateSampleData = () => {
    const result = createSampleData();
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        setMessage({ type: 'success', text: 'All data cleared successfully' });
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to clear data' });
      }
    }
  };

  const getStorageSize = () => {
    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      });
      return `${(totalSize / 1024).toFixed(1)} KB`;
    } catch {
      return 'Unknown';
    }
  };

  const getDataCounts = () => {
    try {
      const bas = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESS_ANALYSTS) || '[]');
      const rounds = JSON.parse(localStorage.getItem(STORAGE_KEYS.TALENT_ROUNDS) || '[]');
      const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      
      return {
        businessAnalysts: bas.length,
        rounds: rounds.length,
        reviews: reviews.length
      };
    } catch {
      return { businessAnalysts: 0, rounds: 0, reviews: 0 };
    }
  };

  const dataCounts = getDataCounts();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your application data and preferences
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{dataCounts.businessAnalysts}</div>
                <div className="text-sm text-gray-600">Business Analysts</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{dataCounts.rounds}</div>
                <div className="text-sm text-gray-600">Talent Rounds</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{dataCounts.reviews}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{getStorageSize()}</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Data Export
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Export all your data as a JSON file for backup or transfer to another system.
            </p>
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Data Import
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Import data from a previously exported JSON file. This will replace existing data.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste JSON Data
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your exported JSON data here..."
                />
              </div>
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Sample Data
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Create sample business analysts and a talent round to get started quickly. 
              This is useful for testing or demonstrations.
            </p>
            <button
              onClick={handleCreateSampleData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Database className="h-4 w-4 mr-2" />
              Create Sample Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Clear all application data. This action cannot be undone and will remove all 
              business analysts, talent rounds, and reviews.
            </p>
            <button
              onClick={handleClearAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}