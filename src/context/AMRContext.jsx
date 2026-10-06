import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  planAStarPath,
  isPointBlocked,
  STATIC_OCCUPIED_ZONES,
  STATIC_OBSTACLES,
  ROBOT_RADIUS,
  SAFETY_MARGIN,
  TOTAL_CLEARANCE
} from '../utils/pathPlanner';

const AMRContext = createContext();

export const OCCUPIED_ZONES = STATIC_OCCUPIED_ZONES;

export const DESTINATIONS = {
  'Station A':        { x: 20, y: 70, name: 'Station A',          zone: 'Zone A',       posX: 8.2,  posY: 4.6  },
  'Station B':        { x: 80, y: 30, name: 'Station B',          zone: 'Zone B',       posX: 10.5, posY: 6.1  },
  'Charging Station': { x: 15, y: 20, name: 'Charging Station',   zone: 'Power Hub',    posX: 4.8,  posY: 1.2  },
  'Storage Area':     { x: 75, y: 80, name: 'Storage Area',       zone: 'Zone C',       posX: 7.1,  posY: 8.3  },
  'Home Base':        { x: 12, y: 78, name: 'Home Base',          zone: 'Docking Base', posX: 1.5,  posY: 2.3  }
};

export const SAVED_LOCATIONS = [
  { id: 'home', label: 'Home Base',     posX: 1.5,  posY: 2.3,  gridX: 12, gridY: 78, destKey: 'Home Base' },
  { id: 'dock', label: 'Charging Dock', posX: 4.8,  posY: 1.2,  gridX: 15, gridY: 20, destKey: 'Charging Station' },
  { id: 'sta',  label: 'Station A',     posX: 8.2,  posY: 4.6,  gridX: 20, gridY: 70, destKey: 'Station A' },
  { id: 'stb',  label: 'Station B',     posX: 10.5, posY: 6.1,  gridX: 80, gridY: 30, destKey: 'Station B' }
];

export const INITIAL_OBSTACLES = [...STATIC_OBSTACLES];

