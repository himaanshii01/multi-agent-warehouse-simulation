# WAREHOUSE AI: Multi-Agent Warehouse Coordination & Intelligent Task Allocation System

A complete, interactive simulation web application built for an **Artificial Intelligence Foundations** university project.

The application simulates multiple autonomous mobile robots (AMRs) cooperating in a high-density warehouse environment to fulfill customer orders. The robots perceive their local environment, make autonomous decisions, bid for tasks, negotiate shared critical bottlenecks, plan collision-free paths using A*, and gracefully recover from hardware failures.

---

## 🌟 Key Features

1. **Two Genuinely Different AI Task Allocation Paradigms**:
   - **Mode A: Centralized Dispatch**: An omniscient warehouse master controller evaluates a global cost matrix across all available robots and unassigned orders using:
     $$\text{Cost}(R_i, O_j) = 1.0 \times \text{Dist}(R_i, \text{Pickup}_j) + 0.4 \times \text{Dist}(\text{Pickup}_j, \text{Dock}_j) + 0.2 \times (100 - \text{Battery}_i) - \text{PriorityBonus}$$
     Executes greedy minimum-cost matching with minimal message overhead ($O(1)$ per task).
   - **Mode B: Decentralized Contract Net Protocol (FIPA CNP)**: A market-based distributed auction system where the auctioneer broadcasts a Call For Proposals (CFP). Each robot autonomously calculates its private bid based on battery reserves, distance, and workload. The contract is awarded to the lowest-cost bidder with formal award, rejection, and acknowledgment messages ($O(N)$ message complexity).

2. **A\* Collision-Free Path Planning**:
   - Computes mathematically optimal grid routes using an admissible **Manhattan Distance** heuristic:
     $$h(n) = |x_1 - x_2| + |y_1 - y_2|$$
   - Respects permanent storage racks, structural obstacles, and dynamic robot paths.

3. **Multi-Agent Dynamic Collision Avoidance**:
   - **Vertex Collision Prevention**: Detects when two robots attempt to occupy the exact same cell simultaneously; resolves conflicts via dynamic priority arbitration.
   - **Head-On Edge/Swap Collision Prevention**: Detects when two robots attempt to cross paths in a narrow corridor; commands the lower-priority robot to yield or triggers dynamic A* re-planning.

4. **Shared Resource Negotiation (Mutual Exclusion)**:
   - Dedicated mutex arbitration for narrow corridors (e.g., Central Choke Corridor C-1), busy intersections (INT-1, INT-2), and shipping docks.
   - Priority queue with anti-starvation dynamic priority boosting:
     $$\text{Priority} = \text{UrgencyScore} + 2 \times \text{WaitTicks} + \text{BatteryUrgency}$$

5. **Fault Tolerance & Robustness Testing**:
   - Operators can inject simulated hardware/motor lock failures into any active robot.
   - The system automatically reclaims in-flight orders, purges held mutex locks, and reallocates the task to an available peer.

6. **Automated Head-to-Head Scientific Benchmark**:
   - Resettable laboratory runner that executes both strategies consecutively using the exact same deterministic seed orders, warehouse matrix, and robot positions.
   - Measures real empirical metrics: Throughput, Average Turnaround Latency, Communication Overhead, Total Distance, and Fleet Utilization.

7. **Interactive Visual Dashboard**:
   - High-performance HTML5 Canvas grid (22 × 15) with animated AMRs, battery rings, cargo payloads, route trajectories, and hover tooltips.
   - Real-time industrial telemetry console with category filters (`TASK`, `BID`, `COLLISION`, `RESOURCE`, `BATTERY`, `FAILURE`).
   - Recharts time-series performance graphs.

---

## 🏗️ Architecture & Module Organization

