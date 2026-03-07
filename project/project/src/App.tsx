import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import GlobalFilters from './components/GlobalFilters';
import WorkforceStability from './components/WorkforceStability';
import DiversityPayEquity from './components/DiversityPayEquity';
import HRFinancialAlignment from './components/HRFinancialAlignment';
import OrganizationalDrilldown from './components/OrganizationalDrilldown';
import PerformanceIntelligence from './components/PerformanceIntelligence';
import TrainingROI from './components/TrainingROI';
import BurnoutDetection from './components/BurnoutDetection';
import HighPotentialIdentification from './components/HighPotentialIdentification';
import RecruitmentAnalytics from './components/RecruitmentAnalytics';
import QualityOfHire from './components/QualityOfHire';
import FirstYearAttrition from './components/FirstYearAttrition';
import ExitAnalytics from './components/ExitAnalytics';
import TalentFlowSankey from './components/TalentFlowSankey';
import type { FilterState } from './types';

function App() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR Intelligence Command Center</h1>
              <p className="text-sm text-gray-600">Advanced Workforce Analytics & Reporting Dashboard</p>
            </div>
          </div>
        </div>
        <GlobalFilters
          filters={filters}
          onFilterChange={setFilters}
          onExport={handleExport}
          onReset={handleReset}
        />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <section id="section-1">
          <WorkforceStability filters={filters} />
        </section>

        <section id="section-2">
          <DiversityPayEquity filters={filters} />
        </section>

        <section id="section-3">
          <HRFinancialAlignment filters={filters} />
        </section>

        <section id="section-4">
          <OrganizationalDrilldown filters={filters} />
        </section>

        <section id="section-5">
          <PerformanceIntelligence filters={filters} />
        </section>

        <section id="section-6">
          <TrainingROI filters={filters} />
        </section>

        <section id="section-7">
          <BurnoutDetection filters={filters} />
        </section>

        <section id="section-8">
          <HighPotentialIdentification filters={filters} />
        </section>

        <section id="section-10">
          <RecruitmentAnalytics filters={filters} />
        </section>

        <section id="section-11">
          <QualityOfHire filters={filters} />
        </section>

        <section id="section-12">
          <FirstYearAttrition filters={filters} />
        </section>

        <section id="section-13">
          <ExitAnalytics filters={filters} />
        </section>

        <section id="section-14">
          <TalentFlowSankey filters={filters} />
        </section>
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
