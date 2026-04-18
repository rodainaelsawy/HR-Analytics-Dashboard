'use client';

import { useEffect, useState } from 'react';
import type { FilterState } from '../types';

type QualityOfHireProps = {
  filters: FilterState;
};

type SourceData = {
  source: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
};

export default function QualityOfHire({ filters }: QualityOfHireProps) {
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [departmentData, setDepartmentData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityData();
  }, [filters]);

  async function fetchQualityData() {
    try {
      const sources: SourceData[] = [
        { source: 'Employee Referral', min: 3.2, q1: 3.8, median: 4.2, q3: 4.6, max: 4.9, count: 42 },
        { source: 'LinkedIn', min: 2.8, q1: 3.4, median: 3.9, q3: 4.3, max: 4.7, count: 38 },
        { source: 'Job Board', min: 2.5, q1: 3.1, median: 3.6, q3: 4.0, max: 4.5, count: 35 },
        { source: 'Recruiter', min: 2.9, q1: 3.5, median: 4.0, q3: 4.4, max: 4.8, count: 28 },
        { source: 'Campus', min: 2.7, q1: 3.3, median: 3.7, q3: 4.1, max: 4.6, count: 22 },
      ];

      const departments: SourceData[] = [
        { source: 'Engineering', min: 3.0, q1: 3.6, median: 4.1, q3: 4.5, max: 4.9, count: 52 },
        { source: 'Sales', min: 2.6, q1: 3.2, median: 3.8, q3: 4.2, max: 4.7, count: 45 },
        { source: 'Marketing', min: 2.8, q1: 3.4, median: 3.9, q3: 4.3, max: 4.8, count: 32 },
        { source: 'Operations', min: 2.7, q1: 3.3, median: 3.8, q3: 4.2, max: 4.6, count: 28 },
      ];

      setSourceData(sources);
      setDepartmentData(departments);
    } catch (error) {
      console.error('Error fetching quality of hire data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading quality of hire data...</div>;
  }

  const renderBoxPlot = (data: SourceData[]) => {
    return (
      <div className="space-y-6">
        {data.map((item, index) => {
          const range = 5 - 2.5;
          const minPos = ((item.min - 2.5) / range) * 100;
          const q1Pos = ((item.q1 - 2.5) / range) * 100;
          const medianPos = ((item.median - 2.5) / range) * 100;
          const q3Pos = ((item.q3 - 2.5) / range) * 100;
          const maxPos = ((item.max - 2.5) / range) * 100;

          const color = item.median >= 4.0 ? '#10B981' : item.median >= 3.5 ? '#3B82F6' : '#F59E0B';

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 w-32">{item.source}</span>
                <span className="text-xs text-gray-500">n={item.count}</span>
              </div>
              <div className="relative h-12 bg-gray-50 rounded">
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-300"
                  style={{ left: `${minPos}%`, width: `${maxPos - minPos}%` }}
                ></div>

                <div
                  className="absolute top-1/2 transform -translate-y-1/2 h-8 rounded"
                  style={{
                    left: `${q1Pos}%`,
                    width: `${q3Pos - q1Pos}%`,
                    backgroundColor: color,
                    opacity: 0.6
                  }}
                ></div>

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-900"
                  style={{ left: `${medianPos}%` }}
                ></div>

                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-1 h-10 bg-gray-400"
                  style={{ left: `${minPos}%` }}
                ></div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-1 h-10 bg-gray-400"
                  style={{ left: `${maxPos}%` }}
                ></div>

                <div
                  className="absolute -bottom-6 transform -translate-x-1/2 text-xs font-semibold"
                  style={{ left: `${medianPos}%`, color }}
                >
                  {item.median.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const bestSource = sourceData.reduce((best, current) =>
    current.median > best.median ? current : best
  , sourceData[0]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quality of Hire Analysis</h2>
        <p className="text-gray-600 mt-1">First-cycle performance ratings by recruitment source and department</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Recruitment Source</h3>
          {renderBoxPlot(sourceData)}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              Box shows middle 50% of ratings. Line indicates median. Whiskers show min/max.
            </p>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Best Source:</span> {bestSource.source} (median: {bestSource.median.toFixed(1)})
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Department</h3>
          {renderBoxPlot(departmentData)}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 mb-1">Avg Quality Score</div>
                <div className="text-2xl font-bold text-blue-900">3.9</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-600 mb-1">Retention @ 1yr</div>
                <div className="text-2xl font-bold text-purple-900">87%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Metrics by Source</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Hires (YTD)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Median Rating</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">1-Year Retention</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Cost per Hire</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quality Score</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.map((source, index) => {
                const retention = 85 + Math.random() * 10;
                const cost = source.source === 'Employee Referral' ? 2800 :
                            source.source === 'LinkedIn' ? 5200 :
                            source.source === 'Recruiter' ? 8500 :
                            source.source === 'Job Board' ? 3200 : 4100;
                const qualityScore = (source.median * 20 + retention) / 2;

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{source.source}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-900">{source.count}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        source.median >= 4.0 ? 'bg-green-100 text-green-800' :
                        source.median >= 3.5 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {source.median.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-900">{retention.toFixed(0)}%</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-900">${cost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        qualityScore >= 80 ? 'bg-green-100 text-green-800' :
                        qualityScore >= 70 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {qualityScore.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Increase investment in employee referral program—highest quality and retention</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Review screening process for job board candidates to improve quality</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Consider structured interview training to improve hiring consistency</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
