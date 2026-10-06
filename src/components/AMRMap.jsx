import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line } from '@react-three/drei';
import { useAMR, DESTINATIONS } from '../context/AMRContext';
import {
  Upload, Trash2, Radio, Compass, ShieldAlert,
  Plus, Minus, RotateCw, Eye, Box, RotateCcw,
  Layers, CheckCircle2, AlertTriangle, Cpu
} from 'lucide-react';

// ─── 0. NATIVE 3D TEXT SPRITE BADGE (Zero React-DOM overhead, 100% WebGL) ────
function SpriteBadge({
  text,
  position,
  scale = [2.8, 0.7, 1],
  bgColor = 'rgba(15, 23, 42, 0.92)',
  textColor = '#38bdf8',
  borderColor = '#0284c7'
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 384, 96);

    // Rounded rectangle background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(6, 6, 372, 84, 18);
    } else {
      ctx.rect(6, 6, 372, 84);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Label Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 30px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 192, 48);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [text, bgColor, textColor, borderColor]);

  if (!texture) return null;

  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial map={texture} depthTest={false} transparent={true} />
    </sprite>
  );
}

// ─── 1. CAMERA CONTROLLER (Smooth Animated Transitions for FIT, Zoom, ⟳, TOP, 3D, RESET) ────
function CameraController({ viewMode, cameraCommand, controlsRef }) {
  const { camera } = useThree();
  const animTarget = useRef(null);

  useEffect(() => {
    if (!cameraCommand) return;
    const { type } = cameraCommand;
    const controls = controlsRef.current;
    if (!controls) return;

    if (type === 'FIT') {
      const targetPos = viewMode === '2d'
        ? new THREE.Vector3(0, 44, 0.001)
        : new THREE.Vector3(0, 26, 32);
      const targetLook = new THREE.Vector3(0, 0, 0);
      animTarget.current = { targetPos, targetLook };
    } else if (type === 'ZOOM_IN') {
      const curPos = camera.position.clone();
      const look = controls.target.clone();
      const dir = curPos.sub(look).multiplyScalar(0.78);
      const targetPos = look.clone().add(dir);
      animTarget.current = { targetPos, targetLook: look };
    } else if (type === 'ZOOM_OUT') {
      const curPos = camera.position.clone();
      const look = controls.target.clone();
      const dir = curPos.sub(look).multiplyScalar(1.25);
      const targetPos = look.clone().add(dir);
      animTarget.current = { targetPos, targetLook: look };
    } else if (type === 'ROTATE_45') {
      const curPos = camera.position.clone();
      const look = controls.target.clone();
      const relX = curPos.x - look.x;
      const relZ = curPos.z - look.z;
      const angle = Math.PI / 4; // 45 deg
      const newX = relX * Math.cos(angle) - relZ * Math.sin(angle);
      const newZ = relX * Math.sin(angle) + relZ * Math.cos(angle);
      const targetPos = new THREE.Vector3(look.x + newX, curPos.y, look.z + newZ);
      animTarget.current = { targetPos, targetLook: look };
    } else if (type === 'SET_MODE_TOP') {
      const targetPos = new THREE.Vector3(0, 44, 0.001);
      const targetLook = new THREE.Vector3(0, 0, 0);
      animTarget.current = { targetPos, targetLook };
    } else if (type === 'SET_MODE_3D') {
      const targetPos = new THREE.Vector3(0, 24, 28);
      const targetLook = new THREE.Vector3(0, 0, 0);
      animTarget.current = { targetPos, targetLook };
    } else if (type === 'RESET') {
      const targetPos = viewMode === '2d'
        ? new THREE.Vector3(0, 44, 0.001)
        : new THREE.Vector3(0, 24, 28);
      const targetLook = new THREE.Vector3(0, 0, 0);
      animTarget.current = { targetPos, targetLook };
    }
  }, [cameraCommand, viewMode, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!animTarget.current) return;
    const { targetPos, targetLook } = animTarget.current;
    const controls = controlsRef.current;
    if (!controls) return;

    const factor = Math.min(1, delta * 7.5);
    camera.position.lerp(targetPos, factor);
    controls.target.lerp(targetLook, factor);
    controls.update();

    if (camera.position.distanceTo(targetPos) < 0.06 && controls.target.distanceTo(targetLook) < 0.06) {
      camera.position.copy(targetPos);
      controls.target.copy(targetLook);
      controls.update();
      animTarget.current = null;
    }
  });

  return null;
}