// Helper: Calculate path Euclidean distance
const calcDist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const AMRProvider = ({ children }) => {
  // Connection & System State
  const [isRobotConnected, setIsRobotConnected] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [eStopActive, setEStopActive] = useState(false);
  const [activeTab, setActiveTab] = useState('RobotStatus');

  // Robot State
  const [mode, setMode] = useState('AUTO'); // 'AUTO' | 'MANUAL'
  const [status, setStatus] = useState('IDLE');
  const [battery, setBattery] = useState(82);
  const [speed, setSpeed] = useState(0.5);
  const [targetSpeed, setTargetSpeed] = useState(0.5);
  const [angularSpeed, setAngularSpeed] = useState(0.3);
  const [location, setLocation] = useState('Zone A');

  // Position: starts at (20, 20.75) which gives X: 2.55m, Y: 1.66m
  const [robotPos, setRobotPos] = useState({ x: 20, y: 20.75, angle: 286 });
  const [destinationKey, setDestinationKey] = useState('Station B');
  const [destinationReached, setDestinationReached] = useState(false);

  // Obstacles & Occupied Zones state
  const [activeObstacles, setActiveObstacles] = useState([...INITIAL_OBSTACLES]);
  const [hasObstacle, setHasObstacle] = useState(false);
  const [dynamicObstacle, setDynamicObstacle] = useState(null);
  const [oldPathPoints, setOldPathPoints] = useState(null);

  // Single Source of Truth for Route: computed dynamically via A*
  const [pathPoints, setPathPoints] = useState(() => {
    const initialRoute = planAStarPath({ x: 20, y: 20.75 }, DESTINATIONS['Station B'], INITIAL_OBSTACLES, STATIC_OCCUPIED_ZONES);
    return initialRoute || [{ x: 20, y: 20.75 }, { x: 80, y: 30 }];
  });
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

  // Visual Path Feedback State: 'safe' | 'blocked' | 'rerouting' | 'new_route' | 'unreachable'
  const [aiFeedbackState, setAiFeedbackState] = useState('safe');
  const [manualCollisionWarning, setManualCollisionWarning] = useState('');

  // Imported map
  const [importedMapName, setImportedMapName] = useState('Warehouse Map');
  const [importedMapImg, setImportedMapImg] = useState(null);

  // Live Telemetry initial values
  const [linearVelocity, setLinearVelocity] = useState(0.33);
  const [angularVelocity, setAngularVelocity] = useState(-0.08);
  const [heading, setHeading] = useState(-74);

  // AI Route planning status & stats
  const [aiPlanStatus, setAiPlanStatus] = useState('ready');
  const [routeInfo, setRouteInfo] = useState({
    distance: '14.2',
    eta: '00:22',
    waypoints: 5
  });

  // Navigation metrics
  const [distanceRemaining, setDistanceRemaining] = useState('14.2');
  const [currentWaypointDisplay, setCurrentWaypointDisplay] = useState('1 / 5');

  // Sensors
  const [sensors, setSensors] = useState({
    obstacle: 'Safe',
    lidar: 'Active',
    motor: 'Normal',
    battery: 'Good'
  });

  // Mission
  const [mission, setMission] = useState({
    title: 'Deliver package to Station B',
    progress: 40,
    currentStep: 'Moving to Station B',
    etaSeconds: 22,
    totalEta: 30
  });

  // AI Assistant Chat Messages (preserved)
  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: 'bot', text: 'Robot initialized and connected.', time: '10:00 AM' },
    { id: 2, sender: 'bot', text: 'Path is clear to Station B.', time: '10:01 AM' },
    { id: 3, sender: 'bot', text: 'Battery level is good (82%).', time: '10:02 AM' },
    { id: 4, sender: 'bot', text: 'No obstacle detected.', time: '10:03 AM' }
  ]);

  const [aiNavStatus, setAiNavStatus] = useState('Ready');

  // Refs for animation loop consistency
  const stateRef = useRef({
    status,
    pathPoints,
    currentWaypointIndex,
    targetSpeed,
    angularSpeed,
    eStopActive,
    destinationKey
  });

  useEffect(() => {
    stateRef.current = {
      status,
      pathPoints,
      currentWaypointIndex,
      targetSpeed,
      angularSpeed,
      eStopActive,
      destinationKey
    };
  }, [status, pathPoints, currentWaypointIndex, targetSpeed, angularSpeed, eStopActive, destinationKey]);

  // Helper to compute route metrics
  const calcRouteMetrics = (points) => {
    if (!points || points.length < 2) {
      return { distance: '0.0', eta: '00:00', waypoints: 0, totalDist: 0 };
    }
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += calcDist(points[i], points[i + 1]);
    }
    const distMeters = (total * 0.22).toFixed(1);
    const etaSec = Math.round(total * 0.35);
    return {
      distance: distMeters,
      eta: `${String(Math.floor(etaSec / 60)).padStart(2, '0')}:${String(etaSec % 60).padStart(2, '0')}`,
      waypoints: points.length,
      totalDist: total
    };
  };

  // AI Assistant helper
  const addAIMessage = (text, sender = 'bot') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiMessages(prev => [...prev, { id: Date.now(), sender, text, time: timeStr }]);
  };

  // Emergency STOP
  const triggerEmergencyStop = () => {
    setEStopActive(true);
    setStatus('STOPPED');
    setSpeed(0);
    setLinearVelocity(0);
    setAngularVelocity(0);
    setSensors(prev => ({ ...prev, motor: 'E-STOPPED' }));
    addAIMessage('🚨 EMERGENCY STOP ENGAGED! All AMR motion halted immediately.', 'bot');
  };

  const resetEmergencyStop = () => {
    setEStopActive(false);
    setStatus('IDLE');
    setSpeed(targetSpeed);
    setSensors(prev => ({ ...prev, motor: 'Normal' }));
    addAIMessage('✅ Emergency stop cleared. AMR returned to READY state.', 'bot');
  };

  // Dynamic A* Path Planning (Single Source of Truth)
  const planAIRoute = () => {
    setAiPlanStatus('planning');
    setDestinationReached(false);
    const dest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];

    setTimeout(() => {
      // Calculate collision-free route using A* avoiding all obstacles and occupied zones!
      const safePath = planAStarPath(robotPos, dest, activeObstacles, STATIC_OCCUPIED_ZONES);

      if (!safePath) {
        setAiFeedbackState('unreachable');
        setAiPlanStatus('done');
        addAIMessage('🔴 Destination unreachable — No collision-free path available.', 'bot');
        return;
      }

      setPathPoints(safePath);
      setCurrentWaypointIndex(0);
      setAiFeedbackState('safe');
      setAiPlanStatus('done');

      const metrics = calcRouteMetrics(safePath);
      setRouteInfo(metrics);
      setDistanceRemaining(metrics.distance);
      setCurrentWaypointDisplay(`1 / ${safePath.length}`);
      addAIMessage(`🟢 Safe route found to ${dest.name} (${metrics.distance} m, ${safePath.length} waypoints). Avoiding all occupied areas.`);
    }, 600);
  };

  // Set Destination Goal (Updates destination and immediately computes collision-free route)
  const setGoalAndSyncRoute = (destKey) => {
    const dest = DESTINATIONS[destKey];
    if (!dest) return;
    setDestinationKey(destKey);
    setDestinationReached(false);

    // Run collision-free A* planner from current robot position
    const safePath = planAStarPath(robotPos, dest, activeObstacles, STATIC_OCCUPIED_ZONES);
    if (!safePath) {
      setAiFeedbackState('unreachable');
      addAIMessage(`🔴 ${dest.name} is unreachable due to surrounding obstacles.`);
      return;
    }

    setPathPoints(safePath);
    setCurrentWaypointIndex(0);
    setAiFeedbackState('safe');
    setOldPathPoints(null);

    const metrics = calcRouteMetrics(safePath);
    setRouteInfo(metrics);
    setDistanceRemaining(metrics.distance);
    setCurrentWaypointDisplay(`1 / ${safePath.length}`);
  };

  // Set Robot Pose directly (e.g., place at Charging Station)
  const setRobotPose = (newPos) => {
    setRobotPos(prev => ({ ...prev, ...newPos }));
    setDestinationReached(false);
    setOldPathPoints(null);
    const dest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];
    const safePath = planAStarPath(newPos, dest, activeObstacles, STATIC_OCCUPIED_ZONES);
    if (safePath) {
      setPathPoints(safePath);
      setCurrentWaypointIndex(0);
      const metrics = calcRouteMetrics(safePath);
      setRouteInfo(metrics);
      setDistanceRemaining(metrics.distance);
      setCurrentWaypointDisplay(`1 / ${safePath.length}`);
      setAiFeedbackState('safe');
    }
  };

  // Start Auto Navigation
  const startNavigation = () => {
    if (eStopActive) {
      addAIMessage('Cannot start navigation while Emergency STOP is active!', 'bot');
      return;
    }
    setDestinationReached(false);
    setMode('AUTO');
    const dest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];

    // Ensure valid collision-free path exists
    let activePath = pathPoints;
    if (activePath.length < 2 || calcDist(activePath[0], robotPos) > 2) {
      activePath = planAStarPath(robotPos, dest, activeObstacles, STATIC_OCCUPIED_ZONES);
      if (!activePath) {
        setAiFeedbackState('unreachable');
        addAIMessage('Cannot start: Destination unreachable.');
        return;
      }
      setPathPoints(activePath);
    }

    setCurrentWaypointIndex(0);
    setStatus('MOVING');
    setSpeed(targetSpeed);
    setLinearVelocity(parseFloat((targetSpeed * 0.55).toFixed(2)));
    setAiNavStatus('Navigating');
    setAiFeedbackState('safe');

    const metrics = calcRouteMetrics(activePath);
    setRouteInfo(metrics);
    setDistanceRemaining(metrics.distance);
    setCurrentWaypointDisplay(`1 / ${activePath.length}`);

    setMission({
      title: `Deliver to ${destinationKey}`,
      progress: 5,
      currentStep: `Moving to ${destinationKey}`,
      etaSeconds: Math.round(metrics.totalDist * 0.35),
      totalEta: Math.round(metrics.totalDist * 0.35)
    });
    addAIMessage(`Starting autonomous navigation to ${dest.name}. Following safe designated route.`);
  };

  const pauseNavigation = () => {
    if (status === 'MOVING') {
      setStatus('PAUSED');
      setLinearVelocity(0);
      setAngularVelocity(0);
      setAiNavStatus('Paused');
      addAIMessage('Navigation paused.', 'bot');
    } else if (status === 'PAUSED') {
      setStatus('MOVING');
      setLinearVelocity(parseFloat((targetSpeed * 0.55).toFixed(2)));
      setAiNavStatus('Navigating');
      addAIMessage('Resuming autonomous navigation.', 'bot');
    }
  };

  const cancelMission = () => {
    setStatus('IDLE');
    setLinearVelocity(0);
    setAngularVelocity(0);
    setAiNavStatus('Ready');
    setMission(prev => ({ ...prev, progress: 0, currentStep: 'Mission Stopped', etaSeconds: 0 }));
    addAIMessage('Navigation stopped.', 'bot');
  };

  const stopRobot = () => {
    setStatus('IDLE');
    setLinearVelocity(0);
    setAngularVelocity(0);
    setAiNavStatus('Ready');
    addAIMessage('Robot stopped.', 'bot');
  };

  // Manual Move (D-pad) with Real-Time Collision Prevention!
  const handleManualMove = (direction) => {
    if (eStopActive) return;
    setDestinationReached(false);
    setMode('MANUAL');

    const step = 3.2;
    let nextX = robotPos.x, nextY = robotPos.y, nextAngle = robotPos.angle;
    if (direction === 'UP')    { nextY = Math.max(5, robotPos.y - step);  nextAngle = 0;   setAngularVelocity(0); }
    if (direction === 'DOWN')  { nextY = Math.min(95, robotPos.y + step); nextAngle = 180; setAngularVelocity(0); }
    if (direction === 'LEFT')  { nextX = Math.max(5, robotPos.x - step);  nextAngle = 270; setAngularVelocity(-angularSpeed); }
    if (direction === 'RIGHT') { nextX = Math.min(95, robotPos.x + step); nextAngle = 90;  setAngularVelocity(angularSpeed); }

    // REAL-TIME COLLISION CHECK: Prevent driving into occupied areas or obstacles!
    if (isPointBlocked(nextX, nextY, activeObstacles, STATIC_OCCUPIED_ZONES, ROBOT_RADIUS)) {
      stopRobot();
      setManualCollisionWarning('⚠ Obstacle Ahead — Movement Blocked');
      setTimeout(() => setManualCollisionWarning(''), 2500);
      addAIMessage('⚠ Obstacle Ahead! Collision prevention engaged.', 'bot');
      return;
    }

    setManualCollisionWarning('');
    setStatus('MOVING');
    setLinearVelocity(parseFloat((targetSpeed * 0.5).toFixed(2)));

    const dispH = nextAngle > 180 ? nextAngle - 360 : nextAngle;
    setHeading(dispH);

    setRobotPos({ x: nextX, y: nextY, angle: nextAngle });

    // Anchor start of existing planned route to current position
    setPathPoints(pts => {
      if (pts.length >= 2) {
        const updated = [...pts];
        updated[0] = { x: nextX, y: nextY };
        return updated;
      }
      return pts;
    });
  };

  // Add Dynamic Obstacle + Trigger Instant Collision-Free Re-Routing!
  const addDynamicObstacle = () => {
    const dest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];
    // Preserve old path before re-routing for visual CAD comparison
    if (pathPoints && pathPoints.length >= 2) {
      setOldPathPoints([...pathPoints]);
    }

    // Place obstacle directly ahead on the active corridor
    let obsX, obsY;
    if (robotPos.y < 40 && dest.y < 40) {
      obsX = 48; obsY = 20; // North corridor block
    } else if (robotPos.y > 60 && dest.y > 60) {
      obsX = 48; obsY = 70; // South corridor block
    } else {
      obsX = Number(((robotPos.x + dest.x) / 2).toFixed(1));
      obsY = Number(((robotPos.y + dest.y) / 2).toFixed(1));
    }

    const newObs = { id: Date.now(), x: obsX, y: obsY, width: 8, height: 8, radius: 4, label: 'Dynamic Obstacle', active: true };
    const updatedObstacles = [...activeObstacles.filter(o => o.id !== newObs.id), newObs];

    setActiveObstacles(updatedObstacles);
    setDynamicObstacle(newObs);
    setHasObstacle(true);
    setSensors(prev => ({ ...prev, obstacle: 'WARNING' }));

    const wasMoving = status === 'MOVING';
    if (wasMoving) {
      setStatus('REROUTING');
      setLinearVelocity(0); // Immediately STOP or SLOW the robot!
    }

    // Step 1: ⚠ Obstacle Detected / ⚠ Path Blocked
    setAiFeedbackState('blocked');
    setAiPlanStatus('rerouting');
    addAIMessage('⚠ Obstacle Detected on route! Halting robot.');

    // Step 2: 🔄 Recalculating route...
    setTimeout(() => {
      setAiFeedbackState('rerouting');
      addAIMessage('🔄 AI Recalculating route from current position...');

      // Step 3: Run A* planner from current robot position avoiding new obstacle + all occupied zones!
      setTimeout(() => {
        const newSafeRoute = planAStarPath(robotPos, dest, updatedObstacles, STATIC_OCCUPIED_ZONES);

        if (!newSafeRoute) {
          setAiFeedbackState('unreachable');
          setStatus('IDLE');
          addAIMessage('🔴 Destination unreachable — No alternative path available.');
          return;
        }

        // Replace old route with NEW safe route!
        setPathPoints(newSafeRoute);
        setCurrentWaypointIndex(0);

        const metrics = calcRouteMetrics(newSafeRoute);
        setRouteInfo(metrics);
        setDistanceRemaining(metrics.distance);
        setCurrentWaypointDisplay(`1 / ${newSafeRoute.length}`);

        // Step 4: 🟢 New safe route found!
        setAiFeedbackState('new_route');
        setSensors(prev => ({ ...prev, obstacle: 'Safe' }));
        setAiPlanStatus('done');

        if (wasMoving) {
          setStatus('MOVING');
          setLinearVelocity(parseFloat((targetSpeed * 0.55).toFixed(2)));
        }
        addAIMessage('🟢 New safe route found. AMR continuing along avoidance trajectory.', 'bot');
      }, 700);
    }, 700);
  };

  // Clear Map / Reset
  const clearMapObstacles = () => {
    setActiveObstacles([...INITIAL_OBSTACLES]);
    setDynamicObstacle(null);
    setOldPathPoints(null);
    setHasObstacle(false);
    setSensors(prev => ({ ...prev, obstacle: 'Safe' }));
    setDestinationReached(false);
    const dest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];
    const cleanRoute = planAStarPath(robotPos, dest, INITIAL_OBSTACLES, STATIC_OCCUPIED_ZONES);
    if (cleanRoute) {
      setPathPoints(cleanRoute);
      setCurrentWaypointIndex(0);
      const metrics = calcRouteMetrics(cleanRoute);
      setRouteInfo(metrics);
      setDistanceRemaining(metrics.distance);
      setCurrentWaypointDisplay(`1 / ${cleanRoute.length}`);
      setAiFeedbackState('safe');
    }
    setAiPlanStatus('ready');
    addAIMessage('Map reset to initial state. Obstacles cleared.', 'bot');
  };

  // Import Map
  const handleImportMap = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImportedMapImg(e.target.result);
      setImportedMapName(file.name.replace(/\.[^.]+$/, ''));
      addAIMessage(`✅ Map "${file.name}" imported. Localized inside AMR map.`, 'bot');
    };
    reader.readAsDataURL(file);
  };

  // ─── STRICT WAYPOINT PURSUIT ENGINE (100% on the A* route) ─────────────────
  useEffect(() => {
    if (status !== 'MOVING' || eStopActive || pathPoints.length < 2) return;

    const interval = setInterval(() => {
      const { pathPoints: pts, currentWaypointIndex: curIdx, targetSpeed: tSpeed } = stateRef.current;
      const targetPt = pts[curIdx + 1];

      if (!targetPt) {
        setStatus('IDLE');
        setLinearVelocity(0);
        setAngularVelocity(0);
        setDestinationReached(true);
        setAiNavStatus('Destination Reached');
        setMission(m => ({ ...m, progress: 100, etaSeconds: 0 }));
        setCurrentWaypointDisplay(`${pts.length} / ${pts.length}`);
        setDistanceRemaining('0.0');
        try { confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } }); } catch {}
        return;
      }

      setRobotPos(prev => {
        const dx = targetPt.x - prev.x;
        const dy = targetPt.y - prev.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);

        // Segment angle (0 deg = North)
        const targetAngle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;

        // Smooth turn towards segment heading, scaled dynamically by angularSpeed
        const aSpeed = stateRef.current.angularSpeed || 0.3;
        const angleDiff = ((targetAngle - prev.angle + 180) % 360) - 180;
        const maxTurn = Math.max(5, aSpeed * 65);
        const turnStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);
        const newAngle = (prev.angle + turnStep + 360) % 360;

        const dispHeading = Math.round(newAngle > 180 ? newAngle - 360 : newAngle);
        setHeading(dispHeading);

        // Live real-time speeds
        const isTurning = Math.abs(angleDiff) > 2;
        const liveAngVel = isTurning
          ? parseFloat((aSpeed * 0.60).toFixed(2))
          : 0.00;
        setAngularVelocity(liveAngVel);
        setLinearVelocity(parseFloat(((tSpeed || 0.5) * 0.84).toFixed(2)));

        const step = (tSpeed || 0.5) * 0.45;
        let nextX, nextY;

        if (distToTarget <= step) {
          nextX = targetPt.x;
          nextY = targetPt.y;
          const nextIdx = curIdx + 1;
          setCurrentWaypointIndex(nextIdx);

          if (nextIdx + 1 >= pts.length) {
            setStatus('IDLE');
            setLinearVelocity(0);
            setAngularVelocity(0);
            setDestinationReached(true);
            setAiNavStatus('Destination Reached');
            setMission(m => ({ ...m, progress: 100, etaSeconds: 0 }));
            setCurrentWaypointDisplay(`${pts.length} / ${pts.length}`);
            setDistanceRemaining('0.0');
            try { confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } }); } catch {}
          } else {
            setCurrentWaypointDisplay(`${nextIdx + 1} / ${pts.length}`);
          }
        } else {
          nextX = prev.x + (dx / distToTarget) * step;
          nextY = prev.y + (dy / distToTarget) * step;
        }

        // Cumulative path metrics
        let totalPathDist = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          totalPathDist += calcDist(pts[i], pts[i + 1]);
        }

        let remainingDist = calcDist({ x: nextX, y: nextY }, targetPt);
        for (let i = curIdx + 1; i < pts.length - 1; i++) {
          remainingDist += calcDist(pts[i], pts[i + 1]);
        }

        const traveledDist = Math.max(0, totalPathDist - remainingDist);
        const progressPct = totalPathDist > 0
          ? Math.min(99, Math.max(5, Math.round((traveledDist / totalPathDist) * 100)))
          : 50;

        setMission(m => ({
          ...m,
          progress: progressPct,
          etaSeconds: Math.max(0, Math.ceil(remainingDist * 0.35))
        }));
        setDistanceRemaining((remainingDist * 0.22).toFixed(1));
        setBattery(b => Math.max(5, Number((b - 0.02).toFixed(1))));

        return { x: nextX, y: nextY, angle: newAngle };
      });
    }, 70);

    return () => clearInterval(interval);
  }, [status, eStopActive, pathPoints]);

  // Demo Mode Loop
  useEffect(() => {
    if (!isDemoMode || eStopActive) return;
    const destKeys = ['Station A', 'Station B', 'Charging Station', 'Storage Area'];
    let keyIdx = 0;
    const demoInterval = setInterval(() => {
      if (status === 'IDLE') {
        const nextKey = destKeys[keyIdx % destKeys.length];
        keyIdx++;
        setGoalAndSyncRoute(nextKey);
        setMode('AUTO');
        setTimeout(() => startNavigation(), 800);
      }
    }, 11000);
    return () => clearInterval(demoInterval);
  }, [isDemoMode, status, eStopActive]);

  // AI Command Parser (maintained)
  const sendAICommand = (userInput) => {
    if (!userInput.trim()) return;
    addAIMessage(userInput, 'user');
    const inputLower = userInput.toLowerCase();
    setTimeout(() => {
      if (inputLower.includes('stop') || inputLower.includes('halt') || inputLower.includes('pause')) {
        stopRobot();
        addAIMessage('Understood. Stopping AMR immediately.', 'bot');
      } else if (inputLower.includes('station a')) {
        setGoalAndSyncRoute('Station A');
        addAIMessage('Setting destination to Station A. Initiating Smart Navigation...', 'bot');
        setTimeout(() => startNavigation(), 500);
      } else if (inputLower.includes('station b')) {
        setGoalAndSyncRoute('Station B');
        addAIMessage('Setting destination to Station B. Initiating Smart Navigation...', 'bot');
        setTimeout(() => startNavigation(), 500);
      } else if (inputLower.includes('charging') || inputLower.includes('charge')) {
        setGoalAndSyncRoute('Charging Station');
        addAIMessage('Routing AMR to Charging Station Power Hub.', 'bot');
        setTimeout(() => startNavigation(), 500);
      } else if (inputLower.includes('storage')) {
        setGoalAndSyncRoute('Storage Area');
        addAIMessage('Routing AMR to Storage Area.', 'bot');
        setTimeout(() => startNavigation(), 500);
      } else if (inputLower.includes('battery') || inputLower.includes('power')) {
        addAIMessage(`Current battery level is ${battery}% (${battery > 30 ? 'Good condition' : 'Low power'}).`, 'bot');
      } else if (inputLower.includes('speed') || inputLower.includes('fast') || inputLower.includes('slow')) {
        addAIMessage(`Current AMR speed setting is ${targetSpeed} m/s. Mode: ${mode}.`, 'bot');
      } else if (inputLower.includes('obstacle') || inputLower.includes('avoid')) {
        addDynamicObstacle();
      } else {
        addAIMessage(`Command "${userInput}" processed. All AMR telemetry nominal.`, 'bot');
      }
    }, 600);
  };

  return (
    <AMRContext.Provider
      value={{
        isRobotConnected, setIsRobotConnected,
        isDemoMode, setIsDemoMode,
        eStopActive, triggerEmergencyStop, resetEmergencyStop,
        activeTab, setActiveTab,
        mode, setMode,
        status, setStatus,
        battery, setBattery,
        speed, setSpeed,
        targetSpeed, setTargetSpeed,
        angularSpeed, setAngularSpeed,
        location, setLocation,
        robotPos, setRobotPos, setRobotPose,
        destinationKey, setDestinationKey,
        setGoalAndSyncRoute,
        destinationReached, setDestinationReached,
        pathPoints, setPathPoints,
        oldPathPoints, setOldPathPoints,
        currentWaypointIndex,
        hasObstacle, setHasObstacle,
        activeObstacles, setActiveObstacles,
        dynamicObstacle,
        aiFeedbackState, setAiFeedbackState,
        manualCollisionWarning,
        importedMapName, setImportedMapName,
        importedMapImg, setImportedMapImg,
        sensors, setSensors,
        mission, setMission,
        aiMessages,
        aiNavStatus,
        aiPlanStatus, setAiPlanStatus,
        routeInfo, setRouteInfo,
        distanceRemaining,
        currentWaypointDisplay,
        linearVelocity, angularVelocity, heading,
        startNavigation,
        pauseNavigation,
        cancelMission,
        stopRobot,
        handleManualMove,
        addDynamicObstacle,
        planAIRoute,
        clearMapObstacles,
        handleImportMap,
        sendAICommand,
        SAVED_LOCATIONS,
        OCCUPIED_ZONES
      }}
    >
      {children}
    </AMRContext.Provider>
  );
};

export const useAMR = () => useContext(AMRContext);
