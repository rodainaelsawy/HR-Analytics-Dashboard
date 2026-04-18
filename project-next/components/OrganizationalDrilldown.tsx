'use client';

import { useState } from 'react';
import { X, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import type { FilterState } from '../types';

type OrganizationalDrilldownProps = {
  filters: FilterState;
};

type TreemapData = {
  department: string;
  headcount: number;
  attritionRate: number;
};

type TeamData = {
  team: string;
  headcount: number;
  vacancies: number;
  attrition: number;
  avgPerformance: number;
};

export default function OrganizationalDrilldown({ filters }: OrganizationalDrilldownProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);

  const treemapData: TreemapData[] = [
    { department: 'Engineering', headcount: 285, attritionRate: 8.2 },
    { department: 'Sales', headcount: 180, attritionRate: 12.5 },
    { department: 'Marketing', headcount: 95, attritionRate: 7.1 },
    { department: 'Operations', headcount: 145, attritionRate: 9.3 },
    { department: 'Finance', headcount: 72, attritionRate: 5.8 },
    { department: 'HR', headcount: 38, attritionRate: 6.2 },
  ];

  const teamData: TeamData[] = [
    { team: 'Backend Engineering', headcount: 85, vacancies: 5, attrition: 7.2, avgPerformance: 4.1 },
    { team: 'Frontend Engineering', headcount: 65, vacancies: 3, attrition: 8.5, avgPerformance: 4.0 },
    { team: 'DevOps', headcount: 32, vacancies: 2, attrition: 6.8, avgPerformance: 4.2 },
    { team: 'Enterprise Sales', headcount: 95, vacancies: 8, attrition: 14.2, avgPerformance: 3.8 },
    { team: 'SMB Sales', headcount: 55, vacancies: 4, attrition: 11.8, avgPerformance: 3.9 },
    { team: 'Digital Marketing', headcount: 42, vacancies: 2, attrition: 6.5, avgPerformance: 4.0 },
    { team: 'Content Marketing', headcount: 28, vacancies: 1, attrition: 5.2, avgPerformance: 4.1 },
  ];

  const totalHeadcount = treemapData.reduce((sum, d) => sum + d.headcount, 0);

  const getAttritionColor = (rate: number) => {
    if (rate > 12) return 'bg-red-500';
    if (rate > 8) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Organizational Drilldown</h2>
        <p className="text-gray-600 mt-1">Line Manager view of team structure and workforce composition</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Treemap</h3>
        <p className="text-sm text-gray-600 mb-6">Size represents headcount, color indicates attrition rate</p>

        <div className="grid grid-cols-3 gap-3 h-96">
          {treemapData.map((dept, index) => {
            const size = (dept.headcount / totalHeadcount) * 100;
            const colorClass = getAttritionColor(dept.attritionRate);

            return (
              <div
                key={index}
                className={`${colorClass} rounded-lg p-4 flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity ${
                  size > 25 ? 'col-span-2 row-span-2' : size > 15 ? 'col-span-2' : ''
                }`}
                onClick={() => setSelectedDepartment(dept.department)}
              >
                <div>
                  <h4 className="text-white font-bold text-lg">{dept.department}</h4>
                  <p className="text-white text-sm opacity-90 mt-1">{dept.headcount} employees</p>
                </div>
                <div className="text-white">
                  <p className="text-2xl font-bold">{dept.attritionRate}%</p>
                  <p className="text-xs opacity-90">Attrition Rate</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Low (&lt;8%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">Medium (8-12%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">High (&gt;12%)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Team Workforce Table</h3>
          {selectedDepartment && (
            <span className="text-sm text-gray-600">
              Filtered by: <span className="font-medium text-blue-600">{selectedDepartment}</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Headcount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Vacancies</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Attrition</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Performance</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamData.map((team, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{team.team}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-900">{team.headcount}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      team.vacancies > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {team.vacancies}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      team.attrition > 12 ? 'bg-red-100 text-red-800' :
                      team.attrition > 8 ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {team.attrition}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-medium text-gray-900">
                    {team.avgPerformance.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTeam.team} - Workforce Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedTeam.headcount} employees, {selectedTeam.vacancies} open positions</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{selectedTeam.headcount}</div>
                  <div className="text-sm text-blue-700">Team Size</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="text-2xl font-bold text-yellow-900">{selectedTeam.vacancies}</div>
                  <div className="text-sm text-yellow-700">Open Positions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-900">{selectedTeam.avgPerformance.toFixed(1)}</div>
                  <div className="text-sm text-green-700">Avg Performance</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Headcount Trend (Last 12 Months)</h4>
                <div className="h-48 flex items-end justify-between gap-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const baseCount = selectedTeam.headcount - 8;
                    const value = baseCount + Math.floor(Math.random() * 15);
                    const height = (value / (selectedTeam.headcount + 5)) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-600 mt-1">M{i + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Vacancy Forecast</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Open Positions</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTeam.vacancies}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expected Exits (Next Quarter)</span>
                    <span className="text-sm font-semibold text-orange-600">3-4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planned Hires</span>
                    <span className="text-sm font-semibold text-green-600">7</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Net Change Forecast</span>
                      <span className="text-sm font-bold text-green-600">+{selectedTeam.vacancies - 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