// ─── 2. IMPORTED TEXTURE FLOOR (If user imports custom map image) ────────────
function ImportedFloorOverlay({ imageUrl }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [imageUrl]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[35.2, 35.2]} />
      <meshBasicMaterial map={texture} transparent opacity={0.5} />
    </mesh>
  );
}

// ─── 3. PERIMETER SLAM WALLS & CORNER ANCHORS ────────────────────────────────
function PerimeterWalls3D() {
  const wallH = 1.6;
  const wallThick = 0.28;
  const bound = 17.6; // Boundary matching warehouse envelope

  return (
    <group>
      {/* North Wall Segments (with center opening) */}
      <mesh position={[-9.5, wallH / 2, -bound]}>
        <boxGeometry args={[14, wallH, wallThick]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[9.5, wallH / 2, -bound]}>
        <boxGeometry args={[14, wallH, wallThick]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* South Wall Segments */}
      <mesh position={[-9.5, wallH / 2, bound]}>
        <boxGeometry args={[14, wallH, wallThick]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[9.5, wallH / 2, bound]}>
        <boxGeometry args={[14, wallH, wallThick]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* West Wall Segments */}
      <mesh position={[-bound, wallH / 2, -9.5]}>
        <boxGeometry args={[wallThick, wallH, 14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-bound, wallH / 2, 9.5]}>
        <boxGeometry args={[wallThick, wallH, 14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* East Wall Segments */}
      <mesh position={[bound, wallH / 2, -9.5]}>
        <boxGeometry args={[wallThick, wallH, 14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[bound, wallH / 2, 9.5]}>
        <boxGeometry args={[wallThick, wallH, 14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Corner Columns with luminous top beacons */}
      {[
        [-bound, bound],
        [bound, bound],
        [-bound, -bound],
        [bound, -bound]
      ].map(([px, pz], idx) => (
        <group key={idx} position={[px, 0, pz]}>
          <mesh position={[0, wallH / 2 + 0.1, 0]}>
            <boxGeometry args={[0.65, wallH + 0.2, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, wallH + 0.25, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* Wall Top Cyan Trim Highlights */}
      <mesh position={[0, wallH + 0.02, -bound]}>
        <boxGeometry args={[bound * 2, 0.05, 0.1]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, wallH + 0.02, bound]}>
        <boxGeometry args={[bound * 2, 0.05, 0.1]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-bound, wallH + 0.02, 0]}>
        <boxGeometry args={[0.1, 0.05, bound * 2]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[bound, wallH + 0.02, 0]}>
        <boxGeometry args={[0.1, 0.05, bound * 2]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ─── 4. STORAGE RACKS (3D Occupied Central Zone x:36-64, y:34-60) ────────────
function StorageRacks3D() {
  const rackRows = [
    { z: -4.4, label: 'RACK ROW 1' },
    { z: -1.2, label: 'RACK ROW 2' },
    { z: 2.0,  label: 'RACK ROW 3' }
  ];

  return (
    <group>
      {/* Floor Costmap Clearance Inflation Buffer */}
      <mesh position={[0, 0.02, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12.6, 11.6]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} />
      </mesh>

      {/* Yellow Caution Boundary Marking */}
      <mesh position={[0, 0.025, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.1, 6.25, 4]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.7} />
      </mesh>

      {/* 3 Storage Racks */}
      {rackRows.map((rack, rIdx) => (
        <group key={rIdx} position={[0, 0, rack.z]}>
          {/* Vertical Steel Posts (6 legs per rack) */}
          {[-4.6, 0, 4.6].map(px => (
            <React.Fragment key={px}>
              <mesh position={[px, 1.0, -0.9]}>
                <boxGeometry args={[0.15, 2.0, 0.15]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[px, 1.0, 0.9]}>
                <boxGeometry args={[0.15, 2.0, 0.15]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
              </mesh>
            </React.Fragment>
          ))}

          {/* Shelf Decks: Lower & Upper */}
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[9.5, 0.08, 1.9]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[9.5, 0.08, 1.9]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>

          {/* Stored Industrial Crates / Pallets (Lower Level) */}
          {[-3.4, -1.15, 1.15, 3.4].map((cx, cIdx) => (
            <mesh key={`low-${cIdx}`} position={[cx, 0.98, 0]}>
              <boxGeometry args={[1.5, 0.58, 1.4]} />
              <meshStandardMaterial
                color={cIdx % 2 === 0 ? '#0284c7' : '#ea580c'}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>
          ))}

          {/* Stored Industrial Crates / Pallets (Upper Level) */}
          {[-3.4, -1.15, 1.15, 3.4].map((cx, cIdx) => (
            <mesh key={`up-${cIdx}`} position={[cx, 1.78, 0]}>
              <boxGeometry args={[1.4, 0.58, 1.3]} />
              <meshStandardMaterial
                color={cIdx % 2 === 1 ? '#334155' : '#0369a1'}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Floating 3D Label Tag */}
      <SpriteBadge
        text="STORAGE RACKS [OCCUPIED]"
        position={[0, 2.7, -1.2]}
        scale={[4.2, 1.0, 1]}
        bgColor="rgba(15, 23, 42, 0.92)"
        textColor="#38bdf8"
        borderColor="#0284c7"
      />
    </group>
  );
}

// ─── 5. FIXED 3D STATIONS (Charging, Station A, Station B, Home Base, Storage) 
function Stations3D({ destinationKey }) {
  // Destination coordinates transformed: worldX = (x - 50)*0.4, worldZ = (y - 50)*0.4
  const stations = [
    { key: 'Charging Station', wx: -14.0, wz: -12.0, color: '#10b981', label: '⚡ CHARGE DOCK', scale: [3.4, 0.85, 1] },
    { key: 'Station A',        wx: -12.0, wz: 8.0,   color: '#a78bfa', label: 'STATION A',     scale: [2.8, 0.7, 1] },
    { key: 'Station B',        wx: 12.0,  wz: -8.0,  color: '#38bdf8', label: 'STATION B',     scale: [2.8, 0.7, 1] },
    { key: 'Storage Area',     wx: 10.0,  wz: 12.0,  color: '#fb923c', label: '📦 STORAGE',    scale: [2.8, 0.7, 1] },
    { key: 'Home Base',        wx: -15.2, wz: 11.2,  color: '#f43f5e', label: '⌂ HOME BASE',   scale: [2.8, 0.7, 1] }
  ];

  return (
    <group>
      {stations.map(sta => {
        const isTarget = sta.key === destinationKey;
        return (
          <group key={sta.key} position={[sta.wx, 0, sta.wz]}>
            {/* Dock Pad Floor Base */}
            <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.5, 32]} />
              <meshBasicMaterial color={isTarget ? sta.color : '#1e293b'} />
            </mesh>

            {/* Glowing Pad Edge Ring */}
            <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.4, 1.55, 32]} />
              <meshBasicMaterial color={sta.color} />
            </mesh>

            {/* Active Destination Floor Ring Glow */}
            {isTarget && (
              <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.8, 2.2, 32]} />
                <meshBasicMaterial color={sta.color} transparent opacity={0.35} />
              </mesh>
            )}

            {/* Terminal Column Post */}
            <mesh position={[0, 0.8, -1.25]}>
              <cylinderGeometry args={[0.09, 0.11, 1.6, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>

            {/* Terminal Beacon Light */}
            <mesh position={[0, 1.65, -1.25]}>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial
                color={sta.color}
                emissive={sta.color}
                emissiveIntensity={isTarget ? 2.0 : 0.6}
              />
            </mesh>

            {/* Active Light Column Beacon (reaches upwards if selected destination) */}
            {isTarget && (
              <mesh position={[0, 2.6, 0]}>
                <cylinderGeometry args={[0.15, 0.7, 5.2, 16]} />
                <meshBasicMaterial color={sta.color} transparent opacity={0.25} />
              </mesh>
            )}

            {/* Floating 3D Station Label Sprite */}
            <SpriteBadge
              text={sta.label}
              position={[0, 2.0, -1.25]}
              scale={isTarget ? [3.2, 0.8, 1] : sta.scale}
              bgColor={isTarget ? sta.color : 'rgba(15, 23, 42, 0.9)'}
              textColor="#ffffff"
              borderColor={isTarget ? '#ffffff' : sta.color}
            />
          </group>
        );
      })}
    </group>
  );
}

// ─── 6. OBSTACLES (Static Pallet Boxes & Dynamic Injected Obstacles) ─────────
function Obstacles3D({ activeObstacles }) {
  return (
    <group>
      {activeObstacles.filter(o => o.active).map(obs => {
        const wx = (obs.x - 50) * 0.4;
        const wz = (obs.y - 50) * 0.4;
        const isDynamic = obs.label === 'Dynamic Obstacle';
        const sizeW = (obs.width || 6) * 0.4;
        const sizeH = (obs.height || 6) * 0.4;
        const color = isDynamic ? '#ef4444' : '#f59e0b';

        return (
          <group key={obs.id} position={[wx, 0, wz]}>
            {/* Safety Clearance Buffer Ring on Floor */}
            <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[sizeW * 0.6, sizeW * 0.78, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.35} />
            </mesh>

            {/* Main Physical Obstacle Body */}
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[sizeW, 1.4, sizeH]} />
              <meshStandardMaterial
                color={isDynamic ? '#dc2626' : '#d97706'}
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>

            {/* Dark Top Lid Trim */}
            <mesh position={[0, 1.45, 0]}>
              <boxGeometry args={[sizeW * 0.95, 0.1, sizeH * 0.95]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>

            {/* Flashing Warning Beacon on Dynamic Obstacle */}
            {isDynamic && (
              <mesh position={[0, 1.65, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={2.5} />
              </mesh>
            )}

            {/* Floating 3D Warning Badge Sprite */}
            <SpriteBadge
              text={isDynamic ? '⚠ DYNAMIC OBSTACLE' : '⚠ PALLET BOX'}
              position={[0, 2.0, 0]}
              scale={[3.2, 0.8, 1]}
              bgColor={isDynamic ? '#dc2626' : '#d97706'}
              textColor="#ffffff"
              borderColor={isDynamic ? '#fca5a5' : '#fef08a'}
            />
          </group>
        );
      })}
    </group>
  );
}

// ─── 7. 3D NAVIGATION ROUTE (Solid Active & Inactive Old Dashed Re-route) ────
function NavigationRoute3D({ pathPoints, oldPathPoints, hasObstacle, aiFeedbackState }) {
  // Convert 2D waypoints to 3D floor vectors
  const activeLinePoints = useMemo(() => {
    if (!pathPoints || pathPoints.length < 2) return null;
    return pathPoints.map(p => [(p.x - 50) * 0.4, 0.06, (p.y - 50) * 0.4]);
  }, [pathPoints]);

  const oldLinePoints = useMemo(() => {
    if (!oldPathPoints || oldPathPoints.length < 2) return null;
    return oldPathPoints.map(p => [(p.x - 50) * 0.4, 0.05, (p.y - 50) * 0.4]);
  }, [oldPathPoints]);

  const showOldRoute = oldLinePoints && (aiFeedbackState === 'blocked' || aiFeedbackState === 'rerouting' || aiFeedbackState === 'new_route');

  return (
    <group>
      {/* ── OLD INACTIVE / BLOCKED ROUTE (Dashed with collision '✖' marker) ── */}
      {showOldRoute && (
        <group>
          <Line
            points={oldLinePoints}
            color="#ef4444"
            lineWidth={2.2}
            dashed={true}
            dashScale={1.5}
            dashSize={0.6}
            gapSize={0.4}
            opacity={0.65}
            transparent
          />
          {/* Collision marker at the midpoint or near the blocked zone */}
          {oldLinePoints.length > 2 && (
            <SpriteBadge
              text="✖ ROUTE BLOCKED"
              position={[
                oldLinePoints[Math.floor(oldLinePoints.length / 2)][0],
                0.8,
                oldLinePoints[Math.floor(oldLinePoints.length / 2)][2]
              ]}
              scale={[3.0, 0.75, 1]}
              bgColor="#dc2626"
              textColor="#ffffff"
              borderColor="#ffffff"
            />
          )}
        </group>
      )}

      {/* ── ACTIVE PLANNED ROUTE (Solid glowing orange / cyan line) ── */}
      {activeLinePoints && (
        <group>
          {/* Main 3D Line */}
          <Line
            points={activeLinePoints}
            color={hasObstacle ? '#f59e0b' : '#f97316'}
            lineWidth={3.8}
          />

          {/* Waypoint Nodes along the route */}
          {activeLinePoints.map((pt, idx) => (
            <mesh key={idx} position={pt}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshBasicMaterial color={idx === activeLinePoints.length - 1 ? '#38bdf8' : '#f97316'} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// ─── 8. 3D ROBOT MODEL (AMR with chassis, drive wheels, spinning LiDAR, LED) ─
function RobotModel3D({ robotPos, status, mode, speed, eStopActive, hasObstacle }) {
  const wheelsRef = useRef([]);
  const lidarRef = useRef();

  // World coordinates:
  // worldX = (robotPos.x - 50) * 0.4
  // worldZ = (robotPos.y - 50) * 0.4
  // heading rotation around Y:
  // 0° = North (-Z), 90° = East (+X) -> rotationY = -(robotPos.angle * Math.PI) / 180
  const worldX = (robotPos.x - 50) * 0.4;
  const worldZ = (robotPos.y - 50) * 0.4;
  const rotY = -(robotPos.angle * Math.PI) / 180;

  useFrame((_, delta) => {
    // Continuously spin LiDAR dome
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 5;
    }

    // Spin drive wheels when moving
    if (status === 'MOVING' && !eStopActive) {
      const wheelRot = delta * (speed * 6);
      wheelsRef.current.forEach(w => {
        if (w) w.rotation.x += wheelRot;
      });
    }
  });

  // Determine LED color
  let ledColor = '#22c55e'; // Green Auto
  if (eStopActive) ledColor = '#ef4444'; // Red E-Stop
  else if (hasObstacle) ledColor = '#f59e0b'; // Amber Warning
  else if (mode === 'MANUAL') ledColor = '#3b82f6'; // Blue Manual

  return (
    <group position={[worldX, 0, worldZ]}>
      {/* ── Group for robot body rotated by heading ── */}
      <group rotation={[0, rotY, 0]}>
        {/* ── 1. FORWARD RADAR SCAN CONE (On floor projecting North/-Z relative to robot) ── */}
        <mesh position={[0, 0.035, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2.0, 3.8, 32, 1, false, Math.PI / 2 - 0.45, 0.9]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
        </mesh>

        {/* ── 2. AMR CHASSIS BODY ── */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.5, 0.36, 1.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Top Deck Metallic Accent Plate */}
        <mesh position={[0, 0.54, 0]}>
          <boxGeometry args={[1.4, 0.04, 1.0]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* ── 3. FORWARD HEADING ARROW (Direction indicator pointing to -Z) ── */}
        <mesh position={[0, 0.58, -0.45]}>
          <coneGeometry args={[0.18, 0.35, 3]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1} />
        </mesh>

        {/* ── 4. SPINNING LIDAR SCANNER TURRET ── */}
        <group position={[0, 0.62, -0.1]} ref={lidarRef}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.2, 0.14, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Laser beam dot */}
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.04]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* ── 5. STATUS INDICATOR LED (Front & Rear) ── */}
        <mesh position={[0, 0.42, -0.56]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0.42, 0.56]}>
          <boxGeometry args={[0.5, 0.08, 0.04]} />
          <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={1.5} />
        </mesh>

        {/* ── 6. WHEELS (Left & Right) ── */}
        {/* Left Wheel */}
        <mesh
          ref={el => (wheelsRef.current[0] = el)}
          position={[-0.8, 0.22, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.12, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Right Wheel */}
        <mesh
          ref={el => (wheelsRef.current[1] = el)}
          position={[0.8, 0.22, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.12, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>

        {/* Front & Rear Casters */}
        <mesh position={[0, 0.12, -0.42]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0.42]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
      </group>

      {/* ── 7. FLOATING 3D ROBOT STATUS TAG SPRITE (Always camera-facing) ── */}
      <SpriteBadge
        text={`AMR-01 • ${status === 'MOVING' ? 'MOVING' : 'IDLE'}`}
        position={[0, 1.25, 0]}
        scale={[2.6, 0.65, 1]}
        bgColor="rgba(15, 23, 42, 0.95)"
        textColor="#38bdf8"
        borderColor="#0284c7"
      />
    </group>
  );
}

// ─── 9. MAIN INTERACTIVE 3D CAD AMR MAP COMPONENT ────────────────────────────
export default function AMRMap({
  mode = 'auto',
  heightClass = 'h-[490px] lg:h-[520px]'
}) {
  const {
    robotPos,
    setRobotPose,
    heading,
    destinationKey,
    pathPoints,
    oldPathPoints,
    hasObstacle,
    activeObstacles,
    clearMapObstacles,
    eStopActive,
    importedMapImg,
    importedMapName,
    handleImportMap,
    destinationReached,
    aiFeedbackState,
    manualCollisionWarning,
    status,
    speed
  } = useAMR();

  const fileRef = useRef();
  const controlsRef = useRef();

  // View Mode: '3d' (Perspective CAD) or '2d' (Top-down occupancy grid view)
  const [viewMode, setViewMode] = useState('3d');
  const [cameraCommand, setCameraCommand] = useState(null);

  const posX = (robotPos.x * 0.1275).toFixed(2);
  const posY = (robotPos.y * 0.08).toFixed(2);

  // ── Command Dispatchers ───────────────────────────────────────────
  const triggerCamera = (type) => {
    setCameraCommand({ type, id: Date.now() });
  };

  const handleFit = () => triggerCamera('FIT');
  const handleZoomIn = () => triggerCamera('ZOOM_IN');
  const handleZoomOut = () => triggerCamera('ZOOM_OUT');
  const handleRotate = () => triggerCamera('ROTATE_45');

  const handleTopMode = () => {
    setViewMode('2d');
    triggerCamera('SET_MODE_TOP');
  };

  const handle3DMode = () => {
    setViewMode('3d');
    triggerCamera('SET_MODE_3D');
  };

  const handleReset = () => {
    triggerCamera('RESET');
    setRobotPose({ x: 20, y: 20.75, angle: 286 });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col w-full h-full justify-between">
      {/* ── 1. MAP TOOLBAR: [ FIT ] [ + ] [ − ] [ ⟳ ] [ TOP ] [ 3D ] [ RESET ] [ IMPORT ] [ CLEAR ] ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        {/* Title, Mode, and 3D View Badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            3D CAD ROBOTICS VIEWER
          </span>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
            mode === 'auto'
              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {mode === 'auto' ? 'AUTO' : 'MANUAL'}
          </span>
          <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
            viewMode === '3d'
              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            {viewMode === '3d' ? 'PERSPECTIVE 3D' : 'TOP OCCUPANCY 2D'}
          </span>
        </div>

        {/* Compact Navigation Toolbar: Exact requested toolbar buttons */}
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleImportMap(f);
            }}
          />

          {/* [ FIT ] */}
          <button
            onClick={handleFit}
            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Fit Entire AMR Environment into View"
          >
            FIT
          </button>

          {/* [ + ] */}
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Zoom In (+)"
          >
            +
          </button>

          {/* [ − ] */}
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Zoom Out (−)"
          >
            −
          </button>

          {/* [ ⟳ ] */}
          <button
            onClick={handleRotate}
            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 rounded-lg transition"
            title="Rotate Camera Orientation (+45°)"
          >
            ⟳
          </button>

          {/* [ TOP ] */}
          <button
            onClick={handleTopMode}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              viewMode === '2d'
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Switch to Top-down 2D Occupancy-Map View"
          >
            TOP
          </button>

          {/* [ 3D ] */}
          <button
            onClick={handle3DMode}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              viewMode === '3d'
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Switch to Perspective 3D View"
          >
            3D
          </button>

          {/* [ RESET ] */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Restore Default Camera Position & Reset Pose"
          >
            RESET
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

          {/* [ IMPORT ] */}
          <button
            onClick={() => fileRef.current?.click()}
            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 rounded-lg transition flex items-center gap-1"
            title="Import Map Image to 3D Floor"
          >
            <Upload className="w-3 h-3" /> IMPORT
          </button>

          {/* [ CLEAR ] */}
          <button
            onClick={() => clearMapObstacles()}
            className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-lg transition flex items-center gap-1"
            title="Clear Dynamic Obstacles & Reset Route"
          >
            <Trash2 className="w-3 h-3" /> CLEAR
          </button>
        </div>
      </div>

      {/* ── 2. INTERACTIVE 3D CAD VIEWPORT ─────────────────────────────── */}
      <div
        className={`relative w-full ${heightClass} rounded-xl overflow-hidden bg-[#070c18] border border-slate-700/80 shadow-inner select-none cursor-grab active:cursor-grabbing`}
      >
        {/* Real-Time Collision / Obstacle Avoidance HUD Banner */}
        {manualCollisionWarning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-rose-600/95 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-rose-400 animate-pulse flex items-center gap-1.5 pointer-events-none">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{manualCollisionWarning}</span>
          </div>
        )}

        {aiFeedbackState === 'blocked' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-600/95 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-red-300 animate-pulse flex items-center gap-2 pointer-events-none">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>OBSTACLE DETECTED • ROUTE BLOCKED • RE-ROUTING...</span>
          </div>
        )}

        {aiFeedbackState === 'rerouting' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-amber-600/95 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-amber-300 animate-pulse flex items-center gap-2 pointer-events-none">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>RE-ROUTING... CALCULATING COLLISION-FREE PATH</span>
          </div>
        )}

        {aiFeedbackState === 'new_route' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-600/95 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-emerald-300 flex items-center gap-2 pointer-events-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>NEW ROUTE FOUND • PATH AVOIDING OBSTACLE</span>
          </div>
        )}

        {aiFeedbackState === 'unreachable' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-700/95 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-red-400 flex items-center gap-1.5 pointer-events-none">
            <span>🔴 Destination unreachable — Path blocked</span>
          </div>
        )}

        {/* 3D Model Navigation Mouse Interaction Hint */}
        <div className="absolute bottom-2 right-3 z-10 bg-slate-950/70 backdrop-blur-md text-slate-400 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none flex items-center gap-2">
          <span>Left Drag: Orbit</span>
          <span>• Wheel: Zoom</span>
          <span>• Shift+Drag / Mid Drag: Pan</span>
        </div>

        {/* Watermark telemetry */}
        <div className="absolute bottom-2 left-3 z-10 text-[9px] font-mono uppercase tracking-widest text-slate-500 pointer-events-none flex items-center gap-2">
          <span>MAP: {importedMapName || 'WAREHOUSE_3D.CAD'}</span>
          <span>• MODE: {viewMode === '3d' ? '3D PERSPECTIVE' : '2D TOP-DOWN'}</span>
        </div>

        {/* ── THREE.JS 3D CANVAS SCENE ── */}
        <Canvas className="w-full h-full">
          <PerspectiveCamera
            makeDefault
            position={viewMode === '2d' ? [0, 44, 0.001] : [0, 24, 28]}
            fov={45}
          />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping={true}
            dampingFactor={0.08}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={70}
            maxPolarAngle={viewMode === '2d' ? 0.05 : Math.PI / 2 - 0.05}
            screenSpacePanning={true}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.PAN,
              RIGHT: THREE.MOUSE.ROTATE
            }}
          />

          {/* Animated Camera Transitions */}
          <CameraController
            viewMode={viewMode}
            cameraCommand={cameraCommand}
            controlsRef={controlsRef}
          />

          {/* 3D Scene Lighting */}
          <ambientLight intensity={0.9} />
          <directionalLight
            position={[10, 20, 15]}
            intensity={1.2}
          />
          <pointLight position={[-12, 10, -12]} intensity={0.5} />
          <pointLight position={[12, 10, 12]} intensity={0.5} />

          {/* ── WAREHOUSE FLOOR & OCCUPANCY GRID ── */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 44]} />
            <meshStandardMaterial color="#080e1d" roughness={0.7} metalness={0.2} />
          </mesh>

          {/* Fine Engineering CAD Grid */}
          <gridHelper args={[40, 40, '#0284c7', '#172554']} position={[0, 0.01, 0]} />

          {/* Direction Compass Indicator on Floor (North Arrow at -Z) */}
          <group position={[0, 0.02, -16.5]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.6, 1.4, 3]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <SpriteBadge
              text="NORTH [0°]"
              position={[0, 0.4, -1.2]}
              scale={[2.2, 0.55, 1]}
              bgColor="rgba(15, 23, 42, 0.85)"
              textColor="#38bdf8"
              borderColor="#0284c7"
            />
          </group>

          {/* Custom Imported Map Image Plane (if user uploads map) */}
          {importedMapImg && <ImportedFloorOverlay imageUrl={importedMapImg} />}

          {/* ── 3. PERIMETER SLAM WALLS ── */}
          <PerimeterWalls3D />

          {/* ── 4. STORAGE RACKS (Central Occupied Area) ── */}
          <StorageRacks3D />

          {/* ── 5. FIXED STATIONS ── */}
          <Stations3D destinationKey={destinationKey} />

          {/* ── 6. 3D OBSTACLES ── */}
          <Obstacles3D activeObstacles={activeObstacles} />

          {/* ── 7. 3D NAVIGATION ROUTE ── */}
          <NavigationRoute3D
            pathPoints={pathPoints}
            oldPathPoints={oldPathPoints}
            hasObstacle={hasObstacle}
            aiFeedbackState={aiFeedbackState}
          />

          {/* ── 8. 3D ROBOT MODEL (AMR) ── */}
          <RobotModel3D
            robotPos={robotPos}
            status={status}
            mode={mode}
            speed={speed}
            eStopActive={eStopActive}
            hasObstacle={hasObstacle}
          />
        </Canvas>
      </div>

      {/* ── 3. MAP LEGEND & REAL-TIME COORDINATES CONSOLE ───────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
        {/* Compact Legend */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#070c18] border border-cyan-800" /> Free Floor
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-700 border border-slate-400" /> Racks [Occupied]
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 border border-amber-600" /> Obstacle
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-500" /> Robot AMR
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="w-3.5 h-1 rounded-full bg-orange-500" /> Route
          </span>
          {oldPathPoints && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
              <span className="w-3.5 h-1 border-t-2 border-dashed border-rose-500" /> Blocked Route
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" /> Stations
          </span>
        </div>

        {/* Real-time Coordinates & Telemetry */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono font-bold text-slate-500 flex-wrap">
          <span>X: <strong className="text-slate-800">{posX}m</strong></span>
          <span>Y: <strong className="text-slate-800">{posY}m</strong></span>
          <span>θ: <strong className="text-cyan-700">{heading}°</strong></span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-600">Status: <strong className={status === 'MOVING' ? 'text-emerald-600' : 'text-slate-700'}>{status}</strong></span>

          {destinationReached && (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-sans font-black animate-pulse">
              ✓ ARRIVED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
