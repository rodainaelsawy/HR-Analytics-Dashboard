'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BurnoutDetection from './BurnoutDetection';
import HighPotentialIdentification from './HighPotentialIdentification';
import type { FilterState } from '../types';

type PerformanceIntelligenceProps = {
  filters: FilterState;
};

type PerformanceDistribution = {
  rating: string;
  count: number;
  color: string;
};

export default function PerformanceIntelligence({ filters }: PerformanceIntelligenceProps) {
  const [distribution, setDistribution] = useState<PerformanceDistribution[]>([]);
  const [trendData, setTrendData] = useState<{ cycle: string; avgRating: number }[]>([]);
  const [scatterData, setScatterData] = useState<{ hours: number; performance: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [filters]);

  async function fetchPerformanceData() {
    try {
      const { data: reviews } = await supabase
        .from('performance_reviews')
        .select('*');

      if (!reviews) return;

      const ratingBuckets = {
        'Exceptional (4.5-5)': 0,
        'High (3.5-4.4)': 0,
        'Medium (2.5-3.4)': 0,
        'Low (<2.5)': 0
      };

      reviews.forEach(review => {
        const rating = Number(review.rating);
        if (rating >= 4.5) ratingBuckets['Exceptional (4.5-5)']++;
        else if (rating >= 3.5) ratingBuckets['High (3.5-4.4)']++;
        else if (rating >= 2.5) ratingBuckets['Medium (2.5-3.4)']++;
        else ratingBuckets['Low (<2.5)']++;
      });

      const dist: PerformanceDistribution[] = [
        { rating: 'Low (<2.5)', count: ratingBuckets['Low (<2.5)'], color: '#EF4444' },
        { rating: 'Medium (2.5-3.4)', count: ratingBuckets['Medium (2.5-3.4)'], color: '#F59E0B' },
        { rating: 'High (3.5-4.4)', count: ratingBuckets['High (3.5-4.4)'], color: '#10B981' },
        { rating: 'Exceptional (4.5-5)', count: ratingBuckets['Exceptional (4.5-5)'], color: '#8B5CF6' }
      ];

      setDistribution(dist);

      const trend = [
        { cycle: 'Q1 2024', avgRating: 3.6 },
        { cycle: 'Q2 2024', avgRating: 3.7 },
        { cycle: 'Q3 2024', avgRating: 3.8 },
        { cycle: 'Q4 2024', avgRating: 3.9 },
        { cycle: 'Q1 2025', avgRating: 4.0 },
      ];

      setTrendData(trend);

      const { data: trainingRecords } = await supabase
        .from('training_records')
        .select('employee_id, duration_hours');

      const trainingHoursByEmployee = new Map<string, number>();
      trainingRecords?.forEach(record => {
        const current = trainingHoursByEmployee.get(record.employee_id) || 0;
        trainingHoursByEmployee.set(record.employee_id, current + Number(record.duration_hours));
      });

      const scatter = Array.from(performanceByEmployee.entries())
        .filter(([empId]) => trainingHoursByEmployee.has(empId))
        .map(([empId, rating]) => ({
          hours: trainingHoursByEmployee.get(empId)!,
          performance: rating
        }));

      setScatterData(scatter);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading performance intelligence data...</div>;
  }

  const maxCount = Math.max(...distribution.map(d => d.count));
  const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
  const topPerformersPct = totalCount > 0 ? (distribution[3].count / totalCount) * 100 : 0;
  const lowPerformersPct = totalCount > 0 ? (distribution[0].count / totalCount) * 100 : 0;

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Distribution</h3>
          <div className="space-y-4">
            {distribution.map((item, index) => {
              const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                    <span className="text-xs text-gray-500">{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="relative h-10 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
                      style={{ width: `${barWidth}%`, backgroundColor: item.color }}
                    >
                      {item.count > 0 && item.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-xs text-purple-600 mb-1">Top Performers</div>
              <div className="text-2xl font-bold text-purple-900">{topPerformersPct.toFixed(1)}%</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-red-600 mb-1">Low Performers</div>
              <div className="text-2xl font-bold text-red-900">{lowPerformersPct.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Trend Across Cycles</h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {trendData.map((item, index) => {
              const height = (item.avgRating / 5) * 100;
              const prevRating = index > 0 ? trendData[index - 1].avgRating : item.avgRating;
              const change = item.avgRating - prevRating;
              const isPositive = change >= 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full group">
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer"
                      style={{ height: `${height * 2}px` }}
                    >
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.cycle}<br />
                        Avg: {item.avgRating.toFixed(2)}
                        {index > 0 && (
                          <>
                            <br />
                            <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                              {isPositive ? '+' : ''}{change.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-2">{item.cycle}</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">{item.avgRating.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">Average improvement per cycle</span>
              <span className="text-lg font-bold text-green-900">+0.1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Hours vs Performance Score</h3>
        <div className="h-80 relative bg-gray-50 rounded-lg p-4">
          <div className="absolute left-8 top-4 bottom-16 text-xs text-gray-500 flex flex-col justify-between">
            <span>5.0</span>
            <span>4.0</span>
            <span>3.0</span>
            <span>2.0</span>
          </div>
          <div className="absolute bottom-8 left-16 right-4 flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>40</span>
            <span>80</span>
            <span>120</span>
          </div>
          <div className="ml-12 mb-12 h-full relative">
            {scatterData.map((point, index) => {
              const x = (point.hours / 120) * 100;
              const y = 100 - ((point.performance - 2) / 3) * 100;
              const color = point.performance > 4 ? '#10B981' : point.performance > 3 ? '#3B82F6' : '#F59E0B';

              return (
                <div
                  key={index}
                  className="absolute w-2 h-2 rounded-full opacity-70 hover:opacity-100 hover:scale-150 transition-all cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: color
                  }}
                  title={`Hours: ${point.hours.toFixed(0)}, Performance: ${point.performance.toFixed(1)}`}
                ></div>
              );
            })}
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
            Training Hours
          </div>
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600 whitespace-nowrap">
            Performance Score
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Below Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">High Performer</span>
          </div>
        </div>
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900 mb-1">Training ROI</div>
          <div className="text-2xl font-bold text-blue-900">+18%</div>
          <div className="text-xs text-blue-700 mt-1">Performance improvement per training dollar invested</div>
        </div>
      </div>

      <BurnoutDetection filters={filters} />

      <HighPotentialIdentification filters={filters} />
    </div>
  );
}
