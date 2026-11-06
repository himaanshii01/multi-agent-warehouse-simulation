import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  GitFork, 
  Compass, 
  ShieldCheck, 
  Shield, 
  MessageSquare, 
  RotateCw, 
  ChevronRight,
  Code2,
  Terminal,
  Layers,
  ArrowDown
} from 'lucide-react';

export default function AIExplanation() {
  const [selectedConcept, setSelectedConcept] = useState('mas');
  const [activeCodeTab, setActiveCodeTab] = useState('bdi');

  const concepts = [
    {
      id: 'mas',
      title: '1. Multi-Agent Systems (MAS)',
      summary: 'A computerized system composed of multiple interacting intelligent agents.',
      body: 'A Multi-Agent System (MAS) solves problems that are difficult or impossible for an individual monolithic agent. In this warehouse project, the AMR robots act as distinct autonomous entities situated in a shared physical environment, interacting through explicit communication protocols and spatial negotiation to fulfill fulfillment orders collaboratively.'
    },
    {
      id: 'agent',
      title: '2. Intelligent Agent & BDI Model',
      summary: 'An autonomous entity that perceives its environment and takes rational actions.',
      body: 'Our robot agents implement the classic BDI (Belief-Desire-Intention) paradigm: Beliefs represent the agent’s situational awareness (current position, battery level, obstacles); Desires represent high-level goals (e.g. fulfill order, recharge); Intentions represent committed execution plans (e.g. navigate along A* path).'
    },
    {
      id: 'perception',
      title: '3. Agent Perception',
      summary: 'The process of gathering sensory information from the local environment.',
      body: 'Perception in our AMR fleet operates every simulation tick. Each robot queries the simulation grid to detect nearby robots within collision proximity, check battery level, sense shared bottleneck mutex status, and observe incoming order broadcasts.'
    },
    {
      id: 'decision',
      title: '4. Autonomous Decision-Making',
      summary: 'Evaluating environmental inputs and internal state to select rational actions.',
      body: 'Robots do not merely follow pre-programmed trajectories; they evaluate trade-offs. For example, if a robot’s battery falls below 20%, it autonomously aborts idle waiting and routes itself to the nearest available charging station, self-releasing its assigned task back to the queue.'
    },
    {
      id: 'centralized',
      title: '5. Centralized Coordination (Mode A)',
      summary: 'A central master controller maintains global knowledge and assigns tasks.',
      body: 'Mode A implements a global cost-minimization dispatcher. The central warehouse server collects status telemetry from all robots and calculates a cost matrix: Cost = w1*Dist(Robot, Pickup) + w2*Dist(Pickup, Delivery) + w3*(100 - Battery%) - PriorityBonus. The optimal greedy matching assigns tasks with minimal message overhead (1 command per assignment).'
    },
    {
      id: 'decentralized',
      title: '6. Decentralized Coordination (Mode B)',
      summary: 'No central decision-maker; agents self-organize via peer interaction.',
      body: 'Mode B eliminates the single point of failure (SPOF). Individual robots independently determine whether they are capable of undertaking an order and bid according to their private internal cost function. If the server goes down, surviving robots can continue peer-to-peer task allocation.'
    },
    {
      id: 'cnp',
      title: '7. Contract Net Protocol (FIPA CNP)',
      summary: 'Standardized agent negotiation protocol: CFP → Propose/Bid → Award → Ack.',
      body: 'Contract Net Protocol is the foundation of our decentralized mode. The auction manager broadcasts a Call For Proposals (CFP). Eligible robots calculate a custom bid and send Proposals. The manager awards the contract to the lowest bidder, rejects remaining proposals, and the winner acknowledges acceptance.'
    },
    {
      id: 'auction',
      title: '8. Auction-Based Task Allocation',
      summary: 'Market-based multi-robot task allocation using dynamic bids.',
      body: 'Bids reflect true agent readiness: Bid = 1.0*Dist(Pickup) + 0.5*Dist(Dock) - 0.15*Battery% + WorkloadPenalty. A low bid indicates high efficiency, proximity, and ample battery capacity.'
    },
    {
      id: 'astar',
      title: '9. A* Pathfinding Algorithm',
      summary: 'Heuristic-guided shortest-path search minimizing f(n) = g(n) + h(n).',
      body: 'Robots navigate around permanent shelf racks and dynamic obstacles using A*. The heuristic h(n) uses Manhattan Distance |x1 - x2| + |y1 - y2|, which is admissible and monotonic on a 4-directional grid, ensuring mathematically optimal path calculation.'
    },
    {
      id: 'collision',
      title: '10. Dynamic Collision Avoidance',
      summary: 'Resolving vertex collisions and head-on swap conflicts before movement.',
      body: 'Each simulation tick runs an arbitration pre-flight check. It prevents Vertex Collisions (two robots entering the same cell) and Edge/Swap Collisions (robots crossing in narrow corridors). The lower-priority robot yields right-of-way; if blocked for > 2 ticks, it triggers real-time dynamic A* replanning.'
    },
    {
      id: 'resource',
      title: '11. Shared Resource Negotiation & Mutex',
      summary: 'Priority queue reservation for narrow bottleneck corridors and docks.',
      body: 'Critical shared infrastructure (Central Choke Corridor C-1, Main Intersections INT-1/2, Pickup Bays) is protected by mutual exclusion. Contending robots are queued and prioritized by: Priority = UrgencyScore + WaitTicks*2 + BatteryUrgency.'
    },
    {
      id: 'communication',
      title: '12. Agent Communication Languages (ACL)',
      summary: 'Structured message exchange between controllers and autonomous agents.',
      body: 'Messages adhere to multi-agent semantics with performatives: CFP, PROPOSE, REFUSE, ACCEPT_PROPOSAL, REJECT_PROPOSAL, REQUEST_RESOURCE, GRANT_RESOURCE. Total message counts are measured to quantify communication overhead.'
    },
    {
      id: 'fault_tolerance',
      title: '13. Fault Tolerance & Resilience',
      summary: 'Graceful system recovery when individual robots experience failure.',
      body: 'Our simulation enables live fault injection (motor lock failure). When a robot breaks down, the system reclaims its in-flight order, purges its active mutex locks, and automatically reallocates the task to an operational peer without deadlocking the warehouse.'
    }
  ];

  const flowchartSteps = [
    { num: '01', title: 'Order Generation', desc: 'Customer order arrives with SKU, priority, inbound bay & outbound dock' },
    { num: '02', title: 'Task Announcement', desc: 'Central Dispatcher evaluates or CNP broadcasts Call For Proposals (CFP)' },
    { num: '03', title: 'Robot Perception', desc: 'AMR senses local grid, obstacles, remaining battery & active queue' },
    { num: '04', title: 'Task Evaluation / Bidding', desc: 'Bid = w1*dist(pick) + w2*dist(dock) - w3*batt% + workload penalty' },
    { num: '05', title: 'Task Allocation', desc: 'Master assigns minimum-cost AMR or Auctioneer awards lowest bid contract' },
    { num: '06', title: 'Path Planning (A*)', desc: 'Robot computes shortest collision-free route using Manhattan heuristic' },
    { num: '07', title: 'Collision Avoidance', desc: 'Dynamic arbitration checks vertex & edge swap conflicts, yielding right-of-way' },
    { num: '08', title: 'Resource Reservation', desc: 'Mutex requested before entering shared corridors & bottleneck intersections' },
    { num: '09', title: 'Cargo Pickup', desc: 'Robot arrives at designated inbound bay, locks pallet, loads cargo (2 ticks)' },
    { num: '10', title: 'Outbound Delivery', desc: 'Robot travels to shipping dock, unloads shipment, releases resources' },
    { num: '11', title: 'Telemetry & Monitoring', desc: 'Records throughput, completion time, comm overhead & battery expenditure' }
  ];

  const pseudocodes = {
    bdi: `// 1. AUTONOMOUS ROBOT AGENT BDI LOOP
function AgentLoop(agent, environment):
    while agent.isAlive:
        // PERCEPTION PHASE
        beliefs = agent.perceive(environment.grid, environment.otherRobots)
        
        // BATTERY MANAGEMENT
        if beliefs.battery < 20% and agent.status != CHARGING:
            if agent.hasUnpickedOrder:
                environment.reassignOrder(agent.order)
            agent.routeToNearestCharger()
            continue
            
        // DECISION-MAKING
        if agent.status == IDLE:
            if beliefs.battery < 45%:
                agent.routeToNearestCharger()
        else if agent.status == MOVING_TO_PICKUP:
            if agent.position == agent.order.pickupPos:
                agent.status = PICKING_UP
                
        // ACTION EXECUTION
        if agent.path.length > 0 and not agent.isYielding:
            nextCell = agent.path.peek()
            if nextCell.isSharedResource:
                if not environment.resourceManager.isGranted(nextCell, agent.id):
                    agent.isYielding = true
                    continue
            agent.stepAlongPath()
            agent.battery -= 0.12%`,

    centralized: `// 2. STRATEGY A: CENTRALIZED DISPATCH ALGORITHM
function CentralizedDispatch(pendingOrders, idleRobots):
    costMatrix = []
    
    // Calculate global cost for each (Robot, Order) pair
    for each order in pendingOrders:
        for each robot in idleRobots:
            if robot.battery < 25%: continue
            
            distPickup = ManhattanDist(robot.pos, order.pickupPos)
            distDelivery = ManhattanDist(order.pickupPos, order.deliveryPos)
            batteryPenalty = ((100 - robot.battery) / 100) * 6.0
            priorityBonus = order.priorityWeight * 5.0
            
            totalCost = (1.0 * distPickup) + (0.4 * distDelivery) 
                        + batteryPenalty - priorityBonus
                        
            costMatrix.append({ robot, order, totalCost })
            
    // Greedy minimum-cost matching
    costMatrix.sortBy(cost ascending)
    
    for each match in costMatrix:
        if match.robot is not assigned and match.order is not assigned:
            match.order.status = ASSIGNED
            match.robot.assignOrder(match.order)
            SendMessage(to: match.robot, command: "DISPATCH", order: match.order)
            // Communication overhead: Exactly 1 direct message`,

    cnp: `// 3. STRATEGY B: CONTRACT NET PROTOCOL (FIPA CNP)
function ContractNetProtocol(order, robotCommunity):
    // STEP 1: CFP Announcement
    BroadcastMessage(type: "CALL_FOR_PROPOSALS", order: order)
    // Overhead: N messages
    
    proposals = []
    
    // STEP 2: Agent Autonomous Bid Calculation
    for each robot in robotCommunity:
        if robot.isFailed or robot.battery < 25%:
            continue
            
        bid = robot.calculateBid(order)
        // Bid = w1*distPickup + w2*distDelivery - w3*battery% + workload
        proposals.append({ robotId: robot.id, bidValue: bid })
        SendMessage(to: Auctioneer, type: "PROPOSE", bid: bid)
        // Overhead: N messages
        
    // STEP 3: Bid Evaluation & Award
    proposals.sortBy(bidValue ascending)
    winner = proposals.first()
    
    SendMessage(to: winner.robotId, type: "ACCEPT_PROPOSAL", order: order)
    for other in proposals.rest():
        SendMessage(to: other.robotId, type: "REJECT_PROPOSAL")
        
    // STEP 4: Winner Confirmation
    SendMessage(to: Auctioneer, type: "CONFIRM_ACK")
    // Total Overhead: N + N + 1 + (N-1) + 1 = 3N messages`,

    astar: `// 4. A* PATHFINDING WITH MANHATTAN HEURISTIC
function AStarSearch(grid, start, target, dynamicObstacles):
    openList = PriorityQueue()
    closedSet = Set()
    
    startNode = Node(pos: start, g: 0, h: Manhattan(start, target))
    openList.push(startNode, priority: startNode.f)
    
    while openList is not empty:
        current = openList.popLowestF()
        
        if current.pos == target:
            return ReconstructPath(current)
            
        closedSet.add(current.pos)
        
        for neighbor in Get4Neighbors(current.pos):
            if neighbor in closedSet: continue
            if grid[neighbor].isShelf or grid[neighbor].isObstacle: continue
            if neighbor in dynamicObstacles and neighbor != target: continue
            
            tentativeG = current.g + 1
            h = abs(neighbor.x - target.x) + abs(neighbor.y - target.y)
            f = tentativeG + h
            
            openList.insertOrUpdate(neighbor, tentativeG, h, parent: current)
            
    return null // Path blocked`,

    resource: `// 5. SHARED BOTTLENECK MUTEX RESERVATION
function RequestSharedResource(resourceId, robot, tick):
    res = ResourceRegistry.get(resourceId)
    
    if res.currentOwner == robot.id:
        return true // Already granted
        
    if res.currentOwner == null:
        res.currentOwner = robot.id
        res.lockedAtTick = tick
        return true // Immediate grant
        
    // Contested: Evaluate arbitration priority score
    urgency = robot.order.priorityScore // CRITICAL: 40, HIGH: 30, NORMAL: 20
    battBoost = (robot.battery < 20%) ? 30 : 0
    score = urgency + battBoost + (robot.waitTicks * 2)
    
    res.waitingQueue.insertSorted(robot.id, priority: score)
    return false // Robot must yield`
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide">
            AI Multi-Agent System Foundations &amp; Academic Theory
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed font-mono">
          Comprehensive university reference guide explaining Multi-Agent Systems, BDI Agent Architecture, Contract Net Protocol, Centralized vs Decentralized Coordination, A* Pathfinding, Collision Resolution, and Fault Tolerance.
        </p>
      </div>

      {/* Interactive Process Flowchart */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Multi-Agent Order Fulfillment Pipeline Flowchart
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
          {flowchartSteps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    Step {step.num}
                  </span>
                  {idx < flowchartSteps.length - 1 && (
                    <ArrowDown className="w-3.5 h-3.5 text-slate-600 lg:rotate-[-90deg]" />
                  )}
                </div>
                <h3 className="font-bold text-white text-xs mb-1">
                  {step.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 13 Core Concepts Encyclopedia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Concept Selector Menu */}
        <div className="lg:col-span-4 space-y-1.5 bg-[#111827] rounded-xl border border-slate-800 p-3 max-h-[600px] overflow-y-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 py-1 block">
            13 Core AI Foundations Concepts
          </span>
          {concepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => setSelectedConcept(concept.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                selectedConcept === concept.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="truncate">{concept.title}</span>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedConcept === concept.id ? 'text-cyan-400' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>

        {/* Right Column: Detailed Explanation Card */}
        <div className="lg:col-span-8 bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          {(() => {
            const active = concepts.find(c => c.id === selectedConcept) || concepts[0];
            return (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                    Academic Definition &bull; Concept Analysis
                  </span>
                  <h2 className="text-lg font-bold text-white font-mono mt-1">
                    {active.title}
                  </h2>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-300">
                  {active.summary}
                </div>

                <div className="text-slate-300 text-xs leading-relaxed space-y-3 font-sans">
                  <p>{active.body}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Algorithm Pseudocode Library */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Code Tabs Header */}
        <div className="p-4 bg-[#0E1526] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider">
              Algorithm Implementation Pseudocode
            </h3>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto text-xs font-mono">
            {[
              { id: 'bdi', label: '1. Agent BDI Loop' },
              { id: 'centralized', label: '2. Central Dispatch' },
              { id: 'cnp', label: '3. Contract Net (CNP)' },
              { id: 'astar', label: '4. A* Pathfinding' },
              { id: 'resource', label: '5. Mutex Reservation' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCodeTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeCodeTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewport */}
        <div className="p-5 bg-[#0A0E1A] overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed">
          <pre className="text-emerald-400/90 whitespace-pre">
            {pseudocodes[activeCodeTab]}
          </pre>
        </div>
      </div>
    </div>
  );
}
