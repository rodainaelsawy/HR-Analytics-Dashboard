'use client';

import { useState } from 'react';
import { BarChart3, Home } from 'lucide-react';
import GlobalFilters from '../components/GlobalFilters';
import ExecutiveOverview from '../components/ExecutiveOverview';
import WorkforceStability from '../components/WorkforceStability';
import DiversityPayEquity from '../components/DiversityPayEquity';
import OrganizationalDrilldown from '../components/OrganizationalDrilldown';
import PerformanceIntelligence from '../components/PerformanceIntelligence';
import TrainingROI from '../components/TrainingROI';
import RecruitmentAnalytics from '../components/RecruitmentAnalytics';
import QualityOfHire from '../components/QualityOfHire';
import ExitAnalytics from '../components/ExitAnalytics';
import TalentFlowSankey from '../components/TalentFlowSankey';
import type { FilterState } from '../types';

type ViewType = 'overview' | 'workforce' | 'diversity' | 'performance' | 'training' | 'recruitment' | 'attrition' | 'talentflow' | 'drilldown';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [filters, setFilters] = useState<FilterState>({
    timePeriod: 'year',
    department: 'all',
    location: 'all',
    employeeLevel: 'all',
    employmentType: 'all'
  });

  const handleExport = (format: 'pdf' | 'ppt') => {
    alert(`Exporting dashboard as ${format.toUpperCase()}...`);
  };

  const handleReset = () => {
    setFilters({
      timePeriod: 'year',
      department: 'all',
      location: 'all',
      employeeLevel: 'all',
      employmentType: 'all'
    });
  };

  const viewTitles: Record<ViewType, string> = {
    overview: 'Executive Overview',
    workforce: 'Workforce Stability Dashboard',
    diversity: 'Diversity & Pay Equity Dashboard',
    performance: 'Performance & Productivity Dashboard',
    training: 'Talent Development Dashboard',
    recruitment: 'Recruitment Analytics Dashboard',
    attrition: 'Attrition & Exit Insights Dashboard',
    talentflow: 'Talent Flow Dashboard',
    drilldown: 'Organizational Drilldown'
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <ExecutiveOverview filters={filters} onNavigate={(view) => setCurrentView(view as ViewType)} />;
      case 'workforce':
        return <WorkforceStability filters={filters} />;
      case 'diversity':
        return <DiversityPayEquity filters={filters} />;
      case 'performance':
        return <PerformanceIntelligence filters={filters} />;
      case 'training':
        return <TrainingROI filters={filters} />;
      case 'recruitment':
        return (
          <div className="space-y-8">
            <RecruitmentAnalytics filters={filters} />
            <QualityOfHire filters={filters} />
          </div>
        );
      case 'attrition':
        return <ExitAnalytics filters={filters} />;
      case 'talentflow':
        return <TalentFlowSankey filters={filters} />;
      case 'drilldown':
        return <OrganizationalDrilldown filters={filters} />;
      default:
        return <ExecutiveOverview filters={filters} onNavigate={(view) => setCurrentView(view as ViewType)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Intelligence Command Center</h1>
                <p className="text-sm text-gray-600">Advanced Workforce Analytics & Reporting Dashboard</p>
              </div>
            </div>
            {currentView !== 'overview' && (
              <button
                onClick={() => setCurrentView('overview')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Overview</span>
              </button>
            )}
          </div>
        </div>
        <GlobalFilters
          filters={filters}
          onFilterChange={setFilters}
          onExport={handleExport}
          onReset={handleReset}
        />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView !== 'overview' && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{viewTitles[currentView]}</h2>
            <p className="text-gray-600 mt-1">
              {currentView === 'workforce' && 'Organization size, stability, and turnover trends'}
              {currentView === 'diversity' && 'Workforce diversity composition and pay equity analysis'}
              {currentView === 'performance' && 'Performance ratings, 9-box analysis, and burnout detection'}
              {currentView === 'training' && 'Training completion rates, ROI, and skill development'}
              {currentView === 'recruitment' && 'Hiring funnel, time to hire, and quality of hire metrics'}
              {currentView === 'attrition' && 'Exit reasons, attrition patterns, and retention analysis'}
              {currentView === 'talentflow' && 'Employee movement across departments and promotions'}
              {currentView === 'drilldown' && 'Department-level analysis and team performance'}
            </p>
          </div>
        )}
        {renderView()}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            HR Analytics Dashboard • Last updated: {new Date().toLocaleDateString()} • 1,247 employees
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