```
Warehouse_n/
├── src/
│   ├── simulation/
│   │   ├── WarehouseGridModel.js   # 2D grid matrix, cell types, SKU catalog
│   │   ├── Pathfinding.js          # A* algorithm with Manhattan heuristic
│   │   ├── RobotAgent.js           # Autonomous BDI agent loop (Perception -> Decision -> Action)
│   │   ├── CentralizedDispatcher.js# Mode A: Master controller cost matrix matching
│   │   ├── ContractNetProtocol.js  # Mode B: FIPA auction & proposal evaluation
│   │   ├── CollisionManager.js     # Vertex & swap collision resolution
│   │   ├── ResourceManager.js      # Shared bottleneck mutex arbitration
│   │   ├── OrderManager.js         # Order queues, priorities, benchmark seeding
│   │   └── SimulationEngine.js     # Discrete-event simulation coordinator
│   ├── components/
│   │   ├── WarehouseCanvas.jsx     # High-DPI HTML5 Canvas grid visualizer
│   │   ├── Sidebar.jsx             # Navigation & active coordination mode toggle
│   │   ├── Navbar.jsx              # Simulation play/pause, step, speed controls
│   │   ├── RobotCard.jsx           # Individual AMR card & fault injection controls
│   │   ├── OrderPanel.jsx          # Order pipeline backlog & completed orders
│   │   ├── BiddingPanel.jsx        # Live Contract Net Protocol auction inspector
│   │   ├── ResourcePanel.jsx       # Mutex status & arbitration priority queues
│   │   ├── EventLog.jsx            # Filterable industrial telemetry console
│   │   ├── CustomOrderModal.jsx    # Custom SKU payload dispatch dialog
│   │   └── BenchmarkModal.jsx      # Scientific side-by-side experiment runner
│   ├── pages/
│   │   ├── Overview.jsx            # Executive operational dashboard
│   │   ├── LiveSimulation.jsx      # Full-screen simulation command center
│   │   ├── RobotFleet.jsx          # AMR fleet diagnostics & fault injector
│   │   ├── OrderManagement.jsx     # Backlog table & priority adjuster
│   │   ├── TaskAllocation.jsx      # Centralized vs Decentralized deep dive
│   │   ├── PerformanceAnalytics.jsx# Empirical Recharts telemetry charts
│   │   └── AIExplanation.jsx       # 13 AI concepts, flowchart & pseudocode
│   ├── App.jsx                     # Root application container
│   ├── main.jsx                    # React 18 bootstrap
│   └── index.css                   # Tailwind CSS directives & robotics styling
├── test_simulation.js              # Unit tests for simulation algorithms
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind custom theme colors & typography
└── package.json                    # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Installation
Install the project dependencies locally:
```bash
npm install
```

### 2. Run Local Development Server
Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Run Automated Simulation Tests
Execute the simulation validation suite to verify A* pathfinding, Contract Net Protocol, Centralized matching, and fault tolerance:
```bash
npm test
```

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```

---

## 🎓 Guide for Demonstration to Professor

When presenting this project to your professor, follow this structured walkthrough:

1. **Executive Overview (`Overview Dashboard`)**:
   - Highlight the 6 real-time KPI metrics (Active Fleet, Delivered Orders, Avg Latency, Message Overhead, Collisions Avoided, Utilization %).
   - Point out that all data is calculated dynamically from the running simulation loop, not static mock data.

2. **Autonomous Navigation & A\* Paths (`Live Simulation`)**:
   - Click **Start Sim** in the navbar.
   - Point out the glowing dashed trajectories ahead of each robot: these represent the live calculated A* path.
   - Hover over cells to show the cell inspector tooltip.
   - Click on any robot to view its real-time telemetry.

3. **Task Allocation Comparison (`Task Allocation` & `Compare AI` button)**:
   - Switch between **Centralized Dispatch** and **Contract Net Protocol**.
   - Show how Centralized Dispatch computes a global cost matrix ($C_{i,j}$) with only 1 message per dispatch.
   - Switch to Contract Net Protocol: show the **CNP Bids** tab where robots receive CFPs and submit competitive bids based on distance and battery reserves. Note how communication overhead increases to $O(N)$ messages per task.
   - Click the **Compare Strategies** button in the navbar to run the automated head-to-head benchmark on 10 identical seeded orders.

4. **Dynamic Collision Avoidance & Shared Mutexes**:
   - Show how robots entering the narrow corridors (e.g., Central Choke Corridor C-1) request a mutex grant in the **Resources** panel.
   - Explain how head-on swap collisions and vertex collisions are resolved by yielding right-of-way according to task urgency and battery level.

5. **Robustness & Fault Tolerance (`Robot Fleet`)**:
   - Go to the **Robot Fleet** tab and click **Simulate Failure** on a robot currently executing a delivery.
   - Show how the system logs the fault, reclaims the in-flight order, purges any locked resources, and re-dispatches the task to an available peer.
   - Click **Recover** to bring the robot back online.

6. **Academic Rigor (`AI System Guide`)**:
   - Show the 13 foundational AI concepts, the interactive fulfillment flowchart, and the algorithm pseudocode for the BDI loop, Centralized Dispatch, Contract Net Protocol, A* search, and Mutex Reservation.
