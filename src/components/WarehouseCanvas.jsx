import React, { useRef, useEffect, useState } from 'react';
import { CELL_TYPES, GRID_WIDTH, GRID_HEIGHT } from '../simulation/WarehouseGridModel';
import { Eye, Layers, Compass, Zap, Shield, AlertTriangle } from 'lucide-react';

export default function WarehouseCanvas({ 
  simulationEngine, 
  simulationState, 
  onSelectRobot,
  selectedRobotId 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Visual toggles
  const [showPaths, setShowPaths] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const cellWidth = rect.width / GRID_WIDTH;
    const cellHeight = rect.height / GRID_HEIGHT;

    // 1. Draw Background
    ctx.fillStyle = '#090E1D';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 2. Draw Grid Lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(rect.width, y * cellHeight);
      ctx.stroke();
    }

    // 3. Draw Static Grid Cells (Shelves, Pickup, Delivery, Chargers, Obstacles)
    const grid = simulationState.grid;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        const cx = x * cellWidth;
        const cy = y * cellHeight;

        if (cell.type === CELL_TYPES.SHELF) {
          // Storage Rack styling
          ctx.fillStyle = '#141D30';
          ctx.fillRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);

          // Rack metal edge
          ctx.strokeStyle = '#273654';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);

          // Storage bin dividers inside shelf
          ctx.fillStyle = '#22304A';
          ctx.fillRect(cx + 6, cy + 6, cellWidth - 12, (cellHeight - 12) / 2);
          ctx.fillRect(cx + 6, cy + 6 + (cellHeight - 12) / 2 + 2, cellWidth - 12, (cellHeight - 12) / 2 - 2);

          // Shelf product indicator dot
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(cx + cellWidth / 2, cy + cellHeight / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (showLabels && cell.label) {
            ctx.fillStyle = '#64748B';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(cell.label, cx + cellWidth / 2, cy + cellHeight - 4);
          }
        } else if (cell.type === CELL_TYPES.OBSTACLE) {
          // Obstacle pillar
          ctx.fillStyle = '#1E2433';
          ctx.fillRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);

          // Hazard diagonal stripe
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx + 4, cy + cellHeight - 4);
          ctx.lineTo(cx + cellWidth - 4, cy + 4);
          ctx.stroke();

          ctx.strokeStyle = '#334155';
          ctx.strokeRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);
        } else if (cell.type === CELL_TYPES.PICKUP) {
          // Inbound receiving bay
          ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.fillRect(cx + 1, cy + 1, cellWidth - 2, cellHeight - 2);

          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.strokeRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);
          ctx.setLineDash([]);

          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(cell.label || 'PICK', cx + cellWidth / 2, cy + cellHeight / 2 + 3);
        } else if (cell.type === CELL_TYPES.DELIVERY) {
          // Outbound shipping dock
          ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
          ctx.fillRect(cx + 1, cy + 1, cellWidth - 2, cellHeight - 2);

          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.strokeRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);
          ctx.setLineDash([]);

          ctx.fillStyle = '#22D3EE';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(cell.label || 'DOCK', cx + cellWidth / 2, cy + cellHeight / 2 + 3);
        } else if (cell.type === CELL_TYPES.CHARGER) {
          // Charging Station
          ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
          ctx.fillRect(cx + 2, cy + 2, cellWidth - 4, cellHeight - 4);

          // Charging inductive ring
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx + cellWidth / 2, cy + cellHeight / 2, Math.min(cellWidth, cellHeight) / 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ CHG', cx + cellWidth / 2, cy + cellHeight / 2 + 3);
        }

        // Shared Critical Zone highlight
        if (showZones && cell.resourceId) {
          const res = simulationEngine.resourceManager.getResource(cell.resourceId);
          const isContested = res && res.waitingQueue.length > 0;
          const isHeld = res && res.currentOwner;

          ctx.save();
          if (isContested) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.strokeStyle = '#EF4444';
          } else if (isHeld) {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
            ctx.strokeStyle = '#F59E0B';
          } else {
            ctx.fillStyle = 'rgba(139, 92, 246, 0.12)';
            ctx.strokeStyle = '#8B5CF6';
          }

          ctx.fillRect(cx + 1, cy + 1, cellWidth - 2, cellHeight - 2);
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          ctx.strokeRect(cx + 1, cy + 1, cellWidth - 2, cellHeight - 2);
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    }

    // 4. Draw Planned Routes & Destination Pins (if toggled)
    if (showPaths) {
      simulationState.robots.forEach(robot => {
        if (robot.isFailed || robot.path.length === 0) return;

        ctx.save();
        ctx.strokeStyle = robot.color;
        ctx.fillStyle = robot.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(robot.x * cellWidth + cellWidth / 2, robot.y * cellHeight + cellHeight / 2);

        robot.path.forEach((pt) => {
          ctx.lineTo(pt.x * cellWidth + cellWidth / 2, pt.y * cellHeight + cellHeight / 2);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Destination Marker Pin
        if (robot.targetPos) {
          const tx = robot.targetPos.x * cellWidth + cellWidth / 2;
          const ty = robot.targetPos.y * cellHeight + cellHeight / 2;

          ctx.beginPath();
          ctx.arc(tx, ty, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(tx, ty, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // 5. Draw Robots (AMRs)
    simulationState.robots.forEach(robot => {
      const rx = robot.x * cellWidth + cellWidth / 2;
      const ry = robot.y * cellHeight + cellHeight / 2;
      const radius = Math.min(cellWidth, cellHeight) * 0.42;

      ctx.save();

      // Selected robot highlight glow
      if (selectedRobotId === robot.id) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(rx, ry, radius + 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Robot Base Chassis
      ctx.fillStyle = robot.isFailed ? '#451A1A' : '#111827';
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer status border / color accent
      ctx.strokeStyle = robot.isFailed ? '#EF4444' : robot.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Battery Ring Arc (360 degrees = 100%)
      const batteryAngle = (robot.battery / 100) * (Math.PI * 2);
      ctx.strokeStyle = robot.battery > 50 ? '#10B981' : robot.battery > 20 ? '#F59E0B' : '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, radius + 3, -Math.PI / 2, -Math.PI / 2 + batteryAngle);
      ctx.stroke();

      // If robot is carrying cargo: draw package icon on top
      if (robot.carryingCargo) {
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(rx - 5, ry - 5, 10, 10);
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx - 5, ry - 5, 10, 10);
      } else {
        // Robot ID text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(robot.id, rx, ry);
      }

      // Yielding / Waiting indicator
      if (robot.isTemporarilyYielding || robot.isWaitingResource) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(rx, ry, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Charging pulse
      if (robot.status === 'CHARGING') {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('⚡', rx, ry - radius - 5);
      }

      // Failed indicator
      if (robot.isFailed) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✕', rx, ry - radius - 5);
      }

      ctx.restore();
    });

    // 6. Draw Hover Reticle
    if (hoveredCell) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        hoveredCell.x * cellWidth,
        hoveredCell.y * cellHeight,
        cellWidth,
        cellHeight
      );
    }
  }, [simulationState, showPaths, showLabels, showZones, hoveredCell, selectedRobotId]);

  // Mouse move handler for coordinates and tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * GRID_WIDTH);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * GRID_HEIGHT);

    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      const cell = simulationState.grid[y][x];
      const robotOnCell = simulationState.robots.find(r => r.x === x && r.y === y);
      setHoveredCell({ x, y, cell, robot: robotOnCell });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Click handler to select robot
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * GRID_WIDTH);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * GRID_HEIGHT);

    const clickedRobot = simulationState.robots.find(r => r.x === x && r.y === y);
    if (clickedRobot && onSelectRobot) {
      onSelectRobot(clickedRobot.id);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-[#0A0F1D] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Controls Toolbar */}
      <div className="px-4 py-2.5 bg-[#0D1426] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider">
            Automated Warehouse Grid (22 &times; 15)
          </span>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPaths(!showPaths)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              showPaths ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>A* Trajectories</span>
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              showZones ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Shared Zones</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              showLabels ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Rack Labels</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="relative flex-1 w-full min-h-[480px] flex items-center justify-center p-3"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="w-full h-full max-h-[580px] rounded-lg cursor-crosshair object-contain"
        />

        {/* Hovered Cell Quick Tooltip */}
        {hoveredCell && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-md shadow-xl pointer-events-none z-10 flex items-center space-x-3">
            <span className="text-cyan-400 font-bold">
              Cell [{hoveredCell.x}, {hoveredCell.y}]
            </span>
            <span className="text-slate-400">
              Type: <strong className="text-slate-200">{hoveredCell.cell.type}</strong>
            </span>
            {hoveredCell.cell.label && (
              <span className="text-emerald-400">
                Label: {hoveredCell.cell.label}
              </span>
            )}
            {hoveredCell.robot && (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                Occupant: {hoveredCell.robot.name} ({Math.round(hoveredCell.robot.battery)}% Batt)
              </span>
            )}
            {hoveredCell.cell.resourceId && (
              <span className="text-purple-400">
                Zone: {hoveredCell.cell.resourceName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Canvas Legend Footer */}
      <div className="px-4 py-2 bg-[#0B1020] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#141D30] border border-[#273654]" />
            <span>Storage Shelves</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500" />
            <span>Inbound Pickup Bays</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cyan-500/20 border border-cyan-500" />
            <span>Outbound Shipping Docks</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500" />
            <span>Charging Stations</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-500/20 border border-purple-500 border-dashed" />
            <span>Shared Corridors / Intersections</span>
          </span>
        </div>
        <div className="text-slate-500">
          Tip: Click any robot to inspect telemetry &amp; path.
        </div>
      </div>
    </div>
  );
}
