import { useState } from 'react';
import { Star, TrendingUp, User } from 'lucide-react';
import type { FilterState } from '../types';

type HighPotentialIdentificationProps = {
  filters: FilterState;
};

type TalentEmployee = {
  name: string;
  performance: number;
  potential: number;
  department: string;
  role: string;
};

export default function HighPotentialIdentification({ filters }: HighPotentialIdentificationProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<TalentEmployee | null>(null);

  const employees: TalentEmployee[] = [
    { name: 'Sarah Chen', performance: 4.8, potential: 4.7, department: 'Engineering', role: 'Senior Engineer' },
    { name: 'Marcus Johnson', performance: 4.6, potential: 4.5, department: 'Sales', role: 'Account Executive' },
    { name: 'Emily Rodriguez', performance: 4.9, potential: 4.8, department: 'Product', role: 'Product Manager' },
    { name: 'David Kim', performance: 4.5, potential: 4.3, department: 'Engineering', role: 'Tech Lead' },
    { name: 'Lisa Wang', performance: 4.2, potential: 4.6, department: 'Marketing', role: 'Marketing Manager' },
    { name: 'James Miller', performance: 3.8, potential: 4.4, department: 'Operations', role: 'Operations Lead' },
    { name: 'Anna Kowalski', performance: 4.7, potential: 4.2, department: 'Finance', role: 'Finance Manager' },
    { name: 'Robert Taylor', performance: 3.5, potential: 4.5, department: 'HR', role: 'HR Business Partner' },
    { name: 'Jennifer Lee', performance: 4.4, potential: 3.9, department: 'Engineering', role: 'Software Engineer' },
    { name: 'Michael Brown', performance: 3.9, potential: 4.0, department: 'Sales', role: 'Sales Manager' },
    { name: 'Sofia Garcia', performance: 3.2, potential: 3.8, department: 'Marketing', role: 'Content Specialist' },
    { name: 'Alex Thompson', performance: 3.6, potential: 3.5, department: 'Operations', role: 'Coordinator' },
    { name: 'Nina Patel', performance: 3.3, potential: 3.3, department: 'Support', role: 'Support Lead' },
    { name: 'Chris Anderson', performance: 2.9, potential: 3.2, department: 'Sales', role: 'Sales Rep' },
    { name: 'Maya Sharma', performance: 3.1, potential: 2.8, department: 'Operations', role: 'Analyst' },
  ];

  const getBoxLabel = (performance: number, potential: number): string => {
    if (performance >= 4.5 && potential >= 4.5) return 'Future Leaders';
    if (performance >= 4.5 && potential >= 3.5) return 'Top Performers';
    if (performance >= 4.5) return 'Solid Performers';
    if (potential >= 4.5) return 'High Potential';
    if (performance >= 3.5 && potential >= 3.5) return 'Core Performers';
    if (performance >= 3.5) return 'Reliable';
    if (potential >= 3.5) return 'Growth Area';
    if (performance < 3.5 && potential < 3.5) return 'Development Needed';
    return 'Moderate';
  };

  const getBoxColor = (performance: number, potential: number): string => {
    if (performance >= 4.5 && potential >= 4.5) return '#8B5CF6';
    if (performance >= 4.5 && potential >= 3.5) return '#10B981';
    if (performance >= 4.5) return '#3B82F6';
    if (potential >= 4.5) return '#F59E0B';
    if (performance >= 3.5 && potential >= 3.5) return '#6366F1';
    if (performance >= 3.5) return '#14B8A6';
    if (potential >= 3.5) return '#F59E0B';
    return '#EF4444';
  };

  const futureLeaders = employees.filter(e => e.performance >= 4.5 && e.potential >= 4.5);
  const highPotential = employees.filter(e => e.potential >= 4.5 && e.performance < 4.5);
  const topPerformers = employees.filter(e => e.performance >= 4.5 && e.potential < 4.5 && e.potential >= 3.5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">High Potential Identification</h2>
        <p className="text-gray-600 mt-1">9-Box Talent Matrix for succession planning and development</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">9-Box Talent Matrix</h3>

          <div className="relative">
            <div className="grid grid-cols-3 gap-4 aspect-square">
              {[
                { row: 0, col: 0, label: 'Growth Area', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
                { row: 0, col: 1, label: 'High Potential', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
                { row: 0, col: 2, label: 'Future Leaders', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
                { row: 1, col: 0, label: 'Moderate', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
                { row: 1, col: 1, label: 'Core Performers', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
                { row: 1, col: 2, label: 'Top Performers', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
                { row: 2, col: 0, label: 'Development Needed', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
                { row: 2, col: 1, label: 'Reliable', bgColor: 'bg-teal-100', borderColor: 'border-teal-300' },
                { row: 2, col: 2, label: 'Solid Performers', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
              ].map((box, index) => {
                const boxEmployees = employees.filter(emp => {
                  const perfRange = box.row === 0 ? [2.5, 3.5] : box.row === 1 ? [3.5, 4.5] : [4.5, 5.0];
                  const potRange = box.col === 0 ? [2.5, 3.5] : box.col === 1 ? [3.5, 4.5] : [4.5, 5.0];
                  return emp.performance >= perfRange[0] && emp.performance < perfRange[1] &&
                         emp.potential >= potRange[0] && emp.potential < potRange[1];
                });

                return (
                  <div
                    key={index}
                    className={`${box.bgColor} border-2 ${box.borderColor} rounded-lg p-3 relative overflow-hidden`}
                  >
                    <div className="text-xs font-semibold text-gray-700 mb-2">{box.label}</div>
                    <div className="space-y-1">
                      {boxEmployees.slice(0, 3).map((emp, empIndex) => (
                        <div
                          key={empIndex}
                          onClick={() => setSelectedEmployee(emp)}
                          className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-sm"
                          style={{ borderColor: getBoxColor(emp.performance, emp.potential) }}
                          title={`${emp.name}\nPerf: ${emp.performance.toFixed(1)} | Pot: ${emp.potential.toFixed(1)}`}
                        >
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      ))}
                      {boxEmployees.length > 3 && (
                        <div className="text-xs text-gray-600 font-medium">
                          +{boxEmployees.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-700">
              Performance →
            </div>
            <div className="text-center mt-4 text-sm font-semibold text-gray-700">
              Potential →
            </div>
          </div>

          {selectedEmployee && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">{selectedEmployee.name}</h4>
                  <p className="text-sm text-blue-700">{selectedEmployee.role} • {selectedEmployee.department}</p>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <span className="text-xs text-blue-600">Performance:</span>
                      <span className="ml-1 font-semibold text-blue-900">{selectedEmployee.performance.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-blue-600">Potential:</span>
                      <span className="ml-1 font-semibold text-blue-900">{selectedEmployee.potential.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="mt-2 inline-block px-2 py-1 bg-blue-100 rounded text-xs font-medium text-blue-800">
                    {getBoxLabel(selectedEmployee.performance, selectedEmployee.potential)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-900">Future Leaders</h4>
            </div>
            <div className="text-3xl font-bold text-purple-900">{futureLeaders.length}</div>
            <p className="text-xs text-purple-700 mt-1">High performance + High potential</p>
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-purple-600">Ready for promotion within 12 months</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h4 className="text-sm font-semibold text-orange-900">High Potential</h4>
            </div>
            <div className="text-3xl font-bold text-orange-900">{highPotential.length}</div>
            <p className="text-xs text-orange-700 mt-1">Need development support</p>
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs text-orange-600">Focus on skill building programs</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <h4 className="text-sm font-semibold text-green-900">Top Performers</h4>
            </div>
            <div className="text-3xl font-bold text-green-900">{topPerformers.length}</div>
            <p className="text-xs text-green-700 mt-1">Consistent high achievers</p>
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-green-600">Key retention targets</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Succession Pipeline</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Leadership Ready</span>
                <span className="font-semibold text-gray-900">{futureLeaders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">In Development</span>
                <span className="font-semibold text-gray-900">{highPotential.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pipeline Strength</span>
                <span className="font-semibold text-green-600">Strong</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
