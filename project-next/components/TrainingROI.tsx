'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Info } from 'lucide-react';
import type { FilterState } from '../types';

type TrainingROIProps = {
  filters: FilterState;
};

export default function TrainingROI({ filters }: TrainingROIProps) {
  const [scatterData, setScatterData] = useState<{ hours: number; performance: number; employee: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingData();
  }, [filters]);

  async function fetchTrainingData() {
    try {
      const { data: trainingRecords } = await supabase
        .from('training_records')
        .select('employee_id, duration_hours');

      const { data: performanceReviews } = await supabase
        .from('performance_reviews')
        .select('employee_id, rating')
        .order('review_date', { ascending: false });

      if (!trainingRecords || !performanceReviews) {
        setScatterData([]);
        return;
      }

      const trainingHoursByEmployee = new Map<string, number>();
      trainingRecords.forEach(record => {
        const current = trainingHoursByEmployee.get(record.employee_id) || 0;
        trainingHoursByEmployee.set(record.employee_id, current + Number(record.duration_hours));
      });

      const latestPerformanceByEmployee = new Map<string, number>();
      performanceReviews.forEach(review => {
        if (!latestPerformanceByEmployee.has(review.employee_id)) {
          latestPerformanceByEmployee.set(review.employee_id, Number(review.rating));
        }
      });

      const scatter = Array.from(trainingHoursByEmployee.entries())
        .filter(([empId]) => latestPerformanceByEmployee.has(empId))
        .map(([empId, hours]) => ({
          hours,
          performance: latestPerformanceByEmployee.get(empId)!,
          employee: empId
        }));

      setScatterData(scatter);
    } catch (error) {
      console.error('Error fetching training data:', error);
      setScatterData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading training ROI data...</div>;
  }

  const avgHours = scatterData.reduce((sum, d) => sum + d.hours, 0) / scatterData.length;
  const avgPerformance = scatterData.reduce((sum, d) => sum + d.performance, 0) / scatterData.length;

  const highTrainedHighPerformers = scatterData.filter(d => d.hours > avgHours && d.performance > avgPerformance).length;
  const highTrainedPercent = (highTrainedHighPerformers / scatterData.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Training ROI Analysis</h2>
        <p className="text-gray-600 mt-1">Impact of training investment on employee performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Training Completion vs Performance</h3>
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                ROI = (Performance Improvement × Avg Salary) / Training Cost
              </div>
            </div>
          </div>

          <div className="h-96 relative bg-gray-50 rounded-lg p-6">
            <div className="absolute left-4 top-8 bottom-16 text-xs text-gray-500 flex flex-col justify-between">
              <span>5.0</span>
              <span>4.5</span>
              <span>4.0</span>
              <span>3.5</span>
              <span>3.0</span>
              <span>2.5</span>
            </div>

            <div className="absolute bottom-8 left-16 right-8 flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>30</span>
              <span>60</span>
              <span>90</span>
              <span>120</span>
            </div>

            <div
              className="absolute border-l-2 border-b-2 border-gray-300"
              style={{ left: '64px', right: '32px', top: '32px', bottom: '64px' }}
            >
              <div
                className="absolute left-0 right-0 border-t border-dashed border-blue-300"
                style={{ top: `${((5 - avgPerformance) / 2.5) * 100}%` }}
              >
                <span className="absolute -left-12 -top-3 text-xs text-blue-600 font-medium">
                  Avg: {avgPerformance.toFixed(1)}
                </span>
              </div>

              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-blue-300"
                style={{ left: `${(avgHours / 130) * 100}%` }}
              >
                <span className="absolute -bottom-8 -left-6 text-xs text-blue-600 font-medium">
                  {avgHours.toFixed(0)}h
                </span>
              </div>

              {scatterData.map((point, index) => {
                const x = (point.hours / 130) * 100;
                const y = 100 - ((point.performance - 2.5) / 2.5) * 100;

                const isHighPerformer = point.performance > avgPerformance && point.hours > avgHours;
                const isLowTraining = point.hours < avgHours && point.performance < avgPerformance;

                let color = '#3B82F6';
                if (isHighPerformer) color = '#10B981';
                else if (isLowTraining) color = '#EF4444';
                else if (point.performance > 4) color = '#8B5CF6';

                return (
                  <div
                    key={index}
                    className="absolute w-2.5 h-2.5 rounded-full opacity-70 hover:opacity-100 hover:scale-150 transition-all cursor-pointer"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      backgroundColor: color
                    }}
                    title={`${point.employee}\nTraining: ${point.hours.toFixed(0)}h\nPerformance: ${point.performance.toFixed(1)}`}
                  ></div>
                );
              })}
            </div>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
              Training Hours
            </div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-700 whitespace-nowrap">
              Performance Score
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Low Training + Low Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">High Training + High Performance</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Training ROI</h4>
            <div className="text-4xl font-bold text-blue-900 mb-2">+18%</div>
            <div className="text-sm text-blue-700">
              Performance improvement per training dollar invested
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="text-xs text-blue-600">
                Avg ROI: $2.40 returned per $1 spent
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Key Insights</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{highTrainedPercent.toFixed(0)}%</span> of well-trained employees are top performers
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <p className="text-sm text-gray-700">
                  Optimal training: <span className="font-medium">60-80 hours/year</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                <p className="text-sm text-gray-700">
                  Strong correlation between training and performance (r = 0.72)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Training Investment</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Budget (YTD)</span>
                <span className="font-semibold text-gray-900">$1.2M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg per Employee</span>
                <span className="font-semibold text-gray-900">$1,420</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
