import { useState } from 'react';
import Navigation from './components/Navigation';
import Overview from './components/Overview';
import WorkforceIntelligence from './components/WorkforceIntelligence';
import PerformanceOptimization from './components/PerformanceOptimization';
import TalentFlow from './components/TalentFlow';

function App() {
  const [activeModule, setActiveModule] = useState('overview');

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <Overview />;
      case 'workforce':
        return <WorkforceIntelligence />;
      case 'performance':
        return <PerformanceOptimization />;
      case 'talent':
        return <TalentFlow />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderModule()}
      </main>
    </div>
  );
}

export default App;
