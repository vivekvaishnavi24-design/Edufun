import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Info,
  Flame,
  Wind,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RotateCw,
  Sun,
  Moon,
  Volume2,
  Layers,
  Radio,
  Eye,
  Activity,
  Droplets
} from 'lucide-react';
import { AnimationStage, ImagineCreativitySimulation, SimulationDifficulty } from '../../types';
import {
  playAirflowWhoosh,
  playThrusterSound,
  playOrbitHum,
  playOpticsPrismChime,
  playQuantumJumpChime,
  playVolcanoRumble,
  playClickTick
} from '../../utils/audio';

interface ExtendedSceneProps {
  simulation: ImagineCreativitySimulation;
  currentStageIndex: number;
  currentStage: AnimationStage;
  knobValues: Record<string, any>;
  onChangeKnob: (id: string, value: any) => void;
  particleTick: number;
  speed: number;
  difficulty: SimulationDifficulty;
  soundEnabled: boolean;
  onInspectMolecule?: (mol: {
    name: string;
    formula: string;
    desc: string;
    atoms: string;
    role: string;
  }) => void;
}

// ==========================================
// SCENE: AERODYNAMICS & FLIGHT
// ==========================================
export const AerodynamicsFlightScene: React.FC<ExtendedSceneProps> = ({
  currentStage,
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  difficulty,
  soundEnabled
}) => {
  // Knobs: angle_of_attack (-5 to 25), airspeed (100 to 800), flaps (bool)
  const aoa = typeof knobValues.angle_of_attack === 'number' ? knobValues.angle_of_attack : 8;
  const airspeed = typeof knobValues.airspeed === 'number' ? knobValues.airspeed : 420;
  const isStalled = aoa > 16;

  // Real-time aerodynamic physics approximations
  const liftCoeff = isStalled ? 0.35 : Math.max(0.1, 0.2 + aoa * 0.08);
  const dragCoeff = 0.05 + Math.pow(aoa / 12, 2) * 0.2 + (isStalled ? 0.8 : 0);
  const liftForce = Math.round(0.5 * 1.225 * Math.pow(airspeed / 10, 2) * liftCoeff * 12);
  const dragForce = Math.round(0.5 * 1.225 * Math.pow(airspeed / 10, 2) * dragCoeff * 12);

  const handleAoaChange = (newVal: number) => {
    onChangeKnob('angle_of_attack', newVal);
    if (soundEnabled) playAirflowWhoosh();
  };

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="skyWindGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#091426" />
          <stop offset="60%" stopColor="#0d2446" />
          <stop offset="100%" stopColor="#08101e" />
        </linearGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <radialGradient id="lowPressureGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="highPressureGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#skyWindGrad)" />

      {/* Wind Tunnel Grid / Measurement Lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={`grid-${i}`}
          x1="0"
          y1={50 + i * 45}
          x2="800"
          y2={50 + i * 45}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.5"
        />
      ))}

      {/* LAMINAR AIR STREAMLINES (Animated flowing stream particles) */}
      {Array.from({ length: 14 }).map((_, streamIdx) => {
        const baseY = 80 + streamIdx * 24;
        const isUpper = streamIdx < 7;
        const speedMultiplier = isUpper ? 1.6 : 1.0;
        const streamPhase = (particleTick * 4 * speedMultiplier * (airspeed / 300) + streamIdx * 73) % 800;

        // Curved streamline path deflected around airfoil
        let d = `M 20 ${baseY} Q 320 ${baseY} 380 ${baseY} Q 460 ${baseY} 780 ${baseY}`;
        if (isUpper) {
          // Upper streamlines curve over camber and accelerate
          const dip = Math.sin((aoa * Math.PI) / 180) * 30;
          d = `M 20 ${baseY} Q 300 ${baseY - 15 - dip} 400 ${baseY - 35 - dip} Q 520 ${baseY - 15} 780 ${baseY + 10}`;
        } else {
          // Lower streamlines stay flatter with slight downward deflection
          d = `M 20 ${baseY} Q 320 ${baseY + 12} 420 ${baseY + 18} Q 540 ${baseY + 22} 780 ${baseY + 25}`;
        }

        return (
          <g key={`stream-${streamIdx}`}>
            <path
              d={d}
              fill="none"
              stroke={isUpper ? '#38bdf8' : '#60a5fa'}
              strokeWidth={isUpper ? 2 : 1.5}
              strokeOpacity={isStalled && isUpper ? 0.25 : 0.45}
            />
            {/* Stream Particle Bullet */}
            <circle
              cx={streamPhase}
              cy={isUpper ? baseY - 20 : baseY + 12}
              r={isUpper ? 3.5 : 2.5}
              fill={isUpper ? '#fde047' : '#93c5fd'}
              filter="drop-shadow(0 0 4px #38bdf8)"
            />
          </g>
        );
      })}

      {/* TURBULENCE & STALL VORTICES (if stalled) */}
      {isStalled && (
        <g transform="translate(460, 160)">
          {Array.from({ length: 8 }).map((_, vi) => {
            const rot = (particleTick * 12 + vi * 45) % 360;
            return (
              <g key={`vortex-${vi}`} transform={`translate(${vi * 24}, ${Math.sin(vi) * 20}) rotate(${rot})`}>
                <circle r="12" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
                <path d="M -8 0 L 8 0" stroke="#f87171" strokeWidth="1.5" />
              </g>
            );
          })}
        </g>
      )}

      {/* LOW & HIGH PRESSURE ZONES OVER WING */}
      <g transform={`translate(400, 230) rotate(${-aoa})`}>
        {/* Low Pressure Suction Zone Above (Orange/Gold) */}
        {!isStalled && (
          <ellipse cx="10" cy="-65" rx="140" ry="45" fill="url(#lowPressureGlow)" />
        )}
        {/* High Pressure Zone Below (Cyan/Blue) */}
        <ellipse cx="20" cy="55" rx="130" ry="35" fill="url(#highPressureGlow)" />

        {/* PRESSURE LABELS */}
        <text x="0" y="-75" fill="#fde047" fontSize="12" fontWeight="900" textAnchor="middle">
          ⚡ LOW PRESSURE ZONE (High Air Velocity)
        </text>
        <text x="10" y="70" fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="middle">
          🌊 HIGH PRESSURE ZONE (Pushed Upward)
        </text>

        {/* CAMBERED AIRFOIL WING CROSS-SECTION */}
        <path
          d="M -160 0 C -150 -45 -60 -60 30 -50 C 120 -40 180 -10 200 0 C 180 15 100 20 20 18 C -70 16 -140 15 -160 0 Z"
          fill="url(#wingGrad)"
          stroke="#e2e8f0"
          strokeWidth="3"
          filter="drop-shadow(0 15px 25px rgba(0,0,0,0.6))"
        />

        {/* Chord line */}
        <line x1="-160" y1="0" x2="200" y2="0" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Leading edge stagnation point */}
        <circle cx="-160" cy="0" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
        <text x="-160" y="-12" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
          Stagnation Point
        </text>

        {/* Camber / Internal Spar Structure */}
        <line x1="-30" y1="-50" x2="-30" y2="18" stroke="#334155" strokeWidth="2" />
        <line x1="60" y1="-45" x2="60" y2="16" stroke="#334155" strokeWidth="2" />
      </g>

      {/* DYNAMIC AERODYNAMIC FORCE VECTORS */}
      <g transform="translate(400, 230)">
        {/* LIFT VECTOR (UP) */}
        <g className="transition-all">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={-Math.min(140, 25 + liftForce * 0.35)}
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <polygon
            points={`0,${-Math.min(140, 25 + liftForce * 0.35) - 10} -7,${-Math.min(140, 25 + liftForce * 0.35)} 7,${-Math.min(140, 25 + liftForce * 0.35)}`}
            fill="#22c55e"
          />
          <rect
            x="12"
            y={-Math.min(140, 25 + liftForce * 0.35) - 6}
            width="120"
            height="22"
            rx="6"
            fill="#0f172a"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <text
            x="72"
            y={-Math.min(140, 25 + liftForce * 0.35) + 9}
            fill="#86efac"
            fontSize="11"
            fontWeight="900"
            textAnchor="middle"
          >
            LIFT: {liftForce} N
          </text>
        </g>

        {/* WEIGHT / GRAVITY VECTOR (DOWN) */}
        <g>
          <line x1="0" y1="0" x2="0" y2="70" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
          <polygon points="0,80 -6,70 6,70" fill="#a855f7" />
          <text x="12" y="75" fill="#d8b4fe" fontSize="10" fontWeight="bold">
            Weight (mg)
          </text>
        </g>

        {/* THRUST VECTOR (FORWARD) */}
        <g>
          <line x1="0" y1="0" x2="110" y2="0" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <polygon points="120,0 110,-6 110,6" fill="#38bdf8" />
          <text x="110" y="-10" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="end">
            Thrust (Engine)
          </text>
        </g>

        {/* DRAG VECTOR (REARWARD) */}
        <g>
          <line x1="0" y1="0" x2={-Math.min(100, 20 + dragForce * 0.4)} y2="0" stroke="#ef4444" strokeWidth="4" />
          <polygon
            points={`${-Math.min(100, 20 + dragForce * 0.4) - 8},0 ${-Math.min(100, 20 + dragForce * 0.4)},-6 ${-Math.min(100, 20 + dragForce * 0.4)},6`}
            fill="#ef4444"
          />
          <text x={-Math.min(100, 20 + dragForce * 0.4) - 10} y="-10" fill="#fca5a5" fontSize="10" fontWeight="bold">
            Drag: {dragForce} N
          </text>
        </g>
      </g>

      {/* STALL WARNING BANNER */}
      {isStalled && (
        <g transform="translate(400, 60)">
          <rect x="-190" y="-20" width="380" height="40" rx="10" fill="#ef4444" fillOpacity="0.9" stroke="#fee2e2" strokeWidth="2" />
          <text x="0" y="6" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle">
            ⚠️ AERODYNAMIC STALL! Angle of Attack Too High ({aoa}°)
          </text>
        </g>
      )}

      {/* INTERACTIVE CONTROLS HUD OVERLAY */}
      <g transform="translate(30, 360)">
        <rect x="0" y="0" width="310" height="85" rx="14" fill="#0f172a" fillOpacity="0.92" stroke="#334155" strokeWidth="1.5" />
        <text x="15" y="22" fill="#38bdf8" fontSize="11" fontWeight="900">
          ✈️ FLIGHT SIMULATOR CONTROLS
        </text>

        {/* Angle of Attack Quick Buttons */}
        <text x="15" y="44" fill="#cbd5e1" fontSize="10" fontWeight="bold">
          Angle of Attack (α): {aoa}°
        </text>
        <g transform="translate(15, 52)">
          {[-2, 4, 8, 14, 20].map((val, idx) => (
            <g
              key={val}
              transform={`translate(${idx * 56}, 0)`}
              className="cursor-pointer"
              onClick={() => handleAoaChange(val)}
            >
              <rect
                x="0"
                y="0"
                width="50"
                height="24"
                rx="6"
                fill={aoa === val ? (val > 16 ? '#ef4444' : '#22c55e') : '#1e293b'}
                stroke={aoa === val ? '#ffffff' : '#475569'}
                strokeWidth="1"
              />
              <text
                x="25"
                y="16"
                fill={aoa === val ? '#ffffff' : '#cbd5e1'}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                {val > 0 ? `+${val}°` : `${val}°`}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* CURRICULUM PRINCIPLE HUD */}
      <g transform="translate(460, 375)">
        <rect x="0" y="0" width="310" height="70" rx="14" fill="#0f172a" fillOpacity="0.92" stroke="#475569" strokeWidth="1.5" />
        <text x="15" y="20" fill="#fde047" fontSize="11" fontWeight="900">
          {difficulty === 'advanced' ? '📐 BERNOULLI & NAVIER-STOKES' : '💡 HOW LIFT IS CREATED'}
        </text>
        <text x="15" y="40" fill="#e2e8f0" fontSize="10">
          {difficulty === 'advanced'
            ? 'P₁ + ½ρv₁² = P₂ + ½ρv₂² | Upper velocity causes pressure drop'
            : difficulty === 'beginner'
            ? 'Fast air over curved top pulls the wing UP!'
            : 'Curved top forces air to travel faster, lowering pressure above!'}
        </text>
        <text x="15" y="58" fill="#94a3b8" fontSize="9.5">
          Lift-to-Drag Ratio: {(liftForce / (dragForce || 1)).toFixed(2)}:1
        </text>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: GRAVITY & ORBITAL MECHANICS
// ==========================================
export const GravityOrbitsScene: React.FC<ExtendedSceneProps> = ({
  currentStage,
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  difficulty,
  soundEnabled
}) => {
  // Knobs: orbit_radius (120 to 240), central_mass (1 to 5), is_blackhole (bool)
  const orbitRadius = typeof knobValues.orbit_radius === 'number' ? knobValues.orbit_radius : 180;
  const centralMass = typeof knobValues.central_mass === 'number' ? knobValues.central_mass : 2;
  const isBlackHole = !!knobValues.is_blackhole;

  const orbitalSpeed = Math.sqrt(centralMass / (orbitRadius / 100)) * (speed || 1);
  const angle = (particleTick * orbitalSpeed * 0.05) % (2 * Math.PI);
  const planetX = 400 + Math.cos(angle) * orbitRadius;
  const planetY = 230 + Math.sin(angle) * (orbitRadius * 0.55); // Elliptical inclination

  // Kepler sweep area wedge
  const sweepAngle = angle - 0.25;
  const prevX = 400 + Math.cos(sweepAngle) * orbitRadius;
  const prevY = 230 + Math.sin(sweepAngle) * (orbitRadius * 0.55);

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <radialGradient id="spaceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a0f1d" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blackHoleDisk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="40%" stopColor="#a855f7" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#spaceGrad)" />

      {/* Background Starfield */}
      {Array.from({ length: 45 }).map((_, i) => {
        const sx = (i * 97 + 23) % 800;
        const sy = (i * 61 + 17) % 460;
        const sr = (i % 3) + 1;
        const opacity = 0.3 + ((particleTick + i * 15) % 100) / 150;
        return <circle key={`star-${i}`} cx={sx} cy={sy} r={sr} fill="#ffffff" opacity={opacity} />;
      })}

      {/* WARPED SPACETIME 3D GRAVITY GRID */}
      <g opacity="0.4">
        {Array.from({ length: 11 }).map((_, rIdx) => {
          const rad = 40 + rIdx * 28;
          return (
            <ellipse
              key={`grid-ring-${rIdx}`}
              cx="400"
              cy="230"
              rx={rad * 1.6}
              ry={rad * 0.75}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, aIdx) => {
          const a = (aIdx * Math.PI) / 6;
          const x2 = 400 + Math.cos(a) * 360;
          const y2 = 230 + Math.sin(a) * 170;
          return <line key={`radial-${aIdx}`} x1="400" y1="230" x2={x2} y2={y2} stroke="#4f46e5" strokeWidth="1" />;
        })}
      </g>

      {/* KEPLER SWEEP AREA (Equal areas in equal times) */}
      <polygon
        points={`400,230 ${prevX},${prevY} ${planetX},${planetY}`}
        fill="#38bdf8"
        fillOpacity="0.18"
        stroke="#38bdf8"
        strokeWidth="1"
      />

      {/* ORBITAL PATH ELLIPSE */}
      <ellipse
        cx="400"
        cy="230"
        rx={orbitRadius}
        ry={orbitRadius * 0.55}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.8"
      />

      {/* CENTRAL GRAVITATIONAL MASS (Sun or Black Hole) */}
      <g transform="translate(400, 230)">
        {isBlackHole ? (
          <g>
            <ellipse cx="0" cy="0" rx="90" ry="35" fill="url(#blackHoleDisk)" />
            <circle cx="0" cy="0" r="32" fill="#000000" stroke="#a855f7" strokeWidth="3" />
            <text x="0" y="5" fill="#c084fc" fontSize="9" fontWeight="bold" textAnchor="middle">
              SINGULARITY
            </text>
          </g>
        ) : (
          <g>
            <circle cx="0" cy="0" r={40 + centralMass * 8} fill="url(#sunGlow)" />
            <circle cx="0" cy="0" r={25 + centralMass * 4} fill="#fef08a" filter="drop-shadow(0 0 15px #f59e0b)" />
            <text x="0" y="4" fill="#78350f" fontSize="11" fontWeight="black" textAnchor="middle">
              SUN ☀️
            </text>
          </g>
        )}
      </g>

      {/* GRAVITATIONAL FORCE VECTOR (Pointing inward to Sun) */}
      <line x1={planetX} y1={planetY} x2={400} y2={230} stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 3" />

      {/* ORBITING PLANET */}
      <g transform={`translate(${planetX}, ${planetY})`}>
        {/* Atmosphere glow */}
        <circle cx="0" cy="0" r="16" fill="#38bdf8" fillOpacity="0.25" />
        {/* Planet Sphere */}
        <circle cx="0" cy="0" r="12" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" />
        {/* Continents / Clouds */}
        <circle cx="-3" cy="-2" r="5" fill="#22c55e" opacity="0.8" />
        <circle cx="4" cy="3" r="4" fill="#ffffff" opacity="0.7" />

        {/* TANGENTIAL VELOCITY VECTOR */}
        {(() => {
          const vAngle = angle + Math.PI / 2;
          const vx = Math.cos(vAngle) * 45;
          const vy = Math.sin(vAngle) * 25;
          return (
            <g>
              <line x1="0" y1="0" x2={vx} y2={vy} stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
              <circle cx={vx} cy={vy} r="3" fill="#22c55e" />
              <text x={vx + 6} y={vy + 4} fill="#86efac" fontSize="9.5" fontWeight="black">
                Velocity (v)
              </text>
            </g>
          );
        })()}

        {/* INWARD GRAVITY FORCE ARROW */}
        {(() => {
          const dx = 400 - planetX;
          const dy = 230 - planetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const fx = (dx / dist) * 45;
          const fy = (dy / dist) * 45;
          return (
            <g>
              <line x1="0" y1="0" x2={fx} y2={fy} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <polygon points={`${fx},${fy} ${fx - 4},${fy - 3} ${fx - 3},${fy + 4}`} fill="#f59e0b" />
              <text x={fx - 10} y={fy - 5} fill="#fde047" fontSize="9" fontWeight="bold">
                Fg
              </text>
            </g>
          );
        })()}
      </g>

      {/* TOP SCIENTIFIC HUD */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="340" height="75" rx="14" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="1.5" />
        <text x="15" y="20" fill="#38bdf8" fontSize="11" fontWeight="900">
          🌌 ORBITAL DYNAMICS DASHBOARD
        </text>
        <text x="15" y="40" fill="#e2e8f0" fontSize="10">
          Radius: {orbitRadius} AU | Velocity: {(orbitalSpeed * 12).toFixed(1)} km/s
        </text>
        <text x="15" y="60" fill="#fde047" fontSize="10">
          Law: {difficulty === 'advanced' ? 'Fg = G·(M₁·M₂)/r² | Centripetal Balance' : 'Gravity pulls inward, forward speed keeps it in orbit!'}
        </text>
      </g>

      {/* INTERACTIVE CONTROLS HUD */}
      <g transform="translate(460, 375)">
        <rect x="0" y="0" width="310" height="70" rx="14" fill="#0f172a" fillOpacity="0.9" stroke="#475569" strokeWidth="1.5" />
        <text x="15" y="20" fill="#fde047" fontSize="11" fontWeight="900">
          🎮 EXPERIMENT WITH GRAVITY
        </text>
        <g transform="translate(15, 30)">
          <button
            className="cursor-pointer"
            onClick={() => {
              onChangeKnob('is_blackhole', !isBlackHole);
              if (soundEnabled) playOrbitHum();
            }}
          >
            <rect x="0" y="0" width="135" height="28" rx="8" fill={isBlackHole ? '#7e22ce' : '#1e293b'} stroke="#a855f7" strokeWidth="1" />
            <text x="67" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              {isBlackHole ? '🕳️ Black Hole Mode' : '☀️ Star Mode'}
            </text>
          </button>
          <g
            transform="translate(145, 0)"
            className="cursor-pointer"
            onClick={() => {
              const nextRadius = orbitRadius > 210 ? 120 : orbitRadius + 30;
              onChangeKnob('orbit_radius', nextRadius);
              if (soundEnabled) playClickTick();
            }}
          >
            <rect x="0" y="0" width="135" height="28" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <text x="67" y="18" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
              📏 Change Orbit ({orbitRadius})
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: ROCKET PROPULSION & NEWTON'S 3RD LAW
// ==========================================
export const RocketPropulsionScene: React.FC<ExtendedSceneProps> = ({
  currentStage,
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  difficulty,
  soundEnabled
}) => {
  // Knobs: throttle (0-100), stage_sep (bool)
  const throttle = typeof knobValues.throttle === 'number' ? knobValues.throttle : 85;
  const isSeparated = !!knobValues.stage_sep;

  const altitude = ((particleTick * (throttle / 100) * 1.5) % 100).toFixed(1);
  const thrustForce = Math.round((throttle / 100) * 7500); // kN

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="rocketSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="35%" stopColor="#0b1736" />
          <stop offset="70%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#rocketSky)" />

      {/* Atmospheric Layers HUD lines */}
      <line x1="40" y1="120" x2="760" y2="120" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />
      <text x="50" y="112" fill="#cbd5e1" fontSize="10">
        Stratosphere / Mesosphere Boundary (50 km)
      </text>

      <line x1="40" y1="240" x2="760" y2="240" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />
      <text x="50" y="232" fill="#cbd5e1" fontSize="10">
        Troposphere Cloud Deck (12 km)
      </text>

      {/* BILLOWING EXHAUST SMOKE & FLAME PARTICLES */}
      {Array.from({ length: 24 }).map((_, pIdx) => {
        const offset = (particleTick * 8 + pIdx * 17) % 180;
        const drift = Math.sin(pIdx + particleTick * 0.1) * (offset * 0.35);
        return (
          <circle
            key={`exhaust-${pIdx}`}
            cx={400 + drift}
            cy={320 + offset}
            r={8 + offset * 0.18}
            fill="#ffffff"
            opacity={Math.max(0, 0.7 - offset / 180)}
          />
        );
      })}

      {/* MAIN ROCKET VEHICLE */}
      <g transform="translate(400, 200)">
        {/* SUPERSONIC EXHAUST FLAME PLUME */}
        <polygon
          points={`-22,75 0,${160 + (throttle / 100) * 80 + Math.sin(particleTick * 0.5) * 15} 22,75`}
          fill="url(#flameGrad)"
        />
        {/* Shock Diamond Mach Rings inside exhaust */}
        <ellipse cx="0" cy="105" rx="8" ry="3" fill="#ffffff" opacity="0.9" />
        <ellipse cx="0" cy="135" rx="12" ry="4" fill="#ffffff" opacity="0.7" />

        {/* First Stage Booster (if not separated) */}
        {!isSeparated && (
          <g>
            <rect x="-24" y="0" width="48" height="75" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            <rect x="-18" y="20" width="36" height="40" fill="#0284c7" opacity="0.2" />
            <text x="0" y="45" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle">
              STAGE 1
            </text>
            {/* Engine Bell Nozzle */}
            <polygon points="-18,75 18,75 22,88 -22,88" fill="#334155" />
          </g>
        )}

        {/* Separated First Stage Falling Back */}
        {isSeparated && (
          <g transform={`translate(0, ${100 + (particleTick % 60) * 2}) rotate(15)`}>
            <rect x="-20" y="0" width="40" height="60" rx="4" fill="#94a3b8" />
            <text x="0" y="35" fill="#1e293b" fontSize="8" fontWeight="bold" textAnchor="middle">
              BOOSTER SEPARATED
            </text>
          </g>
        )}

        {/* Upper Stage / Payload Capsule */}
        <path d="M -20 0 L 20 0 L 0 -75 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
        <circle cx="0" cy="-25" r="5" fill="#38bdf8" />

        {/* NEWTON'S 3RD LAW FORCE ARROWS */}
        {/* Reaction Thrust UP */}
        <g transform="translate(50, -20)">
          <line x1="0" y1="50" x2="0" y2="-50" stroke="#22c55e" strokeWidth="4" />
          <polygon points="0,-60 -6,-50 6,-50" fill="#22c55e" />
          <text x="10" y="-30" fill="#86efac" fontSize="10" fontWeight="black">
            Reaction Thrust: +{thrustForce} kN
          </text>
        </g>
        {/* Action Exhaust Momentum DOWN */}
        <g transform="translate(50, 100)">
          <line x1="0" y1="0" x2="0" y2="80" stroke="#f97316" strokeWidth="4" />
          <polygon points="0,90 -6,80 6,80" fill="#f97316" />
          <text x="10" y="45" fill="#fdba74" fontSize="10" fontWeight="black">
            Action Gas Ejection: -{thrustForce} kN
          </text>
        </g>
      </g>

      {/* TELEMETRY READOUT HUD */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="280" height="85" rx="14" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="1.5" />
        <text x="15" y="20" fill="#38bdf8" fontSize="11" fontWeight="900">
          🚀 LAUNCH VEHICLE TELEMETRY
        </text>
        <text x="15" y="40" fill="#e2e8f0" fontSize="10">
          Altitude: {altitude} km | Throttle: {throttle}%
        </text>
        <text x="15" y="58" fill="#fde047" fontSize="10">
          Velocity: {((particleTick * 140) % 7800).toFixed(0)} m/s (Mach {(throttle * 0.15).toFixed(1)})
        </text>
        <text x="15" y="74" fill="#86efac" fontSize="9.5">
          Law: Newton's 3rd Law — Action = -Reaction
        </text>
      </g>

      {/* QUICK STAGING & THROTTLE BUTTONS */}
      <g transform="translate(500, 375)">
        <rect x="0" y="0" width="270" height="70" rx="14" fill="#0f172a" fillOpacity="0.9" stroke="#475569" strokeWidth="1.5" />
        <text x="15" y="20" fill="#fde047" fontSize="11" fontWeight="900">
          🎮 PILOT COMMAND CONSOLE
        </text>
        <g transform="translate(15, 30)">
          <button
            className="cursor-pointer"
            onClick={() => {
              onChangeKnob('stage_sep', !isSeparated);
              if (soundEnabled) playThrusterSound();
            }}
          >
            <rect x="0" y="0" width="115" height="28" rx="8" fill={isSeparated ? '#059669' : '#e11d48'} />
            <text x="57" y="18" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {isSeparated ? 'Stage 2 Active' : '💥 Staging Trigger'}
            </text>
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              const nextThrot = throttle >= 100 ? 50 : throttle + 25;
              onChangeKnob('throttle', nextThrot);
              if (soundEnabled) playThrusterSound();
            }}
          >
            <g transform="translate(125, 0)">
              <rect x="0" y="0" width="115" height="28" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <text x="57" y="18" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                🔥 Throttle ({throttle}%)
              </text>
            </g>
          </button>
        </g>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: SOLAR & LUNAR ECLIPSE
// ==========================================
export const SolarEclipseScene: React.FC<ExtendedSceneProps> = ({
  knobValues,
  onChangeKnob,
  difficulty,
  soundEnabled
}) => {
  // Knobs: moon_alignment (-80 to 80), eclipse_mode ('solar' | 'lunar')
  const moonAlign = typeof knobValues.moon_alignment === 'number' ? knobValues.moon_alignment : 0;
  const isLunar = knobValues.eclipse_mode === 'lunar';
  const isTotality = Math.abs(moonAlign) < 8;

  const moonX = 380 + moonAlign * 1.5;

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="65%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="umbraCone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="penumbraCone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="#030712" />

      {/* SHADOW CONES (UMBRA & PENUMBRA) */}
      {/* Penumbra Cone */}
      <polygon points={`120,170 ${moonX},210 650,150 650,310 ${moonX},250 120,290`} fill="url(#penumbraCone)" />
      {/* Umbra Cone (Total darkness) */}
      <polygon points={`${moonX},215 650,225 650,235 ${moonX},245`} fill="url(#umbraCone)" />

      {/* THE RADIANT SUN */}
      <g transform="translate(120, 230)">
        <circle cx="0" cy="0" r="85" fill="url(#sunCorona)" />
        <circle cx="0" cy="0" r="55" fill="#fef08a" filter="drop-shadow(0 0 25px #f59e0b)" />
        <text x="0" y="6" fill="#78350f" fontSize="13" fontWeight="black" textAnchor="middle">
          SUN ☀️
        </text>
      </g>

      {/* THE MOON */}
      <g transform={`translate(${moonX}, 230)`}>
        <circle cx="0" cy="0" r="22" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Lunar Craters */}
        <circle cx="-5" cy="-6" r="4" fill="#334155" />
        <circle cx="7" cy="4" r="5" fill="#334155" />
        <text x="0" y="-30" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
          Moon 🌑
        </text>
      </g>

      {/* THE EARTH */}
      <g transform="translate(650, 230)">
        {/* Atmosphere */}
        <circle cx="0" cy="0" r="54" fill="#38bdf8" fillOpacity="0.25" />
        {/* Globe */}
        <circle cx="0" cy="0" r="46" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" />
        <circle cx="-12" cy="-10" r="18" fill="#22c55e" opacity="0.8" />
        <text x="0" y="5" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">
          Earth 🌍
        </text>
      </g>

      {/* EARTH SURFACE VIEWPORT (Circular zoom showing eclipse as seen from Earth) */}
      <g transform="translate(400, 95)">
        <rect x="-130" y="-55" width="260" height="110" rx="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <text x="0" y="-35" fill="#38bdf8" fontSize="10.5" fontWeight="900" textAnchor="middle">
          🔭 VIEW FROM EARTH SURFACE
        </text>

        {/* Sky disk inside telescope */}
        <circle cx="0" cy="6" r="38" fill={isTotality ? '#050814' : '#1e3a8a'} />
        {/* Sun disk */}
        <circle cx="0" cy="6" r="28" fill="#fef08a" />
        {/* Moon occulting disk */}
        <circle cx={moonAlign * 0.8} cy="6" r="28" fill="#0f172a" />

        {/* Diamond Ring Effect during Totality! */}
        {isTotality && (
          <g>
            <circle cx="0" cy="6" r="30" fill="none" stroke="#fef08a" strokeWidth="2" filter="drop-shadow(0 0 10px #f59e0b)" />
            <circle cx="27" cy="-10" r="6" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
            <text x="0" y="32" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
              ✨ TOTALITY: Corona Visible!
            </text>
          </g>
        )}
      </g>

      {/* INTERACTIVE ALIGNMENT SLIDER HUD */}
      <g transform="translate(250, 380)">
        <rect x="0" y="0" width="300" height="65" rx="14" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <text x="150" y="20" fill="#fde047" fontSize="11" fontWeight="900" textAnchor="middle">
          🌑 MOON ORBITAL ALIGNMENT: {moonAlign === 0 ? 'Exact Totality' : `${moonAlign}°`}
        </text>
        <g transform="translate(30, 30)">
          {[-40, -20, 0, 20, 40].map((step) => (
            <g
              key={step}
              transform={`translate(${(step + 40) * 3}, 0)`}
              className="cursor-pointer"
              onClick={() => {
                onChangeKnob('moon_alignment', step);
                if (soundEnabled) playClickTick();
              }}
            >
              <rect
                x="0"
                y="0"
                width="42"
                height="22"
                rx="6"
                fill={moonAlign === step ? '#f59e0b' : '#1e293b'}
                stroke="#64748b"
                strokeWidth="1"
              />
              <text x="21" y="15" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                {step === 0 ? 'Totality' : `${step}`}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: SOUND WAVES & FREQUENCY
// ==========================================
export const SoundWavesScene: React.FC<ExtendedSceneProps> = ({
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  difficulty,
  soundEnabled
}) => {
  // Knobs: frequency (100 to 800 Hz), amplitude (10 to 100%)
  const freq = typeof knobValues.frequency === 'number' ? knobValues.frequency : 440;
  const amp = typeof knobValues.amplitude === 'number' ? knobValues.amplitude : 60;

  const waveSpeed = 0.08 * (freq / 300) * (speed || 1);
  const speakerDisplacement = Math.sin(particleTick * waveSpeed * 10) * (amp / 100) * 12;

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="soundBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#091428" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#soundBg)" />

      {/* LOUDSPEAKER DIAPHRAGM ON LEFT */}
      <g transform={`translate(${110 + speakerDisplacement}, 230)`}>
        {/* Speaker magnet box */}
        <rect x="-70" y="-45" width="40" height="90" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="-30" y="-20" width="20" height="40" fill="#f59e0b" />
        {/* Speaker Cone Membrane */}
        <polygon points="-10,-60 -10,60 30,85 30,-85" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
        {/* Dust cap */}
        <ellipse cx="25" cy="0" rx="10" ry="25" fill="#0f172a" />
        <text x="35" y="-95" fill="#38bdf8" fontSize="11" fontWeight="bold">
          Oscillating Speaker Cone 📢
        </text>
      </g>

      {/* 100+ AIR MOLECULES (Compression & Rarefaction Bands) */}
      {Array.from({ length: 96 }).map((_, idx) => {
        const col = idx % 16;
        const row = Math.floor(idx / 16);
        const restX = 180 + col * 32;
        const restY = 140 + row * 30;

        // Longitudinal wave: particle moves horizontally back and forth
        const phase = (col * 0.45 - particleTick * waveSpeed * 4) % (2 * Math.PI);
        const dx = Math.sin(phase) * ((amp / 100) * 16);

        const isCompressed = Math.sin(phase) > 0.5;

        return (
          <circle
            key={`air-${idx}`}
            cx={restX + dx}
            cy={restY}
            r={isCompressed ? 4.5 : 3}
            fill={isCompressed ? '#fde047' : '#38bdf8'}
            opacity={isCompressed ? 0.95 : 0.45}
          />
        );
      })}

      {/* HUMAN EAR DRUM RECEIVER ON RIGHT */}
      <g transform="translate(710, 230)">
        <path d="M 0 -60 Q -25 0 0 60" fill="none" stroke="#f43f5e" strokeWidth="4" />
        <line
          x1="-8"
          y1="-30"
          x2={-8 + Math.sin(particleTick * waveSpeed * 10) * (amp / 100) * 6}
          y2="30"
          stroke="#fb7185"
          strokeWidth="3"
        />
        <text x="-15" y="-70" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle">
          Ear Drum 👂
        </text>
      </g>

      {/* LIVE OSCILLOSCOPE WAVEFORM GRAPH AT BOTTOM */}
      <g transform="translate(140, 360)">
        <rect x="0" y="0" width="520" height="85" rx="14" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
        <line x1="10" y1="42" x2="510" y2="42" stroke="#1e293b" strokeWidth="1.5" />

        {/* Sine Wave Line */}
        <path
          d={`M 15 42 ${Array.from({ length: 50 })
            .map((_, i) => {
              const x = 15 + i * 10;
              const y = 42 - Math.sin((i * 0.25 * (freq / 250)) - particleTick * 0.15) * ((amp / 100) * 32);
              return `L ${x} ${y}`;
            })
            .join(' ')}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.5"
          filter="drop-shadow(0 0 6px #22c55e)"
        />

        <text x="15" y="20" fill="#86efac" fontSize="10" fontWeight="900">
          📈 OSCILLOSCOPE: Frequency = {freq} Hz (Pitch) | Amplitude = {amp}% (Loudness)
        </text>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: LIGHT OPTICS & PRISM DISPERSION
// ==========================================
export const LightOpticsScene: React.FC<ExtendedSceneProps> = ({
  knobValues,
  onChangeKnob,
  difficulty,
  soundEnabled
}) => {
  // Knobs: incident_angle (15 to 65), refractive_index (1.3 to 2.4)
  const angle = typeof knobValues.incident_angle === 'number' ? knobValues.incident_angle : 38;
  const n = typeof knobValues.refractive_index === 'number' ? knobValues.refractive_index : 1.52; // Crown glass

  // 7 Spectrum colors with Cauchy dispersion
  const colors = [
    { name: 'Red', hex: '#ef4444', dev: 20 },
    { name: 'Orange', hex: '#f97316', dev: 22 },
    { name: 'Yellow', hex: '#eab308', dev: 24 },
    { name: 'Green', hex: '#22c55e', dev: 26 },
    { name: 'Blue', hex: '#3b82f6', dev: 28 },
    { name: 'Indigo', hex: '#6366f1', dev: 30 },
    { name: 'Violet', hex: '#a855f7', dev: 33 }
  ];

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="opticsBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#050814" />
          <stop offset="100%" stopColor="#02040a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#opticsBg)" />

      {/* INCIDENT WHITE LIGHT BEAM */}
      <line x1="60" y1={230 - angle * 2} x2="330" y2="230" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      <text x="140" y={215 - angle * 2} fill="#ffffff" fontSize="12" fontWeight="bold">
        White Light Beam (All Wavelengths) 🔦
      </text>

      {/* OPTICAL PRISM (TRIANGULAR GLASS) */}
      <polygon
        points="400,100 280,330 520,330"
        fill="#38bdf8"
        fillOpacity="0.12"
        stroke="#7dd3fc"
        strokeWidth="3"
        filter="drop-shadow(0 0 20px #0284c7)"
      />
      <text x="400" y="270" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle">
        Glass Prism (n = {n})
      </text>

      {/* DISPERSED RAINBOW RAYS SPREADING OUT */}
      {colors.map((c, idx) => {
        const exitY = 230 + idx * 3;
        const screenY = 160 + idx * 26 + (n - 1.5) * 40;
        return (
          <g key={c.name}>
            {/* Ray inside prism */}
            <line x1="330" y1="230" x2="440" y2={exitY} stroke={c.hex} strokeWidth="3" opacity="0.85" />
            {/* Ray refracted out of prism to observation screen */}
            <line x1="440" y1={exitY} x2="720" y2={screenY} stroke={c.hex} strokeWidth="4" />
            <circle cx="720" cy={screenY} r="5" fill={c.hex} />
            <text x="735" y={screenY + 4} fill={c.hex} fontSize="11" fontWeight="bold">
              {c.name} ({700 - idx * 45} nm)
            </text>
          </g>
        );
      })}

      {/* PROJECTION SCREEN ON RIGHT */}
      <line x1="720" y1="130" x2="720" y2="350" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />

      {/* EDUCATIONAL HUD */}
      <g transform="translate(40, 40)">
        <rect x="0" y="0" width="310" height="75" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <text x="15" y="20" fill="#fde047" fontSize="11" fontWeight="900">
          🌈 SNELL'S LAW & CHROMATIC DISPERSION
        </text>
        <text x="15" y="40" fill="#e2e8f0" fontSize="10">
          {difficulty === 'advanced'
            ? 'n₁·sin(θ₁) = n₂·sin(θ₂) | Shorter wavelengths (Violet) refract more!'
            : 'Glass bends violet light more than red light, creating a rainbow!'}
        </text>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: ATOMIC STRUCTURE & QUANTUM ENERGY SHELLS
// ==========================================
export const AtomQuantumScene: React.FC<ExtendedSceneProps> = ({
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  difficulty,
  soundEnabled
}) => {
  // Knobs: electron_shell (1, 2, 3)
  const currentShell = typeof knobValues.electron_shell === 'number' ? knobValues.electron_shell : 2;
  const shellRadius = [0, 65, 115, 165][currentShell] || 115;

  const electronAngle = (particleTick * 0.08 * (speed || 1)) % (2 * Math.PI);
  const elX = 400 + Math.cos(electronAngle) * shellRadius;
  const elY = 230 + Math.sin(electronAngle) * shellRadius;

  const handleTriggerQuantumJump = (targetShell: number) => {
    onChangeKnob('electron_shell', targetShell);
    if (soundEnabled) playQuantumJumpChime();
  };

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <radialGradient id="nucleusGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="#030712" />

      {/* QUANTUM ENERGY LEVEL SHELLS n=1, n=2, n=3 */}
      {[1, 2, 3].map((n) => {
        const rad = [0, 65, 115, 165][n];
        const isActive = n === currentShell;
        return (
          <g key={n}>
            <circle
              cx="400"
              cy="230"
              r={rad}
              fill="none"
              stroke={isActive ? '#38bdf8' : '#334155'}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray="5 5"
            />
            <text x={400 + rad + 8} y="234" fill={isActive ? '#38bdf8' : '#64748b'} fontSize="11" fontWeight="bold">
              n={n} (Shell {n})
            </text>
          </g>
        );
      })}

      {/* CENTRAL NUCLEUS (Protons & Neutrons clustered) */}
      <g transform="translate(400, 230)">
        <circle cx="0" cy="0" r="32" fill="url(#nucleusGlow)" opacity="0.4" />
        {/* Protons (+) */}
        <circle cx="-6" cy="-6" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
        <text x="-6" y="-3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
          +
        </text>
        <circle cx="8" cy="-4" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
        <text x="8" y="-1" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
          +
        </text>
        {/* Neutrons (0) */}
        <circle cx="-4" cy="8" r="10" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
        <text x="-4" y="11" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
          n
        </text>
        <circle cx="8" cy="8" r="10" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
        <text x="8" y="11" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
          n
        </text>
      </g>

      {/* ORBITING ELECTRON */}
      <g transform={`translate(${elX}, ${elY})`}>
        <circle cx="0" cy="0" r="8" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
        <text x="0" y="3" fill="#0f172a" fontSize="8" fontWeight="black" textAnchor="middle">
          e⁻
        </text>
      </g>

      {/* QUANTUM JUMP INTERACTIVE BUTTONS */}
      <g transform="translate(250, 385)">
        <rect x="0" y="0" width="300" height="60" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="150" y="20" fill="#fde047" fontSize="10.5" fontWeight="900" textAnchor="middle">
          ⚡ TRIGGER ELECTRON QUANTUM LEAP:
        </text>
        <g transform="translate(20, 28)">
          {[1, 2, 3].map((s) => (
            <g
              key={s}
              transform={`translate(${(s - 1) * 90}, 0)`}
              className="cursor-pointer"
              onClick={() => handleTriggerQuantumJump(s)}
            >
              <rect
                x="0"
                y="0"
                width="80"
                height="24"
                rx="6"
                fill={currentShell === s ? '#38bdf8' : '#1e293b'}
              />
              <text
                x="40"
                y="16"
                fill={currentShell === s ? '#0f172a' : '#ffffff'}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                Jump to n={s}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: DNA REPLICATION & HELIX UNZIPPING
// ==========================================
export const DnaReplicationScene: React.FC<ExtendedSceneProps> = ({ particleTick, speed, soundEnabled }) => {
  const basePairs = [
    { left: 'A', right: 'T', colL: '#22c55e', colR: '#ef4444', label: 'Adenine-Thymine' },
    { left: 'C', right: 'G', colL: '#38bdf8', colR: '#f59e0b', label: 'Cytosine-Guanine' },
    { left: 'T', right: 'A', colL: '#ef4444', colR: '#22c55e', label: 'Thymine-Adenine' },
    { left: 'G', right: 'C', colL: '#f59e0b', colR: '#38bdf8', label: 'Guanine-Cytosine' }
  ];

  // Continuous helix flow offset
  const flowOffset = (particleTick * 1.5) % 80;

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="dnaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="50%" stopColor="#0b1120" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <radialGradient id="helicaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#9333ea" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#6b21a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="polymeraseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#dnaBgGrad)" />

      {/* Grid Matrix / Microscopic Backdrop */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`bg-line-${i}`} x1="0" y1={40 + i * 55} x2="800" y2={40 + i * 55} stroke="#1e293b" strokeWidth="0.8" opacity="0.3" strokeDasharray="6 8" />
      ))}

      {/* FLOATING DEOXYNUCLEOTIDE TRIPHOSPHATES (Free dNTPs entering fork) */}
      {Array.from({ length: 10 }).map((_, di) => {
        const dnx = 360 + ((di * 45 + particleTick * 2) % 380);
        const dny = 140 + Math.sin(di * 1.7 + particleTick * 0.08) * 80;
        const color = ['#22c55e', '#ef4444', '#38bdf8', '#f59e0b'][di % 4];
        const letter = ['dATP', 'dTTP', 'dCTP', 'dGTP'][di % 4];
        return (
          <g key={`dntp-${di}`} transform={`translate(${dnx}, ${dny})`}>
            <circle r="7" fill={color} opacity="0.85" filter="drop-shadow(0 0 4px currentColor)" />
            <text x="0" y="3.5" fill="#0f172a" fontSize="7" fontWeight="black" textAnchor="middle">
              {letter[1]}
            </text>
          </g>
        );
      })}

      {/* CENTRAL REPLICATION FORK COMPLEX */}
      <g transform="translate(60, 230)">
        {/* Intact Parental Double Helix Backbone (Left of Fork, x < 280) */}
        <path
          d="M 0 -45 Q 70 -65, 140 -20 T 280 -45"
          fill="none"
          stroke="#64748b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 0 45 Q 70 65, 140 20 T 280 45"
          fill="none"
          stroke="#475569"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Separated Template Strands (Right of Fork, x >= 280) */}
        {/* Leading Template Strand (Top branch) */}
        <path
          d="M 280 -45 C 340 -70, 480 -130, 680 -140"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Newly Synthesized Leading Strand (Complementary, Top) */}
        <path
          d="M 320 -70 C 420 -105, 540 -122, 680 -124"
          fill="none"
          stroke="#22c55e"
          strokeWidth="4"
          strokeDasharray="8 4"
        />

        {/* Lagging Template Strand (Bottom branch) */}
        <path
          d="M 280 45 C 340 70, 480 130, 680 140"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Newly Synthesized Lagging Strand (Okazaki Fragments, Bottom) */}
        <path
          d="M 330 72 C 410 98, 490 118, 560 123 M 580 125 C 620 128, 650 130, 680 130"
          fill="none"
          stroke="#ec4899"
          strokeWidth="4"
          strokeDasharray="12 4"
        />

        {/* Dynamic Nitrogenous Base Pairs (Flowing across helix) */}
        {Array.from({ length: 18 }).map((_, i) => {
          const rawX = i * 36 - flowOffset;
          if (rawX < -20 || rawX > 680) return null;
          const pair = basePairs[Math.abs(i) % 4];
          const isUnzipped = rawX >= 270;
          const spreadFactor = isUnzipped ? Math.min(95, (rawX - 270) * 0.28) : 0;
          const topY = -40 - spreadFactor;
          const btmY = 40 + spreadFactor;

          return (
            <g key={`rung-${i}`} transform={`translate(${rawX}, 0)`}>
              {/* Top Base */}
              <line x1="0" y1={topY} x2="0" y2={isUnzipped ? topY + 16 : -4} stroke={pair.colL} strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="0" cy={topY} r="4.5" fill={pair.colL} />
              <text x="0" y={topY - 8} fill={pair.colL} fontSize="9" fontWeight="900" textAnchor="middle">
                {pair.left}
              </text>

              {/* Hydrogen Bonds in Un-opened Helix */}
              {!isUnzipped && (
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="2 2" opacity="0.8" />
              )}

              {/* Bottom Base */}
              <line x1="0" y1={isUnzipped ? btmY - 16 : 4} x2="0" y2={btmY} stroke={pair.colR} strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="0" cy={btmY} r="4.5" fill={pair.colR} />
              <text x="0" y={btmY + 16} fill={pair.colR} fontSize="9" fontWeight="900" textAnchor="middle">
                {pair.right}
              </text>
            </g>
          );
        })}

        {/* HELICASE ENZYME (Unwinding Hexamer Ring) */}
        <g transform="translate(275, 0)">
          <circle r="42" fill="url(#helicaseGlow)" />
          <circle r="30" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="3" filter="drop-shadow(0 0 10px #a855f7)" />
          {/* Rotating turbine blades on helicase */}
          {Array.from({ length: 6 }).map((_, bi) => {
            const rot = bi * 60 + particleTick * 4;
            return (
              <line
                key={`blade-${bi}`}
                x1="0"
                y1="0"
                x2="24"
                y2="0"
                stroke="#f3e8ff"
                strokeWidth="2.5"
                transform={`rotate(${rot})`}
              />
            );
          })}
          <circle r="10" fill="#581c87" stroke="#ffffff" strokeWidth="1.5" />
          <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">
            HELICASE
          </text>
          <text x="0" y="44" fill="#d8b4fe" fontSize="8" fontWeight="bold" textAnchor="middle">
            Breaking H-Bonds ⚡
          </text>
        </g>

        {/* DNA POLYMERASE III (Leading Strand Builder - Top) */}
        <g transform="translate(420, -100)">
          <circle r="26" fill="url(#polymeraseGlow)" />
          <rect x="-24" y="-18" width="48" height="36" rx="10" fill="#0284c7" stroke="#bae6fd" strokeWidth="2.5" />
          <text x="0" y="-3" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
            DNA POLY III
          </text>
          <text x="0" y="9" fill="#e0f2fe" fontSize="7" fontWeight="bold" textAnchor="middle">
            Leading 5' ➔ 3'
          </text>
        </g>

        {/* DNA POLYMERASE + PRIMASE (Lagging Strand - Bottom) */}
        <g transform="translate(460, 105)">
          <circle r="26" fill="url(#polymeraseGlow)" />
          <rect x="-26" y="-18" width="52" height="36" rx="10" fill="#c026d3" stroke="#f5d0fe" strokeWidth="2.5" />
          <text x="0" y="-3" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
            OKAZAKI COMPLEX
          </text>
          <text x="0" y="9" fill="#fae8ff" fontSize="7" fontWeight="bold" textAnchor="middle">
            Lagging Strand
          </text>
        </g>
      </g>

      {/* TOP ANNOTATION & PROCESS BANNER */}
      <g transform="translate(35, 30)">
        <rect x="0" y="0" width="400" height="65" rx="14" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" opacity="0.95" />
        <text x="16" y="22" fill="#d8b4fe" fontSize="12" fontWeight="900">
          🧬 SEMI-CONSERVATIVE DNA REPLICATION FORK
        </text>
        <text x="16" y="40" fill="#cbd5e1" fontSize="10">
          Helicase unzips hydrogen bonds at ~1000 bp/sec. DNA Polymerase III
        </text>
        <text x="16" y="54" fill="#38bdf8" fontSize="10" fontWeight="bold">
          synthesizes leading strand continuously & lagging strand via Okazaki fragments.
        </text>
      </g>

      {/* BASE PAIRING RULE KEY */}
      <g transform="translate(560, 30)">
        <rect x="0" y="0" width="205" height="65" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.95" />
        <text x="12" y="18" fill="#e2e8f0" fontSize="10" fontWeight="black">
          Chargaff's Complementary Rule:
        </text>
        <g transform="translate(12, 36)">
          <rect x="0" y="-8" width="85" height="18" rx="5" fill="#14532d" />
          <text x="42" y="5" fill="#86efac" fontSize="9" fontWeight="black" textAnchor="middle">
            Adenine = Thymine
          </text>
        </g>
        <g transform="translate(105, 36)">
          <rect x="0" y="-8" width="90" height="18" rx="5" fill="#1e3a8a" />
          <text x="45" y="5" fill="#93c5fd" fontSize="9" fontWeight="black" textAnchor="middle">
            Cytosine ≡ Guanine
          </text>
        </g>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: VOLCANO ERUPTION & MAGMA DYNAMICS
// ==========================================
export const VolcanoEruptionScene: React.FC<ExtendedSceneProps> = ({
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  soundEnabled
}) => {
  const pressure = Number(knobValues.magma_pressure ?? 78);
  const isErupting = Boolean(knobValues.is_erupting ?? true);

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="volcanoSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0f" />
          <stop offset="40%" stopColor="#1f1118" />
          <stop offset="80%" stopColor="#3d1419" />
          <stop offset="100%" stopColor="#1e0b0e" />
        </linearGradient>
        <radialGradient id="magmaChamberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id="rockStrataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="plumeSmoke" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#1e293b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#volcanoSkyGrad)" />

      {/* BILLOWING CONVECTIVE ASH & PYROCLASTIC CLOUD */}
      {isErupting && Array.from({ length: 24 }).map((_, i) => {
        const py = 150 - ((particleTick * 4 + i * 16) % 200);
        const spread = (160 - py) * 0.9;
        const px = 400 + Math.sin(i * 1.5 + particleTick * 0.05) * spread;
        const radius = 18 + (160 - py) * 0.25;

        return (
          <circle
            key={`ash-${i}`}
            cx={px}
            cy={py}
            r={radius}
            fill="url(#plumeSmoke)"
          />
        );
      })}

      {/* VOLCANIC LIGHTNING FLASHES INSIDE ASH PLUME */}
      {isErupting && particleTick % 28 < 4 && (
        <path
          d={`M 390 120 L 410 70 L 395 50 L 415 15`}
          stroke="#fef08a"
          strokeWidth="3"
          fill="none"
          filter="drop-shadow(0 0 8px #fef08a)"
        />
      )}

      {/* STRATOVOLCANO CONE (Mountain Flanks with Stratified Lava & Tephra layers) */}
      <polygon points="400,165 140,430 660,430" fill="url(#rockStrataGrad)" stroke="#475569" strokeWidth="3" />
      {/* Crater Vent Rim */}
      <ellipse cx="400" cy="165" rx="42" ry="14" fill="#0f172a" stroke="#f97316" strokeWidth="2.5" />

      {/* SUBTERRANEAN TECTONIC SUBDUCTION ZONE (Crustal Plate diving downward) */}
      <path
        d="M 60 430 L 260 430 L 320 460 L 60 460 Z"
        fill="#1e1e2e"
        stroke="#4338ca"
        strokeWidth="1.5"
      />
      <text x="130" y="448" fill="#818cf8" fontSize="9" fontWeight="bold">
        Subducting Oceanic Plate ➔
      </text>

      {/* ACTIVE CASCAING LAVA FLOWS DOWN MOUNTAIN FLANKS */}
      {isErupting && (
        <>
          {/* Left Flank Lava River */}
          <path
            d={`M 380 170 Q 340 240 300 310 T 220 425`}
            fill="none"
            stroke="#ea580c"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d={`M 380 170 Q 340 240 300 310 T 220 425`}
            fill="none"
            stroke="#fef08a"
            strokeWidth="3.5"
            strokeDasharray="16 12"
            strokeDashoffset={-particleTick * 3}
          />
          {/* Right Flank Lava River */}
          <path
            d={`M 420 170 Q 470 250 510 320 T 580 425`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={`M 420 170 Q 470 250 510 320 T 580 425`}
            fill="none"
            stroke="#fef08a"
            strokeWidth="2.5"
            strokeDasharray="14 10"
            strokeDashoffset={-particleTick * 2.5}
          />
        </>
      )}

      {/* CENTRAL MAGMA CONDUIT / FEEDER DIKE */}
      <rect x="386" y="170" width="28" height="180" fill="url(#magmaChamberGlow)" />
      {/* Convecting Magma Streams Inside Conduit */}
      {Array.from({ length: 8 }).map((_, mi) => {
        const my = 340 - ((particleTick * 3 + mi * 22) % 170);
        return <circle key={`magma-conduit-${mi}`} cx={394 + (mi % 2) * 12} cy={my} r="3" fill="#fef08a" />;
      })}

      {/* SUBTERRANEAN HIGH-PRESSURE MAGMA CHAMBER */}
      <g transform="translate(400, 385)">
        <ellipse cx="0" cy="0" rx="110" ry="50" fill="url(#magmaChamberGlow)" filter="drop-shadow(0 0 25px rgba(249,115,22,0.6))" />
        {/* Convection Swirls in Chamber */}
        <ellipse cx="-40" cy="0" rx="25" ry="15" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 4" transform={`rotate(${particleTick * 3})`} />
        <ellipse cx="40" cy="0" rx="25" ry="15" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 4" transform={`rotate(${-particleTick * 3})`} />
        <text x="0" y="-8" fill="#fef08a" fontSize="13" fontWeight="900" textAnchor="middle">
          MAGMA CHAMBER
        </text>
        <text x="0" y="12" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
          1250°C • Dissolved Gases & Silica Melt
        </text>
      </g>

      {/* PROJECTILE VOLCANIC BOMBS & INCANDESCENT TEPHRA */}
      {isErupting && Array.from({ length: 14 }).map((_, bi) => {
        const angle = (bi - 7) * 0.18;
        const dist = ((particleTick * 5 + bi * 28) % 110);
        const bx = 400 + Math.sin(angle) * dist * 1.5;
        const by = 160 - Math.cos(angle) * dist * 1.1 + (dist * dist * 0.005);
        return (
          <circle
            key={`bomb-${bi}`}
            cx={bx}
            cy={by}
            r="4.5"
            fill="#fef08a"
            stroke="#ea580c"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 6px #f97316)"
          />
        );
      })}

      {/* TOP ANNOTATION BOX */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="310" height="65" rx="14" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" opacity="0.95" />
        <text x="15" y="22" fill="#fb923c" fontSize="12" fontWeight="900">
          🌋 VOLCANOLOGY & MAGMA DYNAMICS
        </text>
        <text x="15" y="40" fill="#cbd5e1" fontSize="10">
          Subduction melts mantle rock into buoyant magma.
        </text>
        <text x="15" y="54" fill="#fef08a" fontSize="10" fontWeight="bold">
          High volatile gas pressure drives explosive eruptions!
        </text>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: DIGESTIVE SYSTEM & BIOCHEMISTRY
// ==========================================
export const DigestiveSystemScene: React.FC<ExtendedSceneProps> = ({ particleTick, speed }) => {
  // Food bolus progress down the digestive tract
  const digestionCycle = (particleTick * 1.2) % 320;

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="bodyBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#080c14" />
          <stop offset="60%" stopColor="#111827" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
        <linearGradient id="stomachAcid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#65a30d" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="villiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#bodyBg)" />

      {/* HUMAN BODY SILHOUETTE OUTLINE */}
      <path
        d="M 330 30 C 330 10 470 10 470 30 C 470 70 520 110 520 180 L 510 430 L 290 430 L 280 180 C 280 110 330 70 330 30 Z"
        fill="#1e293b"
        opacity="0.35"
        stroke="#334155"
        strokeWidth="2"
      />

      {/* 1. MOUTH & SALIVARY GLANDS (Carb breakdown) */}
      <g transform="translate(400, 45)">
        <ellipse cx="0" cy="0" rx="26" ry="16" fill="#be123c" stroke="#fda4af" strokeWidth="2" />
        <text x="0" y="3.5" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
          ORAL CAVITY
        </text>
        {/* Salivary Amylase drops */}
        <circle cx="-12" cy="18" r="3" fill="#38bdf8" />
        <circle cx="12" cy="18" r="3" fill="#38bdf8" />
      </g>

      {/* 2. ESOPHAGUS (Peristaltic muscular wave) */}
      <path
        d="M 400 60 L 400 170"
        stroke="#f43f5e"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      {/* Animated Peristalsis Wave Ring */}
      <circle
        cx="400"
        cy={70 + ((particleTick * 2) % 95)}
        r="11"
        fill="#fda4af"
        opacity="0.75"
      />

      {/* 3. LIVER & GALLBLADDER (Bile production & emulsification) */}
      <g transform="translate(460, 165)">
        {/* Liver Wedge */}
        <path d="M 0 0 C 45 10 70 45 60 75 C 50 95 10 85 -10 65 Z" fill="#991b1b" stroke="#dc2626" strokeWidth="2" />
        <text x="25" y="45" fill="#fecaca" fontSize="9" fontWeight="black">
          LIVER (Bile)
        </text>
        {/* Gallbladder */}
        <ellipse cx="5" cy="72" rx="9" ry="14" fill="#65a30d" stroke="#bef264" strokeWidth="1.5" />
      </g>

      {/* 4. STOMACH (J-Shaped Gastric Churner) */}
      <g transform="translate(365, 175)">
        {/* Stomach outer wall */}
        <path
          d="M 35 0 C 45 60 -15 80 -15 130 C -15 170 85 180 95 125 C 105 85 85 20 35 0 Z"
          fill="#e11d48"
          stroke="#fda4af"
          strokeWidth="3.5"
        />
        {/* Gastric Acid Pool (HCl + Pepsin pH 1.5-2.0) */}
        <path
          d="M 5 110 C 10 135 75 145 80 125 C 75 105 10 95 5 110 Z"
          fill="url(#stomachAcid)"
        />
        {/* Churning Bubbles inside Acid */}
        <circle cx="30" cy={118 + Math.sin(particleTick * 0.15) * 6} r="4" fill="#bef264" />
        <circle cx="55" cy={122 + Math.cos(particleTick * 0.18) * 6} r="3" fill="#bef264" />
        <text x="35" y="70" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
          STOMACH
        </text>
        <text x="35" y="85" fill="#fecdd3" fontSize="8" textAnchor="middle">
          HCl + Pepsin (pH 2)
        </text>
      </g>

      {/* 5. PANCREAS (Secretes amylase, protease, lipase) */}
      <g transform="translate(390, 290)">
        <ellipse cx="0" cy="0" rx="36" ry="12" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
        <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
          PANCREAS
        </text>
      </g>

      {/* 6. SMALL INTESTINE (Absorption via Villi) */}
      <g transform="translate(380, 345)">
        <path
          d="M 0 -20 Q -40 10 0 35 Q 40 60 0 85"
          fill="none"
          stroke="#fb7185"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <text x="0" y="38" fill="#ffffff" fontSize="8.5" fontWeight="black" textAnchor="middle">
          SMALL INTESTINE (Villi)
        </text>
      </g>

      {/* 7. LARGE INTESTINE (COLON) (Water reabsorption) */}
      <path
        d="M 330 395 L 330 310 L 450 310 L 450 425"
        fill="none"
        stroke="#9a3412"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.85"
      />
      <text x="490" y="375" fill="#fed7aa" fontSize="8" fontWeight="bold">
        Large Intestine (Colon)
      </text>

      {/* MOVING FOOD BOLUS / CHYME TRAVELING DOWN TRACT */}
      {(() => {
        let bx = 400;
        let by = 50;
        if (digestionCycle < 80) {
          // In esophagus
          bx = 400;
          by = 50 + (digestionCycle / 80) * 120;
        } else if (digestionCycle < 180) {
          // In stomach churning
          const t = (digestionCycle - 80) / 100;
          bx = 380 + Math.sin(t * Math.PI * 3) * 20;
          by = 210 + t * 75;
        } else {
          // In small intestine absorption
          const t = (digestionCycle - 180) / 140;
          bx = 380 + Math.sin(t * Math.PI * 4) * 25;
          by = 310 + t * 90;
        }

        return (
          <g transform={`translate(${bx}, ${by})`}>
            <circle r="7" fill="#facc15" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 0 8px #facc15)" />
            <text x="14" y="3" fill="#fef08a" fontSize="8" fontWeight="black">
              Chyme / Nutrients
            </text>
          </g>
        );
      })()}

      {/* INSET MICROSCOPIC VIEW: INTESTINAL VILLUS ABSORPTION */}
      <g transform="translate(565, 40)">
        <rect x="0" y="0" width="205" height="150" rx="14" fill="#0f172a" stroke="#f43f5e" strokeWidth="2" />
        <text x="12" y="20" fill="#fda4af" fontSize="10" fontWeight="black">
          🔬 MICRO-VIEW: INTESTINAL VILLI
        </text>

        {/* Villi Finger-like Projections */}
        {Array.from({ length: 4 }).map((_, vi) => {
          const vx = 30 + vi * 42;
          return (
            <g key={`villus-${vi}`}>
              <path
                d={`M ${vx - 14} 115 C ${vx - 14} 45 ${vx + 14} 45 ${vx + 14} 115 Z`}
                fill="url(#villiGlow)"
                stroke="#fda4af"
                strokeWidth="1.5"
              />
              {/* Capillary Blood Vessel inside Villus */}
              <path
                d={`M ${vx - 5} 115 L ${vx - 5} 65 Q ${vx} 55 ${vx + 5} 65 L ${vx + 5} 115`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
            </g>
          );
        })}

        {/* Nutrient Absorption Particles entering Capillaries */}
        {Array.from({ length: 6 }).map((_, ni) => {
          const ny = 60 + ((particleTick * 1.5 + ni * 20) % 50);
          const nx = 40 + (ni % 4) * 42;
          return <circle key={`nutr-${ni}`} cx={nx} cy={ny} r="2.5" fill="#facc15" />;
        })}

        <text x="12" y="135" fill="#94a3b8" fontSize="8" fontWeight="bold">
          Absorption: Glucose & Amino Acids ➔ Blood
        </text>
      </g>

      {/* BIOCHEMICAL STAGES SUMMARY */}
      <g transform="translate(30, 40)">
        <rect x="0" y="0" width="260" height="95" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.95" />
        <text x="14" y="22" fill="#38bdf8" fontSize="11" fontWeight="900">
          🍽️ DIGESTIVE BIOCHEMISTRY
        </text>
        <text x="14" y="42" fill="#e2e8f0" fontSize="9.5">
          1. Mouth: Salivary Amylase splits starch
        </text>
        <text x="14" y="58" fill="#e2e8f0" fontSize="9.5">
          2. Stomach: Pepsin digests protein chains
        </text>
        <text x="14" y="74" fill="#e2e8f0" fontSize="9.5">
          3. Duodenum: Bile emulsifies dietary lipids
        </text>
        <text x="14" y="90" fill="#e2e8f0" fontSize="9.5">
          4. Villi: Active nutrient uptake into blood
        </text>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: CELL BIOLOGY & ORGANELLES
// ==========================================
export const CellBiologyScene: React.FC<ExtendedSceneProps> = ({ particleTick, speed }) => {
  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <radialGradient id="cytoplasmGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.75" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="nucleusGrad" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="60%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#581c87" />
        </radialGradient>
        <radialGradient id="mitochondriaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="#030712" />

      {/* EXTRACELLULAR NUTRIENTS MOVING OUTSIDE */}
      {Array.from({ length: 14 }).map((_, ei) => {
        const ex = 50 + ((ei * 55 + particleTick) % 700);
        const ey = 30 + (ei % 3) * 20;
        return <circle key={`extra-${ei}`} cx={ex} cy={ey} r="3" fill="#38bdf8" opacity="0.6" />;
      })}

      {/* PLASMA MEMBRANE (LIPID BILAYER WITH PROTEIN CHANNELS) */}
      <ellipse cx="400" cy="240" rx="340" ry="185" fill="url(#cytoplasmGrad)" stroke="#38bdf8" strokeWidth="7" filter="drop-shadow(0 0 20px rgba(56,189,248,0.25))" />
      {/* Inner Lipid Bilayer Line */}
      <ellipse cx="400" cy="240" rx="333" ry="178" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="6 4" />

      {/* TRANSMEMBRANE PROTEIN TRANSPORT CHANNELS */}
      <rect x="180" y="95" width="22" height="14" rx="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
      <rect x="600" y="115" width="22" height="14" rx="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />

      {/* 1. NUCLEUS (Genetic Master Control) */}
      <g transform="translate(320, 230)">
        {/* Outer Nuclear Envelope */}
        <circle r="75" fill="url(#nucleusGrad)" stroke="#c084fc" strokeWidth="4" filter="drop-shadow(0 0 15px rgba(168,85,247,0.4))" />
        {/* Nuclear Pores around membrane */}
        {Array.from({ length: 12 }).map((_, pi) => {
          const angle = pi * (Math.PI / 6);
          return <circle key={`pore-${pi}`} cx={Math.cos(angle) * 75} cy={Math.sin(angle) * 75} r="3" fill="#0f172a" />;
        })}
        {/* Nucleolus (Ribosome synthesis factory) */}
        <circle cx="-12" cy="-10" r="26" fill="#3b0764" stroke="#a855f7" strokeWidth="2" />
        <text x="-12" y="-6" fill="#f3e8ff" fontSize="8" fontWeight="black" textAnchor="middle">
          NUCLEOLUS
        </text>
        {/* Chromatin / DNA Fibers network */}
        <path d="M -40 20 Q 0 -10 30 25 T 50 -15" fill="none" stroke="#e9d5ff" strokeWidth="2" opacity="0.75" />
        <text x="10" y="45" fill="#ffffff" fontSize="10" fontWeight="900">
          NUCLEUS (DNA)
        </text>
      </g>

      {/* 2. MITOCHONDRIA (ATP Synthesis Powerhouses) */}
      <g transform="translate(560, 180) rotate(-20)">
        <ellipse cx="0" cy="0" rx="55" ry="28" fill="url(#mitochondriaGrad)" stroke="#fbbf24" strokeWidth="3" filter="drop-shadow(0 0 10px rgba(245,158,11,0.5))" />
        {/* Convoluted Inner Cristae Folds */}
        <path d="M -38 -12 Q -20 15 0 -12 Q 20 15 38 -12" fill="none" stroke="#78350f" strokeWidth="3" />
        <path d="M -30 12 Q -10 -15 10 12 Q 30 -15 40 10" fill="none" stroke="#78350f" strokeWidth="2.5" />
        {/* ATP Molecular Sparkles */}
        <circle cx={Math.sin(particleTick * 0.1) * 20} cy={Math.cos(particleTick * 0.1) * 8} r="4" fill="#fef08a" />
        <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
          MITOCHONDRIA
        </text>
        <text x="0" y="16" fill="#fef08a" fontSize="7" fontWeight="bold" textAnchor="middle">
          ATP Synthase ⚡
        </text>
      </g>

      {/* Second Mitochondria */}
      <g transform="translate(230, 320) rotate(35)">
        <ellipse cx="0" cy="0" rx="42" ry="22" fill="url(#mitochondriaGrad)" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M -25 -8 Q 0 10 25 -8" fill="none" stroke="#78350f" strokeWidth="2" />
        <text x="0" y="3" fill="#ffffff" fontSize="7.5" fontWeight="black" textAnchor="middle">
          ATP Plant
        </text>
      </g>

      {/* 3. ROUGH ENDOPLASMIC RETICULUM (Studded with Ribosomes) */}
      <g transform="translate(210, 180)">
        <path
          d="M 20 -50 C -30 -40 -30 10 20 20 C -25 30 -25 70 20 80"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Ribosome Granules */}
        {Array.from({ length: 12 }).map((_, ri) => (
          <circle key={`ribo-${ri}`} cx={-15 + (ri % 3) * 12} cy={-40 + ri * 10} r="2.5" fill="#fde047" />
        ))}
        <text x="-40" y="95" fill="#67e8f9" fontSize="8" fontWeight="bold">
          Rough ER (Ribosomes)
        </text>
      </g>

      {/* 4. GOLGI APPARATUS (Protein Packaging & Vesicles) */}
      <g transform="translate(480, 310)">
        <path d="M -40 -12 C 0 -22 40 -22 80 -12" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
        <path d="M -35 2 C 0 -8 40 -8 75 2" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
        <path d="M -30 16 C 0 6 40 6 70 16" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
        {/* Budding Secretory Transport Vesicles */}
        <circle cx={85 + Math.sin(particleTick * 0.1) * 8} cy="0" r="5" fill="#fb923c" stroke="#fed7aa" strokeWidth="1.5" />
        <circle cx={95 + Math.cos(particleTick * 0.1) * 10} cy="20" r="4.5" fill="#fb923c" stroke="#fed7aa" strokeWidth="1.5" />
        <text x="20" y="34" fill="#fdba74" fontSize="8" fontWeight="bold">
          Golgi Apparatus
        </text>
      </g>

      {/* 5. LYSOSOMES (Digestive Enzymes) */}
      <g transform="translate(530, 95)">
        <circle r="14" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
        <text x="0" y="3" fill="#ffffff" fontSize="6.5" fontWeight="black" textAnchor="middle">
          LYSOSOME
        </text>
      </g>

      {/* TOP ANNOTATION BOX */}
      <g transform="translate(30, 25)">
        <rect x="0" y="0" width="310" height="60" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" opacity="0.95" />
        <text x="14" y="22" fill="#38bdf8" fontSize="12" fontWeight="900">
          🔬 EUKARYOTIC CELLULAR MICROCOSM
        </text>
        <text x="14" y="38" fill="#cbd5e1" fontSize="10">
          Mitochondria oxidize glucose for ATP; Ribosomes translate
        </text>
        <text x="14" y="52" fill="#a855f7" fontSize="10" fontWeight="bold">
          mRNA into proteins; Golgi vesicles ship to membrane!
        </text>
      </g>
    </svg>
  );
};

// ==========================================
// SCENE: ENHANCED CUSTOM DYNAMIC APPARATUS
// ==========================================
export const EnhancedCustomDynamicScene: React.FC<ExtendedSceneProps> = ({
  simulation,
  currentStageIndex,
  currentStage,
  knobValues,
  onChangeKnob,
  particleTick,
  speed,
  difficulty,
  soundEnabled
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Knobs: flux_rate, core_intensity, field_damping
  const fluxRate = typeof knobValues.flux_rate === 'number' ? knobValues.flux_rate : 70;
  const coreIntensity = typeof knobValues.core_intensity === 'number' ? knobValues.core_intensity : 80;

  // Real-time oscilloscope calculation
  const wavePoints = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const x = 580 + i * 4.8;
      const y = 60 + Math.sin(i * 0.35 + (particleTick * 0.12 * speed)) * 18 * (coreIntensity / 100);
      return `${x},${y}`;
    }).join(' ');
  }, [particleTick, speed, coreIntensity]);

  return (
    <svg viewBox="0 0 800 460" className="w-full h-full select-none rounded-2xl overflow-hidden bg-slate-950">
      <defs>
        <linearGradient id="cyberLabBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="40%" stopColor="#0b1329" />
          <stop offset="100%" stopColor="#050a18" />
        </linearGradient>
        <radialGradient id="plasmaCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#6366f1" />
          <stop offset="75%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fluxBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="460" fill="url(#cyberLabBg)" />

      {/* SCIENTIFIC LAB GRID MATRIX */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`gl-x-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="460" stroke="#1e293b" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 8" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`gl-y-${i}`} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="#1e293b" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 8" />
      ))}

      {/* OSCILLOSCOPE MONITOR (TOP RIGHT) */}
      <g transform="translate(0, 0)">
        <rect x="560" y="20" width="215" height="80" rx="10" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
        <text x="572" y="38" fill="#38bdf8" fontSize="9" fontWeight="900">
          OSCILLOSCOPE • LIVE HARMONICS
        </text>
        {/* Waveform line */}
        <polyline points={wavePoints} fill="none" stroke="#22c55e" strokeWidth="2.5" filter="drop-shadow(0 0 6px #22c55e)" />
        <text x="760" y="92" fill="#64748b" fontSize="8" textAnchor="end">
          Freq: {Math.round(440 * (speed || 1))} Hz • Amp: {coreIntensity}%
        </text>
      </g>

      {/* DYNAMIC PIPELINE CONNECTOR */}
      <line x1="80" y1="230" x2="720" y2="230" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      <line x1="80" y1="230" x2="720" y2="230" stroke="url(#fluxBeamGrad)" strokeWidth="6" strokeDasharray="14 8" strokeDashoffset={-particleTick * 2.5} />

      {/* 1. INPUT ACCELERATOR CHAMBER (LEFT) */}
      <g
        transform="translate(130, 230)"
        className="cursor-pointer"
        onClick={() => setSelectedHotspot("Input Generator: Injects initial energetic particles and foundational matter into the test field.")}
      >
        <circle r="46" fill="#0f172a" stroke="#22c55e" strokeWidth="2.5" />
        <circle r="36" fill="#14532d" opacity="0.4" />
        <text x="0" y="-8" fill="#86efac" fontSize="10" fontWeight="900" textAnchor="middle">
          INPUT FLUX
        </text>
        <text x="0" y="8" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle">
          ⚡ {fluxRate}%
        </text>
        <text x="0" y="24" fill="#a7f3d0" fontSize="8" textAnchor="middle">
          Source Reactant
        </text>
      </g>

      {/* 2. REACTION / PHENOMENON FOCAL CORE (CENTER) */}
      <g
        transform="translate(400, 230)"
        className="cursor-pointer"
        onClick={() => setSelectedHotspot(`Central Reactor Core: Evaluates the fundamental mechanism of "${currentStage.title}" at molecular scale.`)}
      >
        {/* Pulsing Plasma Halo */}
        <circle r={75 + Math.sin(particleTick * 0.1) * 8} fill="url(#plasmaCoreGlow)" />
        {/* Orbital Containment Rings */}
        <ellipse
          cx="0"
          cy="0"
          rx="68"
          ry="32"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="8 6"
          transform={`rotate(${particleTick * 1.5})`}
        />
        <ellipse
          cx="0"
          cy="0"
          rx="68"
          ry="32"
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          strokeDasharray="8 6"
          transform={`rotate(${-particleTick * 1.8})`}
        />
        {/* Center Quantum Sphere */}
        <circle r="42" fill="#0284c7" stroke="#ffffff" strokeWidth="3" filter="drop-shadow(0 0 15px #38bdf8)" />
        <circle r="20" fill="#0369a1" />
        <text x="0" y="-5" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">
          PHENOMENON
        </text>
        <text x="0" y="10" fill="#bae6fd" fontSize="9" fontWeight="bold" textAnchor="middle">
          CORE LAB
        </text>

        {/* Orbiting Quantum Particle */}
        <g transform={`rotate(${particleTick * 3}) translate(60, 0)`}>
          <circle r="5" fill="#fef08a" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 0 6px #fef08a)" />
        </g>
      </g>

      {/* 3. PRODUCT / ENERGY OUTPUT CHAMBER (RIGHT) */}
      <g
        transform="translate(670, 230)"
        className="cursor-pointer"
        onClick={() => setSelectedHotspot("Output Collector: Measures the resulting energy transformation, work produced, and state change.")}
      >
        <circle r="46" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
        <circle r="36" fill="#581c87" opacity="0.4" />
        <text x="0" y="-8" fill="#d8b4fe" fontSize="10" fontWeight="900" textAnchor="middle">
          OUTPUT WORK
        </text>
        <text x="0" y="8" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle">
          🎯 {Math.min(99, Math.round((fluxRate * coreIntensity) / 80))}%
        </text>
        <text x="0" y="24" fill="#e9d5ff" fontSize="8" textAnchor="middle">
          Transformation
        </text>
      </g>

      {/* STAGE TIMELINE / PODS (BOTTOM) */}
      <g transform="translate(0, 395)">
        <rect x="40" y="-20" width="720" height="60" rx="14" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
        {simulation.stages.map((st, idx) => {
          const px = 100 + (idx * 600) / (simulation.stages.length - 1 || 1);
          const isActive = idx === currentStageIndex;

          return (
            <g key={st.id} transform={`translate(${px}, 10)`}>
              <circle
                r={isActive ? 16 : 12}
                fill={isActive ? '#38bdf8' : '#334155'}
                stroke={isActive ? '#ffffff' : '#64748b'}
                strokeWidth={isActive ? 2.5 : 1.5}
                filter={isActive ? 'drop-shadow(0 0 8px #38bdf8)' : undefined}
              />
              <text x="0" y="3.5" fill={isActive ? '#0f172a' : '#cbd5e1'} fontSize={isActive ? '11' : '9'} fontWeight="900" textAnchor="middle">
                {st.stageNumber}
              </text>
              <text x="0" y="24" fill={isActive ? '#38bdf8' : '#64748b'} fontSize="9" fontWeight={isActive ? 'bold' : 'normal'} textAnchor="middle">
                {st.title.slice(0, 14)}
              </text>
            </g>
          );
        })}
      </g>

      {/* TOP FOCUS CARD (ACTIVE STAGE PRINCIPLE) */}
      <g transform="translate(40, 20)">
        <rect x="0" y="0" width="480" height="70" rx="14" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" opacity="0.95" />
        <text x="16" y="22" fill="#a5b4fc" fontSize="12" fontWeight="900">
          STAGE {currentStageIndex + 1}: {currentStage.title}
        </text>
        <text x="16" y="42" fill="#e2e8f0" fontSize="11" fontWeight="medium">
          {currentStage.subtitle}
        </text>
        <text x="16" y="58" fill="#38bdf8" fontSize="9.5" fontWeight="bold">
          ⚡ Focus Principle: {currentStage.actionPrompt || "Interact with sliders to explore scientific response!"}
        </text>
      </g>

      {/* CLICKED HOTSPOT TOOLTIP MODAL */}
      {selectedHotspot && (
        <g transform="translate(400, 335)">
          <rect x="-240" y="-22" width="480" height="44" rx="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.6))" />
          <text x="0" y="4" fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">
            💡 {selectedHotspot}
          </text>
        </g>
      )}
    </svg>
  );
};

