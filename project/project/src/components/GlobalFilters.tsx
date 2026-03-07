import { useState } from 'react';
import { Filter, Download, Share2, RotateCcw, Calendar, Mail, X } from 'lucide-react';
import type { FilterState } from '../types';

type GlobalFiltersProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExport: (format: 'pdf' | 'ppt') => void;
  onReset: () => void;
};

export default function GlobalFilters({ filters, onFilterChange, onExport, onReset }: GlobalFiltersProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeFilters: true,
    includeExecutiveSummary: true
  });

  const handleExportWithOptions = (format: 'pdf' | 'ppt') => {
    console.log(`Exporting as ${format.toUpperCase()} with options:`, exportOptions);
    onExport(format);
    setShowExportModal(false);
  };

  const handleScheduleEmail = () => {
    alert('Weekly email scheduled successfully!');
    setShowScheduleModal(false);
  };

  const handleShare = () => {
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Global Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={filters.timePeriod}
            onChange={(e) => onFilterChange({ ...filters, timePeriod: e.target.value as FilterState['timePeriod'] })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <select
          value={filters.department}
          onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>

        <select
          value={filters.location}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Locations</option>
          <option value="San Francisco">San Francisco</option>
          <option value="New York">New York</option>
          <option value="London">London</option>
          <option value="Singapore">Singapore</option>
        </select>

        <select
          value={filters.employeeLevel}
          onChange={(e) => onFilterChange({ ...filters, employeeLevel: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="Executive">Executive</option>
          <option value="Manager">Manager</option>
          <option value="Staff">Staff</option>
        </select>

        <select
          value={filters.employmentType}
          onChange={(e) => onFilterChange({ ...filters, employmentType: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Dashboard
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Schedule Email
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Export Dashboard</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include all charts</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFilters}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeFilters: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include filter settings</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeExecutiveSummary}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeExecutiveSummary: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include executive summary</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Export Format:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleExportWithOptions('pdf')}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExportWithOptions('ppt')}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    PowerPoint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Weekly Email</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Day
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleScheduleEmail}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Schedule Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
