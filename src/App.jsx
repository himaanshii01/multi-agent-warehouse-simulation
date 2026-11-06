import React, { useState, useEffect, useMemo } from 'react';
import { SimulationEngine, ALLOCATION_STRATEGIES } from './simulation/SimulationEngine';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomOrderModal from './components/CustomOrderModal';
import BenchmarkModal from './components/BenchmarkModal';

// Pages
import Overview from './pages/Overview';
import LiveSimulation from './pages/LiveSimulation';
import RobotFleet from './pages/RobotFleet';
import OrderManagement from './pages/OrderManagement';
import TaskAllocation from './pages/TaskAllocation';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import AIExplanation from './pages/AIExplanation';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRobotId, setSelectedRobotId] = useState('R-01');
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [tickCounter, setTickCounter] = useState(0);

  // Singleton Simulation Engine
  const simulationEngine = useMemo(() => {
    return new SimulationEngine({
      onUpdate: () => {
        setTickCounter((prev) => prev + 1);
      }
    });
  }, []);

  // Current simulation snapshot
  const simulationState = simulationEngine.getSnapshot();

  const handleToggleStrategy = () => {
    const nextStrategy =
      simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED
        ? ALLOCATION_STRATEGIES.DECENTRALIZED
        : ALLOCATION_STRATEGIES.CENTRALIZED;
    simulationEngine.setStrategy(nextStrategy);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0E1A] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulationState={simulationState}
        onToggleStrategy={handleToggleStrategy}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Navbar */}
        <Navbar
          simulationEngine={simulationEngine}
          simulationState={simulationState}
          onOpenCustomOrderModal={() => setIsCustomOrderOpen(true)}
          onOpenBenchmarkModal={() => setIsBenchmarkOpen(true)}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <Overview
              simulationEngine={simulationEngine}
              simulationState={simulationState}
              setActiveTab={setActiveTab}
              onOpenBenchmarkModal={() => setIsBenchmarkOpen(true)}
              onOpenCustomOrderModal={() => setIsCustomOrderOpen(true)}
            />
          )}

          {activeTab === 'simulation' && (
            <LiveSimulation
              simulationEngine={simulationEngine}
              simulationState={simulationState}
              onOpenCustomOrderModal={() => setIsCustomOrderOpen(true)}
              onOpenBenchmarkModal={() => setIsBenchmarkOpen(true)}
              selectedRobotId={selectedRobotId}
              setSelectedRobotId={setSelectedRobotId}
            />
          )}

          {activeTab === 'fleet' && (
            <RobotFleet
              simulationEngine={simulationEngine}
              simulationState={simulationState}
              selectedRobotId={selectedRobotId}
              setSelectedRobotId={setSelectedRobotId}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagement
              simulationEngine={simulationEngine}
              simulationState={simulationState}
              onOpenCustomOrderModal={() => setIsCustomOrderOpen(true)}
            />
          )}

          {activeTab === 'allocation' && (
            <TaskAllocation
              simulationEngine={simulationEngine}
              simulationState={simulationState}
              onOpenBenchmarkModal={() => setIsBenchmarkOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <PerformanceAnalytics
              simulationEngine={simulationEngine}
              simulationState={simulationState}
              onOpenBenchmarkModal={() => setIsBenchmarkOpen(true)}
            />
          )}

          {activeTab === 'explanation' && (
            <AIExplanation />
          )}
        </main>
      </div>

      {/* Modals */}
      <CustomOrderModal
        isOpen={isCustomOrderOpen}
        onClose={() => setIsCustomOrderOpen(false)}
        simulationEngine={simulationEngine}
      />

      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        simulationEngine={simulationEngine}
      />
    </div>
  );
}
