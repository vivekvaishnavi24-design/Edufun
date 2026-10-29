import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  CloudRain,
  Cloud,
  Zap,
  Info,
  Sparkles,
  Layers,
  Activity,
  Droplets,
  Flame,
  Lightbulb,
  Scale,
  Eye,
  Microscope,
  CheckCircle2,
  Volume1,
  Sparkle
} from 'lucide-react';
import { AnimationStage, InteractiveKnob, ImagineCreativitySimulation, SimulationDifficulty } from '../types';
import { playWaterDropSound, playPhotonZapSound, playStomataPopSound, playSugarChimeSound } from '../utils/audio';
import {
  AerodynamicsFlightScene,
  GravityOrbitsScene,
  RocketPropulsionScene,
  SolarEclipseScene,
  SoundWavesScene,
  LightOpticsScene,
  AtomQuantumScene,
  DnaReplicationScene,
  CellBiologyScene,
  VolcanoEruptionScene,
  DigestiveSystemScene,
  EnhancedCustomDynamicScene
} from './simulation-scenes/ExtendedSimulationScenes';

interface InteractiveSimulationStageProps {
  simulation: ImagineCreativitySimulation;
  currentStageIndex: number;
  onSelectStageIndex: (idx: number) => void;
  knobValues: Record<string, any>;
  onChangeKnob: (id: string, value: any) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  difficulty?: SimulationDifficulty;
  onChangeDifficulty?: (diff: SimulationDifficulty) => void;
}

export const InteractiveSimulationStage: React.FC<InteractiveSimulationStageProps> = ({
  simulation,
  currentStageIndex,
  onSelectStageIndex,
  knobValues,
  onChangeKnob,
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  difficulty = 'intermediate',
  onChangeDifficulty
}) => {
  const currentStage: AnimationStage = simulation.stages[currentStageIndex] || simulation.stages[0];
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [particleTick, setParticleTick] = useState<number>(0);
  const [lightningFlash, setLightningFlash] = useState<boolean>(false);
  const [photoViewMode, setPhotoViewMode] = useState<'split' | 'whole_plant' | 'chloroplast_lab'>('split');
  const [waterPulseCount, setWaterPulseCount] = useState<number>(0);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'sunset' | 'night'>('noon');
  const [isRainingNow, setIsRainingNow] = useState<boolean>(false);
  const [nutrientBoost, setNutrientBoost] = useState<boolean>(false);
  const [laserPulseActive, setLaserPulseActive] = useState<boolean>(false);
  const [calvinCrankSpin, setCalvinCrankSpin] = useState<number>(0);
  const [showLeafAnatomy, setShowLeafAnatomy] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [inspectedMolecule, setInspectedMolecule] = useState<{
    name: string;
    formula: string;
    desc: string;
    atoms: string;
    role: string;
    diagram?: string;
  } | null>(null);
  const [activeExperimentName, setActiveExperimentName] = useState<string | null>(null);

  // Animation ticker for moving particles and dynamic waves (respects isPlaying and speed multiplier)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let tickAccumulator = 0;

    const updateTicker = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isPlaying) {
        tickAccumulator += delta * 60 * (speed || 1);
        if (tickAccumulator >= 1) {
          const step = Math.floor(tickAccumulator);
          tickAccumulator -= step;
          setParticleTick((prev) => (prev + step) % 100000);
        }
      }
      animId = requestAnimationFrame(updateTicker);
    };

    animId = requestAnimationFrame(updateTicker);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  // Lightning effect when lightning knob is enabled
  useEffect(() => {
    if (!knobValues.lightning_storm) {
      setLightningFlash(false);
      return;
    }
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setLightningFlash(true);
        setTimeout(() => setLightningFlash(false), 120);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [knobValues.lightning_storm]);

  // Derived knob helpers
  const sunHeat = Number(knobValues.sun_heat ?? 60);
  const cloudDensity = Number(knobValues.cloud_density ?? 55);
  const isRaining = Boolean(knobValues.is_raining ?? true);
  const circuitSwitch = Boolean(knobValues.circuit_switch ?? true);
  const voltage = Number(knobValues.voltage_power ?? 12);
  const resistance = Number(knobValues.bulb_resistance ?? 6);
  const tempCelsius = Number(knobValues.temperature_celsius ?? 25);
  const heartBpm = Number(knobValues.heart_rate_bpm ?? 75);
  const mathStep = Number(knobValues.eq_step_slider ?? (currentStageIndex + 1));
  const sunlightPower = Number(knobValues.sunlight_power ?? 75);
  const waterFlow = Number(knobValues.water_flow ?? 70);
  const co2Level = Number(knobValues.co2_level ?? 60);
  const stomataOpen = Boolean(knobValues.stomata_open ?? true);
  const showMicroZoom = Boolean(knobValues.zoom_chloroplast ?? true);

  // ==========================================
  // SCENE 1: WATER CYCLE & WEATHER
  // ==========================================
  const renderWaterCycleScene = () => {
    const skyDarkness = Math.min(0.65, (cloudDensity / 100) * 0.7);
    const sunGlowRadius = 25 + (sunHeat / 100) * 20;
    const vaporCount = Math.floor(6 + (sunHeat / 100) * 12);

    return (
      <svg
        viewBox="0 0 800 460"
        className="w-full h-full select-none rounded-2xl overflow-hidden"
        style={{
          background: lightningFlash
            ? '#e2e8f0'
            : `linear-gradient(180deg, rgba(${Math.round(56 - skyDarkness * 30)}, ${Math.round(189 - skyDarkness * 100)}, ${Math.round(248 - skyDarkness * 80)}, 1) 0%, rgba(${Math.round(186 - skyDarkness * 80)}, ${Math.round(230 - skyDarkness * 60)}, 253, 1) 50%, rgba(224, 242, 254, 1) 100%)`
        }}
      >
        <defs>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cloudDensity > 70 ? "#94a3b8" : "#ffffff"} />
            <stop offset="100%" stopColor={cloudDensity > 70 ? "#475569" : "#cbd5e1"} />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. SUN & SOLAR RAYS */}
        <g
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => setActiveTooltip("☀️ The Sun: Provides thermal radiation that heats water surfaces, evaporating liquid H₂O into atmospheric vapor.")}
        >
          {/* Animated pulsing solar aura */}
          <circle
            cx="690"
            cy="85"
            r={sunGlowRadius + Math.sin(particleTick * 0.05) * 4}
            fill="#fef08a"
            opacity="0.35"
            filter="url(#glow)"
          />
          {/* Rotating sun rays */}
          <g transform={`rotate(${particleTick * 0.5 * (speed || 1)}, 690, 85)`}>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="690"
                y1="50"
                x2="690"
                y2="40"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${deg}, 690, 85)`}
              />
            ))}
          </g>
          {/* Sun body */}
          <circle cx="690" cy="85" r="28" fill="url(#sunGrad)" filter="url(#glow)" />
          {/* Solar heat waves radiating down */}
          {[0, 1, 2].map((i) => {
            const offset = (particleTick * 2 + i * 40) % 120;
            return (
              <path
                key={i}
                d={`M ${650 - i * 15} ${120 + offset} Q ${630 - i * 15} ${140 + offset} ${610 - i * 15} ${160 + offset}`}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                opacity={Math.max(0, 1 - offset / 120) * (sunHeat / 100)}
              />
            );
          })}
        </g>

        {/* 2. MOUNTAINS (Left background) */}
        <polygon points="0,320 90,160 210,320" fill="url(#mountainGrad)" />
        <polygon points="70,160 90,160 110,195 90,190 80,195" fill="#f8fafc" /> {/* Snowcap 1 */}
        <polygon points="120,320 230,120 360,320" fill="url(#mountainGrad)" />
        <polygon points="205,120 230,120 255,165 240,160 220,168 215,160" fill="#f8fafc" /> {/* Snowcap 2 */}

        {/* Green rolling hills & vegetation */}
        <path d="M 0 320 Q 180 270 380 320 L 380 460 L 0 460 Z" fill="url(#grassGrad)" />

        {/* Mountain stream & Waterfall */}
        <path
          d={`M 225 170 Q 240 230 210 280 T 260 340 T 360 360 T 480 380`}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8 4"
          strokeDashoffset={-particleTick * 3}
          className="cursor-pointer"
          onClick={() => setActiveTooltip("🏞️ Runoff & River Flow: Gravity pulls liquid water downhill from high mountain slopes through streams into the ocean.")}
        />

        {/* 3. OCEAN RESERVOIR (Right & bottom foreground) */}
        <path
          d={`M 350 340 Q 450 ${335 + Math.sin(particleTick * 0.04) * 4} 550 340 T 800 340 L 800 460 L 350 460 Z`}
          fill="url(#oceanGrad)"
          className="cursor-pointer"
          onClick={() => setActiveTooltip("🌊 Ocean Reservoir: Holds 96.5% of Earth's water! It is the primary engine of global evaporation.")}
        />
        {/* Animated wave crests */}
        <path
          d={`M 380 345 Q 430 ${340 + Math.sin(particleTick * 0.06) * 3} 480 345 T 580 345 T 680 345 T 780 345`}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="2.5"
          opacity="0.8"
        />
        <path
          d={`M 400 365 Q 460 ${360 + Math.cos(particleTick * 0.05) * 3} 520 365 T 640 365 T 760 365`}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.8"
          opacity="0.5"
        />

        {/* 4. EVAPORATION & TRANSPIRATION VAPOR PARTICLES (Rising Up) */}
        <g
          className="cursor-pointer"
          onClick={() => setActiveTooltip("🫧 Evaporation: Liquid water molecules absorb thermal kinetic energy and escape into the air as invisible gas vapor!")}
        >
          {Array.from({ length: vaporCount }).map((_, idx) => {
            const baseX = 420 + ((idx * 31) % 340);
            const yOffset = (particleTick * 1.8 * (speed || 1) + idx * 28) % 220;
            const currentY = 340 - yOffset;
            const wobble = Math.sin(particleTick * 0.08 + idx) * 12;
            const opacity = Math.sin((yOffset / 220) * Math.PI) * (sunHeat / 100);

            return (
              <g key={idx} transform={`translate(${baseX + wobble}, ${currentY})`}>
                <circle r="4.5" fill="#e0f2fe" opacity={opacity} />
                <circle r="2" fill="#ffffff" opacity={opacity} />
                {/* Wavy vapor tail */}
                <path
                  d="M 0 5 Q 3 10 0 15 Q -3 20 0 25"
                  fill="none"
                  stroke="#bae6fd"
                  strokeWidth="1.5"
                  opacity={opacity * 0.7}
                />
              </g>
            );
          })}
        </g>

        {/* Plant Transpiration on mountain slope */}
        <g
          transform="translate(130, 280)"
          className="cursor-pointer"
          onClick={() => setActiveTooltip("🍃 Transpiration: Plants draw water through roots and breathe out vapor through microscopic leaf stomata!")}
        >
          {/* Tree trunk */}
          <rect x="-4" y="0" width="8" height="22" fill="#78350f" rx="2" />
          {/* Foliage */}
          <polygon points="0,-25 -16,0 16,0" fill="#15803d" />
          <polygon points="0,-15 -14,10 14,10" fill="#16a34a" />
          {/* Transpiration vapor */}
          {Array.from({ length: 3 }).map((_, i) => {
            const tOffset = (particleTick * 1.5 + i * 25) % 60;
            return (
              <circle
                key={i}
                cx={Math.sin(particleTick * 0.1 + i) * 6}
                cy={-25 - tOffset}
                r="2.5"
                fill="#bbf7d0"
                opacity={Math.max(0, 1 - tOffset / 60)}
              />
            );
          })}
        </g>

        {/* 5. CONDENSATION & CLOUDS */}
        <g
          transform="translate(240, 45)"
          className="cursor-pointer transition-transform hover:scale-102"
          onClick={() => setActiveTooltip("☁️ Condensation: High altitude freezing air causes vapor to cool and clump around microscopic dust particles to form clouds!")}
        >
          {/* Cloud shadow/bulk */}
          <path
            d={`M 20 50 Q 20 20 50 25 Q 75 0 115 15 Q 155 0 190 20 Q 230 15 240 50 Q 260 65 245 85 Q 225 100 180 95 Q 140 100 100 95 Q 50 100 30 85 Q 10 70 20 50 Z`}
            fill="url(#cloudGrad)"
            filter="url(#glow)"
            style={{
              transform: `scale(${0.85 + (cloudDensity / 100) * 0.3})`,
              transformOrigin: "120px 50px"
            }}
          />
          {/* Second cloud cluster */}
          <path
            d="M 170 60 Q 185 30 220 35 Q 245 15 280 30 Q 315 25 325 55 Q 345 70 330 90 Q 290 100 240 95 Q 190 98 175 80 Z"
            fill="url(#cloudGrad)"
            opacity="0.9"
            style={{
              transform: `scale(${0.8 + (cloudDensity / 100) * 0.35})`,
              transformOrigin: "250px 60px"
            }}
          />
        </g>

        {/* Lightning strike when storm is active */}
        {lightningFlash && (
          <polyline
            points="330,120 310,190 335,210 295,290"
            stroke="#fef08a"
            strokeWidth="4"
            fill="none"
            filter="url(#glow)"
          />
        )}

        {/* 6. PRECIPITATION (Rain Downpour) */}
        {isRaining && (
          <g
            className="cursor-pointer"
            onClick={() => setActiveTooltip("🌧️ Precipitation: Heavy water droplets fall back to Earth under gravity as rain, snow, sleet, or hail!")}
          >
            {Array.from({ length: 36 }).map((_, idx) => {
              const startX = 260 + (idx * 14);
              const rainOffset = (particleTick * 6 * (speed || 1) + idx * 30) % 240;
              const dropY = 120 + rainOffset;
              const angleX = dropY * 0.25; // slanted falling rain
              return (
                <g key={idx}>
                  <line
                    x1={startX + angleX}
                    y1={dropY}
                    x2={startX + angleX - 4}
                    y2={dropY + 12}
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  {/* Splash ripple at landing */}
                  {rainOffset > 210 && (
                    <ellipse
                      cx={startX + angleX}
                      cy={340 + (idx % 4) * 8}
                      rx={(rainOffset - 210) * 0.35}
                      ry={(rainOffset - 210) * 0.15}
                      fill="none"
                      stroke="#7dd3fc"
                      strokeWidth="1.2"
                      opacity={Math.max(0, 1 - (rainOffset - 210) / 30)}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 7. ACTIVE STAGE HIGHLIGHT INDICATOR */}
        {currentStage.stageNumber === 1 && (
          <g transform="translate(560, 250)">
            <rect x="0" y="0" width="190" height="52" rx="12" fill="#0f172a" fillOpacity="0.88" stroke="#38bdf8" strokeWidth="2" />
            <text x="14" y="24" fill="#38bdf8" fontSize="13" fontWeight="bold">Stage 1: Evaporation ☀️</text>
            <text x="14" y="42" fill="#e2e8f0" fontSize="11">Solar heat vaporizes ocean H₂O</text>
            <polygon points="95,52 105,52 100,62" fill="#38bdf8" />
          </g>
        )}
        {currentStage.stageNumber === 2 && (
          <g transform="translate(290, 12)">
            <rect x="0" y="0" width="200" height="52" rx="12" fill="#0f172a" fillOpacity="0.88" stroke="#a855f7" strokeWidth="2" />
            <text x="14" y="24" fill="#c084fc" fontSize="13" fontWeight="bold">Stage 2: Condensation ☁️</text>
            <text x="14" y="42" fill="#e2e8f0" fontSize="11">Vapor chills into fluffy clouds</text>
            <polygon points="100,52 110,52 105,62" fill="#a855f7" />
          </g>
        )}
        {currentStage.stageNumber === 3 && (
          <g transform="translate(260, 200)">
            <rect x="0" y="0" width="200" height="52" rx="12" fill="#0f172a" fillOpacity="0.88" stroke="#0284c7" strokeWidth="2" />
            <text x="14" y="24" fill="#38bdf8" fontSize="13" fontWeight="bold">Stage 3: Precipitation 🌧️</text>
            <text x="14" y="42" fill="#e2e8f0" fontSize="11">Heavy drops fall under gravity</text>
            <polygon points="100,52 110,52 105,62" fill="#0284c7" />
          </g>
        )}
        {currentStage.stageNumber === 4 && (
          <g transform="translate(140, 360)">
            <rect x="0" y="0" width="210" height="52" rx="12" fill="#0f172a" fillOpacity="0.88" stroke="#22c55e" strokeWidth="2" />
            <text x="14" y="24" fill="#4ade80" fontSize="13" fontWeight="bold">Stage 4: Collection & Runoff 🌊</text>
            <text x="14" y="42" fill="#e2e8f0" fontSize="11">Rivers return water to the sea</text>
            <polygon points="105,-10 115,-10 110,0" fill="#22c55e" />
          </g>
        )}

        {/* Interactive Action Badges on canvas */}
        <g transform="translate(18, 22)">
          <rect x="0" y="0" width="150" height="34" rx="8" fill="#0f172a" fillOpacity="0.85" stroke="#475569" strokeWidth="1" />
          <circle cx="16" cy="17" r="5" fill="#22c55e" className="animate-pulse" />
          <text x="30" y="21" fill="#f8fafc" fontSize="12" fontWeight="bold">Interactive Earth Lab</text>
        </g>
      </svg>
    );
  };

  // ==========================================
  // SCENE 2: ELECTRIC CIRCUIT
  // ==========================================
  const renderElectricCircuitScene = () => {
    const currentAmp = circuitSwitch ? (voltage / resistance).toFixed(2) : "0.00";
    const powerWatts = circuitSwitch ? ((voltage * voltage) / resistance).toFixed(1) : "0.0";
    const bulbGlowOpacity = circuitSwitch ? Math.min(1, voltage / 24) : 0;
    const bulbGlowRadius = circuitSwitch ? 30 + (voltage / 24) * 45 : 0;

    return (
      <svg
        viewBox="0 0 800 460"
        className="w-full h-full select-none rounded-2xl overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%)' }}
      >
        <defs>
          <radialGradient id="bulbAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. COPPER WIRE LOOP */}
        <path
          d="M 180 120 L 620 120 Q 640 120 640 140 L 640 320 Q 640 340 620 340 L 180 340 Q 160 340 160 320 L 160 140 Q 160 120 180 120 Z"
          fill="none"
          stroke="#b45309"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 180 120 L 620 120 Q 640 120 640 140 L 640 320 Q 640 340 620 340 L 180 340 Q 160 340 160 320 L 160 140 Q 160 120 180 120 Z"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* 2. BATTERY COMPONENT (Left Side) */}
        <g
          transform="translate(160, 230)"
          className="cursor-pointer"
          onClick={() => setActiveTooltip("🔋 Battery (DC Voltage Source): Stores chemical energy that creates electric potential (Voltage), pushing electrons!")}
        >
          {/* Main battery body */}
          <rect x="-35" y="-55" width="70" height="110" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
          <rect x="-30" y="-50" width="60" height="50" fill="#3b82f6" rx="4" />
          <rect x="-30" y="0" width="60" height="50" fill="#ef4444" rx="4" />
          {/* (+) and (-) labels */}
          <text x="0" y="-20" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">+</text>
          <text x="0" y="32" fill="#ffffff" fontSize="22" fontWeight="bold" textAnchor="middle">-</text>
          <text x="0" y="75" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">{voltage}V Battery</text>
        </g>

        {/* 3. INTERACTIVE KNIFE SWITCH (Top Wire) */}
        <g
          transform="translate(360, 120)"
          className="cursor-pointer"
          onClick={() => onChangeKnob('circuit_switch', !circuitSwitch)}
        >
          {/* Contacts */}
          <circle cx="-40" cy="0" r="10" fill="#64748b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="40" cy="0" r="10" fill="#64748b" stroke="#cbd5e1" strokeWidth="2" />
          {/* Switch blade arm */}
          <line
            x1="-40"
            y1="0"
            x2={circuitSwitch ? 40 : 25}
            y2={circuitSwitch ? 0 : -45}
            stroke={circuitSwitch ? "#22c55e" : "#ef4444"}
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <text x="0" y="-25" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
            {circuitSwitch ? "Switch: CLOSED (ON) 🟢" : "Switch: OPEN (OFF) 🔴"}
          </text>
        </g>

        {/* 4. LIGHT BULB (Right Wire) */}
        <g
          transform="translate(640, 230)"
          className="cursor-pointer"
          onClick={() => setActiveTooltip("💡 Tungsten Light Bulb: High resistance filament heats up to over 2500°C and glows incandescently!")}
        >
          {/* Radial light aura */}
          {circuitSwitch && (
            <circle cx="0" cy="0" r={bulbGlowRadius} fill="url(#bulbAura)" opacity={bulbGlowOpacity} />
          )}
          {/* Glass bulb shell */}
          <circle cx="0" cy="0" r="38" fill={circuitSwitch ? "#fef08a" : "#334155"} fillOpacity={circuitSwitch ? "0.45" : "0.3"} stroke="#cbd5e1" strokeWidth="3" />
          {/* Bulb base */}
          <rect x="-14" y="32" width="28" height="18" fill="#64748b" rx="2" />
          <path d="M -12 38 L 12 38 M -12 44 L 12 44" stroke="#475569" strokeWidth="2" />
          {/* Filament coils */}
          <path
            d="M -10 20 L -6 -8 Q 0 -18 6 -8 L 10 20"
            fill="none"
            stroke={circuitSwitch ? "#f59e0b" : "#94a3b8"}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text x="0" y="75" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
            {resistance}Ω Bulb ({powerWatts}W)
          </text>
        </g>

        {/* 5. MOVING ELECTRON PARTICLES */}
        {circuitSwitch && (
          <g>
            {Array.from({ length: 24 }).map((_, idx) => {
              // Loop perimeter: ~1600 units
              const speedMultiplier = (voltage / resistance) * 0.8 * (speed || 1);
              const totalDist = 1440;
              const step = (particleTick * speedMultiplier * 3 + (idx * totalDist) / 24) % totalDist;

              let x = 160;
              let y = 120;
              // Perimeter coordinates:
              // Segment 1: top wire (160,120) to (640,120) = 480
              // Segment 2: right wire (640,120) to (640,340) = 220
              // Segment 3: bottom wire (640,340) to (160,340) = 480
              // Segment 4: left wire (160,340) to (160,120) = 220
              if (step < 480) {
                x = 160 + step;
                y = 120;
              } else if (step < 700) {
                x = 640;
                y = 120 + (step - 480);
              } else if (step < 1180) {
                x = 640 - (step - 700);
                y = 340;
              } else {
                x = 160;
                y = 340 - (step - 1180);
              }

              return (
                <g key={idx} transform={`translate(${x}, ${y})`}>
                  <circle r="6" fill="#fef08a" />
                  <circle r="3" fill="#f59e0b" />
                  <text x="0" y="3" fill="#78350f" fontSize="8" fontWeight="black" textAnchor="middle">e⁻</text>
                </g>
              );
            })}
          </g>
        )}

        {/* 6. REAL-TIME AMMETER GAUGE HUD (Center) */}
        <g transform="translate(400, 230)">
          <rect x="-110" y="-60" width="220" height="120" rx="16" fill="#0f172a" fillOpacity="0.95" stroke="#38bdf8" strokeWidth="2" />
          <text x="0" y="-32" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">⚡ LIVE DIGITAL AMMETER</text>
          <text x="0" y="8" fill={circuitSwitch ? "#4ade80" : "#ef4444"} fontSize="30" fontWeight="black" textAnchor="middle">
            {currentAmp} <tspan fontSize="18">Amps</tspan>
          </text>
          <text x="0" y="38" fill="#94a3b8" fontSize="12" textAnchor="middle">
            Ohm's Law: I = V ÷ R = {voltage}V ÷ {resistance}Ω
          </text>
        </g>
      </svg>
    );
  };

  // ==========================================
  // SCENE 3: PHOTOSYNTHESIS (HYPER-REALISTIC & 100% INTERACTIVE SIMULATION LAB)
  // ==========================================
  const renderPhotosynthesisScene = () => {
    // Stage-specific highlight flags
    const isStage1 = currentStage.stageNumber === 1; // Light Absorption
    const isStage2 = currentStage.stageNumber === 2; // H2O & CO2 Intake
    const isStage3 = currentStage.stageNumber === 3; // Water Splitting & Calvin Cycle
    const isStage4 = currentStage.stageNumber === 4; // Glucose & Oxygen Output

    // Realistic time-of-day solar modifiers
    const isNight = timeOfDay === 'night';
    const isSunset = timeOfDay === 'sunset';
    const isMorning = timeOfDay === 'morning';
    const isNoon = timeOfDay === 'noon';

    const solarFluxFactor = isNight ? 0 : isMorning ? 0.55 : isSunset ? 0.4 : (sunlightPower / 100);
    const effectiveWaterFlow = isRainingNow ? Math.min(100, waterFlow + 35) : waterFlow;
    const stomataFactor = (stomataOpen && !isNight) ? 1 : 0;

    const photonSpeed = solarFluxFactor * 4 * (speed || 1);
    const waterSpeed = (effectiveWaterFlow / 100) * 3.5 * (speed || 1);
    const calvinSpeed = (co2Level / 100) * (nutrientBoost ? 3.5 : 2.6) * (speed || 1);

    // Dynamic Photosynthesis Efficiency (0 to 100%)
    const rawEfficiency = Math.round(
      solarFluxFactor * (effectiveWaterFlow / 100) * (co2Level / 100) * stomataFactor * (nutrientBoost ? 1.2 : 1) * 100
    );
    const efficiency = Math.min(100, Math.max(0, rawEfficiency));
    const glucoseRate = (efficiency * 0.48).toFixed(1);
    const oxygenRate = (efficiency * 1.42).toFixed(1);

    // Active view mode: split, whole_plant, or chloroplast_lab
    const view = photoViewMode;

    // Trigger rain interaction
    const handleTriggerRain = () => {
      setIsRainingNow(true);
      if (soundEnabled) playWaterDropSound();
      setWaterPulseCount((prev) => prev + 1);
      setTimeout(() => setIsRainingNow(false), 3800);
    };

    // Trigger nutrient interaction
    const handleTriggerNutrients = () => {
      setNutrientBoost(true);
      if (soundEnabled) playSugarChimeSound();
      setTimeout(() => setNutrientBoost(false), 4200);
    };

    // Trigger laser burst
    const handleTriggerLaser = () => {
      setLaserPulseActive(true);
      if (soundEnabled) playPhotonZapSound();
      setTimeout(() => setLaserPulseActive(false), 1000);
    };

    // Trigger manual Calvin crank
    const handleCrankCalvinWheel = () => {
      setCalvinCrankSpin((prev) => prev + 1);
      if (soundEnabled) playSugarChimeSound();
    };

    // Trigger stomata toggle
    const handleToggleStomaPore = () => {
      onChangeKnob('stomata_open', !stomataOpen);
      if (soundEnabled) playStomataPopSound();
    };

    // Scenario Hypothesis presets
    const handleApplyScenario = (name: 'optimal' | 'drought' | 'night' | 'greenhouse') => {
      setActiveExperimentName(name);
      if (name === 'optimal') {
        setTimeOfDay('noon');
        onChangeKnob('sunlight_power', 90);
        onChangeKnob('water_flow', 85);
        onChangeKnob('co2_level', 75);
        onChangeKnob('stomata_open', true);
        if (soundEnabled) playWaterDropSound();
        setActiveTooltip("☀️ Optimal Spring Day: Maximum photosystem activation with balanced water and open stomata!");
      } else if (name === 'drought') {
        setTimeOfDay('noon');
        onChangeKnob('sunlight_power', 95);
        onChangeKnob('water_flow', 15);
        onChangeKnob('co2_level', 40);
        onChangeKnob('stomata_open', false);
        if (soundEnabled) playStomataPopSound();
        setActiveTooltip("🌵 Drought Stress: Guard cells close to prevent water loss (transpiration), starving the Calvin cycle of CO₂!");
      } else if (name === 'night') {
        setTimeOfDay('night');
        onChangeKnob('sunlight_power', 0);
        onChangeKnob('water_flow', 60);
        onChangeKnob('stomata_open', false);
        setActiveTooltip("🌙 Midnight Darkness: Zero photons available! Light-dependent reactions stop, halting ATP production.");
      } else if (name === 'greenhouse') {
        setTimeOfDay('noon');
        onChangeKnob('sunlight_power', 100);
        onChangeKnob('water_flow', 95);
        onChangeKnob('co2_level', 100);
        onChangeKnob('stomata_open', true);
        if (soundEnabled) playSugarChimeSound();
        setActiveTooltip("🧪 High CO₂ Greenhouse: Rubisco enzyme operates at peak saturation, supercharging glucose production!");
      }
    };

    // Dynamic sky background styling
    let skyBackground = 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 30%, #dcfce7 70%, #86efac 100%)';
    if (isMorning) {
      skyBackground = 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 25%, #dbeafe 60%, #bbf7d0 100%)';
    } else if (isSunset) {
      skyBackground = 'linear-gradient(180deg, #581c87 0%, #c2410c 35%, #f97316 70%, #ca8a04 100%)';
    } else if (isNight) {
      skyBackground = 'linear-gradient(180deg, #020617 0%, #0f172a 45%, #1e1b4b 80%, #052e16 100%)';
    }

    // Sun / Celestial body coordinates
    const celestialX = isNight ? 120 : isMorning ? 95 : isSunset ? 340 : 200;
    const celestialY = isNight ? 85 : isMorning ? 125 : isSunset ? 140 : 65;

    return (
      <svg
        viewBox="0 0 960 540"
        className="w-full h-full select-none rounded-2xl overflow-hidden font-sans"
        style={{ background: skyBackground }}
      >
        <defs>
          {/* Celestial Gradients */}
          <radialGradient id="sunRealisticGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>

          <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>

          <filter id="realGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="laserBeamGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Plant & Stem gradients */}
          <linearGradient id="stemRealisticGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          <linearGradient id="leafRealisticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="25%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Soil stratification */}
          <linearGradient id="soilStratifiedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isRainingNow ? "#451a03" : "#78350f"} />
            <stop offset="25%" stopColor={isRainingNow ? "#381403" : "#59260b"} />
            <stop offset="75%" stopColor="#2d1204" />
            <stop offset="100%" stopColor="#170802" />
          </linearGradient>

          {/* Volumetric Crepuscular Ray gradient */}
          <linearGradient id="godRayGrad" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#fde047" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
          </linearGradient>

          {/* Chloroplast Microscopic Gradients */}
          <linearGradient id="chloroDoubleMemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="50%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          <linearGradient id="thylakoidStackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* TOP INTERACTIVE COCKPIT & LIVE REAL-TIME DASHBOARD (Y: 10 to 52)          */}
        {/* ========================================================================= */}
        <g transform="translate(15, 10)">
          <rect x="0" y="0" width="930" height="44" rx="12" fill="#0f172a" fillOpacity="0.94" stroke="#334155" strokeWidth="1.5" />

          {/* 1. View Mode Switcher */}
          <g transform="translate(10, 8)">
            <g
              className="cursor-pointer"
              onClick={() => setPhotoViewMode('whole_plant')}
            >
              <rect
                x="0"
                y="0"
                width="110"
                height="28"
                rx="8"
                fill={view === 'whole_plant' ? '#15803d' : '#1e293b'}
                stroke={view === 'whole_plant' ? '#4ade80' : '#475569'}
                strokeWidth="1.2"
              />
              <text x="55" y="18" fill={view === 'whole_plant' ? '#ffffff' : '#cbd5e1'} fontSize="10.5" fontWeight="bold" textAnchor="middle">
                🌿 Whole Plant
              </text>
            </g>

            <g
              transform="translate(118, 0)"
              className="cursor-pointer"
              onClick={() => setPhotoViewMode('chloroplast_lab')}
            >
              <rect
                x="0"
                y="0"
                width="125"
                height="28"
                rx="8"
                fill={view === 'chloroplast_lab' ? '#047857' : '#1e293b'}
                stroke={view === 'chloroplast_lab' ? '#34d399' : '#475569'}
                strokeWidth="1.2"
              />
              <text x="62" y="18" fill={view === 'chloroplast_lab' ? '#ffffff' : '#cbd5e1'} fontSize="10.5" fontWeight="bold" textAnchor="middle">
                🔬 Chloroplast Zoom
              </text>
            </g>

            <g
              transform="translate(250, 0)"
              className="cursor-pointer"
              onClick={() => setPhotoViewMode('split')}
            >
              <rect
                x="0"
                y="0"
                width="105"
                height="28"
                rx="8"
                fill={view === 'split' ? '#4338ca' : '#1e293b'}
                stroke={view === 'split' ? '#818cf8' : '#475569'}
                strokeWidth="1.2"
              />
              <text x="52" y="18" fill={view === 'split' ? '#ffffff' : '#cbd5e1'} fontSize="10.5" fontWeight="bold" textAnchor="middle">
                ⚡ Dual View
              </text>
            </g>
          </g>

          {/* 2. Interactive Time of Day Selector */}
          <g transform="translate(375, 8)">
            {[
              { id: 'morning' as const, label: '🌅 Morning', icon: '🌅' },
              { id: 'noon' as const, label: '☀️ Noon', icon: '☀️' },
              { id: 'sunset' as const, label: '🌇 Dusk', icon: '🌇' },
              { id: 'night' as const, label: '🌙 Night', icon: '🌙' }
            ].map((t, idx) => (
              <g
                key={t.id}
                transform={`translate(${idx * 58}, 0)`}
                className="cursor-pointer"
                onClick={() => setTimeOfDay(t.id)}
              >
                <rect
                  x="0"
                  y="0"
                  width="54"
                  height="28"
                  rx="7"
                  fill={timeOfDay === t.id ? '#ca8a04' : '#1e293b'}
                  stroke={timeOfDay === t.id ? '#fde047' : '#475569'}
                  strokeWidth="1"
                />
                <text x="27" y="18" fill={timeOfDay === t.id ? '#0f172a' : '#cbd5e1'} fontSize="9.5" fontWeight="black" textAnchor="middle">
                  {t.label}
                </text>
              </g>
            ))}
          </g>

          {/* 3. Live Efficiency & Production Stats */}
          <g transform="translate(625, 8)">
            {/* Efficiency gauge */}
            <rect x="0" y="0" width="135" height="28" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="8" y="18" fill="#94a3b8" fontSize="9.5" fontWeight="bold">Rate:</text>
            <rect x="40" y="8" width="50" height="12" rx="4" fill="#0f172a" />
            <rect
              x="40"
              y="8"
              width={(efficiency / 100) * 50}
              height="12"
              rx="4"
              fill={efficiency > 60 ? '#22c55e' : efficiency > 25 ? '#f59e0b' : '#ef4444'}
            />
            <text x="96" y="18" fill={efficiency > 60 ? '#4ade80' : '#fcd34d'} fontSize="10.5" fontWeight="black">
              {efficiency}%
            </text>

            {/* Glucose Rate */}
            <g transform="translate(142, 0)">
              <rect x="0" y="0" width="80" height="28" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <text x="40" y="18" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                🍬 {glucoseRate} <tspan fontSize="8" fill="#94a3b8">mg</tspan>
              </text>
            </g>

            {/* Oxygen Rate */}
            <g transform="translate(228, 0)">
              <rect x="0" y="0" width="70" height="28" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <text x="35" y="18" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                🫧 {oxygenRate} <tspan fontSize="8" fill="#94a3b8">mL</tspan>
              </text>
            </g>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* INTERACTIVE ACTION PALETTE (ON-CANVAS INTERACTIVE SHORTCUTS)              */}
        {/* ========================================================================= */}
        <g transform="translate(15, 60)">
          {/* 1. Make it rain */}
          <g
            transform="translate(0, 0)"
            className="cursor-pointer"
            onClick={handleTriggerRain}
          >
            <rect
              x="0"
              y="0"
              width="105"
              height="26"
              rx="7"
              fill={isRainingNow ? "#0284c7" : "#0f172a"}
              fillOpacity="0.9"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            <text x="52" y="17" fill="#e0f2fe" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              🌧️ Water Roots 💧
            </text>
          </g>

          {/* 2. Toggle Stomata */}
          <g
            transform="translate(112, 0)"
            className="cursor-pointer"
            onClick={handleToggleStomaPore}
          >
            <rect
              x="0"
              y="0"
              width="120"
              height="26"
              rx="7"
              fill={stomataOpen ? "#065f46" : "#7f1d1d"}
              fillOpacity="0.9"
              stroke={stomataOpen ? "#34d399" : "#f87171"}
              strokeWidth="1.2"
            />
            <text x="60" y="17" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              👄 Stomata: {stomataOpen ? "OPEN ✓" : "CLOSED ⛔"}
            </text>
          </g>

          {/* 3. N-P-K Minerals */}
          <g
            transform="translate(239, 0)"
            className="cursor-pointer"
            onClick={handleTriggerNutrients}
          >
            <rect
              x="0"
              y="0"
              width="120"
              height="26"
              rx="7"
              fill={nutrientBoost ? "#ca8a04" : "#0f172a"}
              fillOpacity="0.9"
              stroke="#facc15"
              strokeWidth="1.2"
            />
            <text x="60" y="17" fill="#fef08a" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              🌱 Add N-P-K Minerals
            </text>
          </g>

          {/* 4. Toggle Leaf Anatomy */}
          <g
            transform="translate(366, 0)"
            className="cursor-pointer"
            onClick={() => setShowLeafAnatomy(!showLeafAnatomy)}
          >
            <rect
              x="0"
              y="0"
              width="135"
              height="26"
              rx="7"
              fill={showLeafAnatomy ? "#4338ca" : "#0f172a"}
              fillOpacity="0.9"
              stroke="#818cf8"
              strokeWidth="1.2"
            />
            <text x="67" y="17" fill="#e0e7ff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              🔬 {showLeafAnatomy ? "View Whole Leaf" : "Cellular Anatomy"}
            </text>
          </g>

          {/* 5. Sound toggle */}
          <g
            transform="translate(508, 0)"
            className="cursor-pointer"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            <rect
              x="0"
              y="0"
              width="85"
              height="26"
              rx="7"
              fill="#0f172a"
              fillOpacity="0.9"
              stroke="#64748b"
              strokeWidth="1"
            />
            <text x="42" y="17" fill="#cbd5e1" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </text>
          </g>

          {/* 6. Quick Hypothesis Scenario Presets */}
          <g transform="translate(600, 0)">
            <g
              className="cursor-pointer"
              onClick={() => handleApplyScenario('optimal')}
            >
              <rect
                x="0"
                y="0"
                width="76"
                height="26"
                rx="7"
                fill={activeExperimentName === 'optimal' ? "#16a34a" : "#0f172a"}
                fillOpacity="0.9"
                stroke={activeExperimentName === 'optimal' ? "#4ade80" : "#334155"}
                strokeWidth="1.2"
              />
              <text x="38" y="17" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                ☀️ Optimal
              </text>
            </g>

            <g
              transform="translate(82, 0)"
              className="cursor-pointer"
              onClick={() => handleApplyScenario('drought')}
            >
              <rect
                x="0"
                y="0"
                width="76"
                height="26"
                rx="7"
                fill={activeExperimentName === 'drought' ? "#c2410c" : "#0f172a"}
                fillOpacity="0.9"
                stroke={activeExperimentName === 'drought' ? "#fb923c" : "#334155"}
                strokeWidth="1.2"
              />
              <text x="38" y="17" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                🌵 Drought
              </text>
            </g>

            <g
              transform="translate(164, 0)"
              className="cursor-pointer"
              onClick={() => handleApplyScenario('night')}
            >
              <rect
                x="0"
                y="0"
                width="76"
                height="26"
                rx="7"
                fill={activeExperimentName === 'night' ? "#4338ca" : "#0f172a"}
                fillOpacity="0.9"
                stroke={activeExperimentName === 'night' ? "#818cf8" : "#334155"}
                strokeWidth="1.2"
              />
              <text x="38" y="17" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                🌙 Night
              </text>
            </g>

            <g
              transform="translate(246, 0)"
              className="cursor-pointer"
              onClick={() => handleApplyScenario('greenhouse')}
            >
              <rect
                x="0"
                y="0"
                width="84"
                height="26"
                rx="7"
                fill={activeExperimentName === 'greenhouse' ? "#059669" : "#0f172a"}
                fillOpacity="0.9"
                stroke={activeExperimentName === 'greenhouse' ? "#34d399" : "#334155"}
                strokeWidth="1.2"
              />
              <text x="42" y="17" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                🧪 CO₂ Boost
              </text>
            </g>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* CELESTIAL BODY: REALISTIC SUN / MOON WITH VOLUMETRIC GOD RAYS             */}
        {/* ========================================================================= */}
        {/* 1. Volumetric God rays (sunlight shafts) angling toward foliage */}
        {!isNight && (
          <g>
            <polygon
              points={`${celestialX},${celestialY} ${celestialX - 80},500 ${celestialX + 160},500`}
              fill="url(#godRayGrad)"
              opacity={solarFluxFactor * 0.75}
            />
            <polygon
              points={`${celestialX},${celestialY} 380,260 520,380`}
              fill="url(#godRayGrad)"
              opacity={solarFluxFactor * 0.4}
            />
          </g>
        )}

        {/* 2. Twinkling Night Stars in Night Mode */}
        {isNight && (
          <g>
            {[
              { x: 40, y: 35 }, { x: 180, y: 40 }, { x: 260, y: 70 }, { x: 380, y: 30 },
              { x: 510, y: 60 }, { x: 620, y: 25 }, { x: 740, y: 45 }, { x: 880, y: 35 },
              { x: 140, y: 150 }, { x: 320, y: 110 }, { x: 460, y: 140 }, { x: 820, y: 120 }
            ].map((star, idx) => (
              <circle
                key={idx}
                cx={star.x}
                cy={star.y}
                r={1.2 + (idx % 3 === 0 ? Math.sin(particleTick * 0.1 + idx) * 0.8 : 0)}
                fill="#f8fafc"
                opacity={0.65 + Math.sin(particleTick * 0.08 + idx) * 0.3}
              />
            ))}
          </g>
        )}

        {/* 3. Celestial Body (Interactive Sun or Moon) */}
        <g
          transform={`translate(${celestialX}, ${celestialY})`}
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => {
            if (isNight) {
              setActiveTooltip("🌙 Moon & Nighttime: Solar photon flux is 0. Light-dependent reactions cannot proceed, so the plant conserves water and waits for dawn.");
            } else {
              setActiveTooltip("☀️ The Sun: Powers all planetary photosynthesis! Photons travel 93 million miles in 8 minutes to excite chlorophyll in plant leaves.");
            }
          }}
        >
          {isNight ? (
            /* Crescent Moon */
            <g>
              <circle cx="0" cy="0" r="24" fill="url(#moonGrad)" filter="url(#realGlow)" />
              <circle cx="10" cy="-6" r="22" fill="#020617" />
              <text x="0" y="36" fill="#cbd5e1" fontSize="8.5" fontWeight="black" textAnchor="middle">
                NIGHT 🌙
              </text>
            </g>
          ) : (
            /* Photorealistic Sun with Pulsing Corona & Rotating Rays */
            <g>
              <circle
                cx="0"
                cy="0"
                r={36 + Math.sin(particleTick * 0.08) * 4}
                fill="#fef08a"
                opacity={0.35 * solarFluxFactor}
                filter="url(#realGlow)"
              />
              <circle cx="0" cy="0" r="26" fill="url(#sunRealisticGrad)" filter="url(#realGlow)" />
              <g transform={`rotate(${particleTick * 0.4 * (speed || 1)}, 0, 0)`}>
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="0"
                    y1="30"
                    x2="0"
                    y2="38"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform={`rotate(${deg}, 0, 0)`}
                  />
                ))}
              </g>
              <text x="0" y="4" fill="#78350f" fontSize="9.5" fontWeight="black" textAnchor="middle">
                SUN ☀️
              </text>
            </g>
          )}
        </g>

        {/* 4. Streaming Solar Photons from Sun to Leaf */}
        {!isNight && (
          <g>
            {Array.from({ length: 8 }).map((_, idx) => {
              const targetX = view === 'whole_plant' ? 420 : 210;
              const targetY = view === 'whole_plant' ? 190 : 180;
              const progress = (particleTick * photonSpeed + idx * 24) % 150;
              const ratio = progress / 150;
              const px = celestialX + (targetX - celestialX) * ratio;
              const py = celestialY + (targetY - celestialY) * ratio;
              const opacity = Math.sin(ratio * Math.PI) * solarFluxFactor;

              return (
                <g key={idx} transform={`translate(${px}, ${py})`}>
                  <circle r="3.5" fill="#facc15" opacity={opacity} filter="url(#realGlow)" />
                  <path d="M -5 -2 Q -2 -6 2 -2 T 8 -2" stroke="#fef08a" strokeWidth="1.2" fill="none" opacity={opacity} />
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Rain Shower Overlay when isRainingNow is true */}
        {isRainingNow && (
          <g>
            {/* Fluffy raincloud */}
            <g transform="translate(180, 130)">
              <ellipse cx="0" cy="0" rx="60" ry="24" fill="#334155" opacity="0.9" />
              <ellipse cx="-30" cy="-10" rx="35" ry="20" fill="#475569" opacity="0.95" />
              <ellipse cx="25" cy="-8" rx="40" ry="22" fill="#475569" opacity="0.95" />
            </g>

            {/* Falling rain streaks */}
            {Array.from({ length: 26 }).map((_, idx) => {
              const rx = 100 + (idx * 24) % 320;
              const dropProgress = (particleTick * 8 + idx * 25) % 220;
              const ry = 150 + dropProgress;

              return (
                <line
                  key={idx}
                  x1={rx}
                  y1={ry}
                  x2={rx - 4}
                  y2={ry + 14}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={0.8}
                />
              );
            })}
          </g>
        )}

        {/* ========================================================================= */}
        {/* WHOLE PLANT BOTANICAL SCENE (LEFT PANEL OR FULL-WIDTH MACRO VIEW)          */}
        {/* ========================================================================= */}
        {(view === 'whole_plant' || view === 'split') && (
          <g transform="translate(0, 50)">
            {/* Split viewport boundary box */}
            {view === 'split' && (
              <rect
                x="15"
                y="45"
                width="440"
                height="355"
                rx="16"
                fill={isNight ? "#090d16" : "#f0fdf4"}
                stroke={isStage1 || isStage2 ? "#22c55e" : "#86efac"}
                strokeWidth="2"
              />
            )}

            {/* 1. SOIL STRATIFICATION & ROOTS (Bottom) */}
            <g transform={view === 'whole_plant' ? "translate(0, 310)" : "translate(0, 280)"}>
              {/* Humus & subsoil block */}
              <rect x="0" y="0" width={view === 'whole_plant' ? 960 : 460} height="130" fill="url(#soilStratifiedGrad)" />
              {/* Surface Grass Line */}
              <line x1="0" y1="0" x2={view === 'whole_plant' ? 960 : 460} y2="0" stroke="#22c55e" strokeWidth="6" />

              {/* Branching Plant Root System */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  setWaterPulseCount((prev) => prev + 1);
                  if (soundEnabled) playWaterDropSound();
                  setActiveTooltip("💧 Root Hairs & Osmosis: Microscopic tubular outgrowths of root epidermal cells absorb soil moisture along water potential gradients!");
                }}
              >
                {/* Main Taproot */}
                <path
                  d={view === 'whole_plant' ? "M 480 0 Q 485 55 480 110" : "M 220 0 Q 225 50 220 100"}
                  stroke="#fef3c7"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Lateral feeder roots */}
                {view === 'whole_plant' ? (
                  <>
                    <path d="M 480 20 Q 420 50 340 75" stroke="#fef3c7" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                    <path d="M 480 45 Q 545 70 630 90" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 480 70 Q 430 95 385 115" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 480 85 Q 525 105 570 120" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </>
                ) : (
                  <>
                    <path d="M 220 18 Q 165 40 110 65" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 220 40 Q 275 60 330 80" stroke="#fef3c7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                    <path d="M 220 65 Q 175 85 135 105" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M 220 80 Q 260 95 300 110" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </>
                )}

                {/* Root label pill */}
                <g transform={view === 'whole_plant' ? "translate(300, 20)" : "translate(35, 18)"}>
                  <rect x="0" y="0" width="135" height="22" rx="7" fill="#0f172a" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="1" />
                  <text x="67" y="15" fill="#7dd3fc" fontSize="9" fontWeight="black" textAnchor="middle">
                    💧 WATER INTAKE (H₂O)
                  </text>
                </g>
              </g>

              {/* Water Molecules (H2O) entering root hairs */}
              {Array.from({ length: 9 }).map((_, i) => {
                const baseX = view === 'whole_plant' ? 360 + (i % 6) * 48 : 125 + (i % 5) * 44;
                const progress = (particleTick * waterSpeed + i * 18 + waterPulseCount * 30) % 85;
                const dy = 100 - progress;
                const opacity = Math.sin((progress / 85) * Math.PI) * (effectiveWaterFlow / 100);

                return (
                  <g
                    key={i}
                    transform={`translate(${baseX}, ${dy})`}
                    className="cursor-pointer"
                    onClick={() =>
                      setInspectedMolecule({
                        name: "Water Molecule",
                        formula: "H₂O",
                        atoms: "1 Oxygen atom (blue) + 2 Hydrogen atoms (white) at 104.5° bent bond angle",
                        role: "Absorbed from soil by roots. Split inside the thylakoid (photolysis) to provide Hydrogen (H⁺) and electrons for sugar synthesis, liberating O₂ as a byproduct.",
                        desc: "Molar mass: 18.015 g/mol. Polar covalent molecule essential for all cellular hydration."
                      })
                    }
                  >
                    <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" opacity={opacity} />
                    <text x="6" y="3" fill="#bae6fd" fontSize="7" fontWeight="black" opacity={opacity}>H₂O</text>
                  </g>
                );
              })}

              {/* Golden Mineral Ions when nutrientBoost is active */}
              {nutrientBoost && (
                <g>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const nx = view === 'whole_plant' ? 420 + i * 20 : 180 + i * 15;
                    const ny = 70 - ((particleTick * 2 + i * 15) % 60);
                    return (
                      <g key={i} transform={`translate(${nx}, ${ny})`}>
                        <circle r="3" fill="#facc15" filter="url(#realGlow)" />
                        <text x="4" y="3" fill="#fef08a" fontSize="6.5" fontWeight="black">K⁺</text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>

            {/* 2. PLANT STEM WITH DUAL HIGHWAY PIPELINES */}
            <g transform={view === 'whole_plant' ? "translate(480, 0)" : "translate(220, 0)"}>
              {/* Woody/Green Stem body */}
              <path
                d="M 0 310 Q -4 215 0 115"
                stroke="url(#stemRealisticGrad)"
                strokeWidth={view === 'whole_plant' ? "26" : "20"}
                strokeLinecap="round"
                fill="none"
              />

              {/* Xylem Pipeline (Blue: Water traveling UP) */}
              <path
                d="M -5 310 Q -9 215 -5 115"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                strokeDashoffset={-particleTick * waterSpeed * 2}
                fill="none"
              />

              {/* Phloem Pipeline (Gold: Glucose sugar traveling DOWN) */}
              <path
                d="M 5 115 Q 1 215 5 310"
                stroke="#facc15"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeDashoffset={particleTick * 1.8}
                fill="none"
              />

              {/* Top Bud / Flower */}
              <g transform="translate(0, 105)">
                <circle cx="0" cy="0" r="10" fill="#f59e0b" stroke="#fde047" strokeWidth="1.5" />
                {[-30, 0, 30].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-14"
                    rx="6"
                    ry="11"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    transform={`rotate(${deg}, 0, 0)`}
                  />
                ))}
              </g>
            </g>

            {/* 3. PRIMARY LEAF (THE SOLAR FACTORY OR CELLULAR ANATOMY) */}
            <g transform={view === 'whole_plant' ? "translate(480, 175)" : "translate(220, 165)"}>
              {!showLeafAnatomy ? (
                /* Standard Botanical Leaf Blade */
                <g
                  className="cursor-pointer transition-transform hover:scale-102"
                  onClick={() =>
                    setActiveTooltip("🌿 Leaf Blade: The solar panel of the plant. Covered by a waxy protective cuticle with interior mesophyll cells containing millions of light-absorbing chloroplasts.")
                  }
                >
                  <path
                    d={
                      view === 'whole_plant'
                        ? "M 0 0 C 80 -60 220 -60 280 -10 C 260 65 100 65 0 0 Z"
                        : "M 0 0 C 50 -45 140 -45 180 -8 C 170 50 60 50 0 0 Z"
                    }
                    fill="url(#leafRealisticGrad)"
                    stroke="#15803d"
                    strokeWidth="3"
                    filter={isStage1 || isStage2 ? "url(#realGlow)" : undefined}
                  />
                  {/* Vein network */}
                  <path
                    d={view === 'whole_plant' ? "M 0 0 Q 140 -10 280 -10" : "M 0 0 Q 90 -8 180 -8"}
                    stroke="#86efac"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <path d="M 45 -2 Q 80 -22 115 -30" stroke="#86efac" strokeWidth="1.8" fill="none" />
                  <path d="M 65 -4 Q 100 20 135 28" stroke="#86efac" strokeWidth="1.8" fill="none" />
                  <path d="M 115 -6 Q 145 -18 165 -22" stroke="#86efac" strokeWidth="1.5" fill="none" />

                  {/* Leaf Label */}
                  <rect x="25" y="-48" width="105" height="22" rx="7" fill="#0f172a" fillOpacity="0.85" stroke="#4ade80" strokeWidth="1" />
                  <text x="77" y="-34" fill="#86efac" fontSize="9.5" fontWeight="black" textAnchor="middle">
                    PLANT LEAF 🌿
                  </text>
                </g>
              ) : (
                /* Histological Cellular Anatomy Cross-Section */
                <g
                  className="cursor-pointer"
                  onClick={() =>
                    setActiveTooltip("🔬 Leaf Cellular Cross-Section: Cuticle ➔ Upper Epidermis ➔ Columnar Palisade Mesophyll (chloroplast dense) ➔ Spongy Mesophyll (air channels) ➔ Lower Epidermis Stomata!")
                  }
                >
                  <rect x="0" y="-45" width="200" height="90" rx="8" fill="#022c22" stroke="#4ade80" strokeWidth="2" />
                  {/* Waxy Cuticle */}
                  <rect x="2" y="-43" width="196" height="6" fill="#fef08a" opacity="0.6" />
                  <text x="100" y="-38" fill="#fef08a" fontSize="6.5" fontWeight="bold" textAnchor="middle">Waxy Cuticle Barrier</text>
                  {/* Upper Epidermis */}
                  <rect x="2" y="-36" width="196" height="12" fill="#14532d" />
                  <text x="100" y="-27" fill="#86efac" fontSize="7" fontWeight="bold" textAnchor="middle">Upper Epidermis Cells</text>
                  {/* Palisade Mesophyll (Chloroplast granules) */}
                  <rect x="2" y="-22" width="196" height="34" fill="#15803d" />
                  {Array.from({ length: 14 }).map((_, idx) => (
                    <ellipse key={idx} cx={15 + idx * 13} cy="-5" rx="4" ry="12" fill="#22c55e" stroke="#166534" strokeWidth="1" />
                  ))}
                  <text x="100" y="-3" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">Palisade Mesophyll (Chloroplasts)</text>
                  {/* Spongy Mesophyll with Air Channels */}
                  <rect x="2" y="14" width="196" height="20" fill="#14532d" />
                  <text x="100" y="27" fill="#6ee7b7" fontSize="7" fontWeight="bold" textAnchor="middle">Spongy Air Spaces (CO₂ & O₂)</text>
                  {/* Lower Stoma */}
                  <rect x="90" y="34" width="20" height="8" rx="3" fill="#022c22" stroke="#22c55e" strokeWidth="1" />
                  <text x="100" y="41" fill="#4ade80" fontSize="6" fontWeight="bold" textAnchor="middle">Stoma</text>
                </g>
              )}
            </g>

            {/* 4. LEAF UNDERSIDE STOMATA PORE & GAS EXCHANGE */}
            <g
              transform={view === 'whole_plant' ? "translate(600, 225)" : "translate(315, 210)"}
              className="cursor-pointer"
              onClick={handleToggleStomaPore}
            >
              <circle cx="0" cy="0" r="26" fill="#0f172a" fillOpacity="0.9" stroke={stomataOpen && !isNight ? "#22c55e" : "#ef4444"} strokeWidth="2" />

              {/* Left Guard Cell with radial microfibril hints */}
              <path
                d={stomataOpen && !isNight ? "M -10 -16 Q -18 0 -10 16 Q -5 0 -10 -16 Z" : "M -4 -16 Q -7 0 -4 16 Q -1 0 -4 -16 Z"}
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth="1.5"
              />
              {/* Right Guard Cell */}
              <path
                d={stomataOpen && !isNight ? "M 10 -16 Q 18 0 10 16 Q 5 0 10 -16 Z" : "M 4 -16 Q 7 0 4 16 Q 1 0 4 -16 Z"}
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth="1.5"
              />
              {/* Central Stomatal Aperture */}
              {stomataOpen && !isNight ? (
                <ellipse cx="0" cy="0" rx="4" ry="11" fill="#022c22" />
              ) : (
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#ef4444" strokeWidth="2" />
              )}

              {/* Stoma Label */}
              <g transform="translate(-45, 30)">
                <rect
                  x="0"
                  y="0"
                  width="90"
                  height="18"
                  rx="6"
                  fill={stomataOpen && !isNight ? "#064e3b" : "#7f1d1d"}
                  stroke={stomataOpen && !isNight ? "#34d399" : "#f87171"}
                  strokeWidth="1"
                />
                <text x="45" y="12.5" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
                  👄 STOMA: {stomataOpen && !isNight ? "OPEN ✓" : "CLOSED ⛔"}
                </text>
              </g>
            </g>

            {/* 5. GAS MOLECULES IN TRANSIT */}
            {/* INCOMING CO2 */}
            {stomataOpen && !isNight && (
              <g>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const startX = view === 'whole_plant' ? 760 : 420;
                  const endX = view === 'whole_plant' ? 610 : 325;
                  const targetY = view === 'whole_plant' ? 225 : 210;

                  const progress = (particleTick * 1.7 + idx * 35) % 120;
                  const ratio = progress / 120;
                  const cx = startX - (startX - endX) * ratio;
                  const cy = targetY + 20 - ratio * 15 + Math.sin(particleTick * 0.08 + idx) * 8;
                  const opacity = Math.min(1, ratio * 2);

                  return (
                    <g
                      key={idx}
                      transform={`translate(${cx}, ${cy})`}
                      opacity={opacity}
                      className="cursor-pointer"
                      onClick={() =>
                        setInspectedMolecule({
                          name: "Carbon Dioxide Molecule",
                          formula: "CO₂",
                          atoms: "1 Carbon atom (purple) double-bonded to 2 Oxygen atoms (red) in linear 180° geometry (O=C=O)",
                          role: "Inhaled from ambient air through stomatal pores. Enters the chloroplast stroma where Rubisco enzyme fixes the carbon into organic 3-PGA to build glucose.",
                          desc: "Molar mass: 44.01 g/mol. Essential source of carbon atoms for organic plant mass."
                        })
                      }
                    >
                      <circle cx="0" cy="0" r="5" fill="#581c87" stroke="#c084fc" strokeWidth="1" />
                      <circle cx="-5" cy="0" r="3.5" fill="#ef4444" opacity="0.8" />
                      <circle cx="5" cy="0" r="3.5" fill="#ef4444" opacity="0.8" />
                      <text x="0" y="2.5" fill="#ffffff" fontSize="6.5" fontWeight="black" textAnchor="middle">
                        CO₂
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* OUTGOING O2 BUBBLES */}
            {stomataOpen && !isNight && efficiency > 0 && (
              <g>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const originX = view === 'whole_plant' ? 590 : 310;
                  const originY = view === 'whole_plant' ? 210 : 195;
                  const rise = (particleTick * 2.4 + idx * 30) % 120;
                  const ratio = rise / 120;
                  const ox = originX + (idx % 2 === 0 ? -1 : 1) * (ratio * 35);
                  const oy = originY - rise;
                  const opacity = Math.max(0, 1 - ratio);

                  return (
                    <g
                      key={idx}
                      transform={`translate(${ox}, ${oy})`}
                      opacity={opacity}
                      className="cursor-pointer"
                      onClick={() =>
                        setInspectedMolecule({
                          name: "Diatomic Oxygen Gas Bubble",
                          formula: "O₂",
                          atoms: "2 Oxygen atoms sharing a covalent double bond (O=O)",
                          role: "Produced during photolysis when water is cracked open. Exhaled through stomata into the atmosphere for aerobic respiration in humans and animals.",
                          desc: "Molar mass: 31.998 g/mol. Life-sustaining gas comprising ~21% of Earth's atmosphere."
                        })
                      }
                    >
                      <circle r="7.5" fill="#38bdf8" fillOpacity="0.8" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="0" y="3" fill="#ffffff" fontSize="7.5" fontWeight="black" textAnchor="middle">
                        O₂ 🫧
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* OUTGOING GLUCOSE SUGAR GEMS */}
            {efficiency > 0 && (
              <g>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const leafBaseX = view === 'whole_plant' ? 485 : 225;
                  const moveDown = (particleTick * 1.6 + idx * 35 + calvinCrankSpin * 20) % 130;
                  const gy = 175 + moveDown;

                  return (
                    <g
                      key={idx}
                      transform={`translate(${leafBaseX}, ${gy})`}
                      className="cursor-pointer"
                      onClick={() =>
                        setInspectedMolecule({
                          name: "Glucose Sugar Molecule",
                          formula: "C₆H₁₂O₆",
                          atoms: "6 Carbon atoms + 12 Hydrogen atoms + 6 Oxygen atoms in a hexagonal pyranose ring",
                          role: "Synthesized in the Calvin cycle. Translocated through phloem sieve tubes to nourish roots, stems, flowers, and sweet fruits, or polymerized into starch & cellulose.",
                          desc: "Molar mass: 180.16 g/mol. Universal cellular energy currency and building block of plant biomass."
                        })
                      }
                    >
                      <polygon
                        points="-6,-3.5 0,-7 6,-3.5 6,3.5 0,7 -6,3.5"
                        fill="#facc15"
                        stroke="#78350f"
                        strokeWidth="1.2"
                        filter="url(#realGlow)"
                      />
                      <text x="9" y="3" fill="#854d0e" fontSize="7" fontWeight="black">Sugar 🍬</text>
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        )}

        {/* ========================================================================= */}
        {/* CHLOROPLAST LABORATORY VIEW (RIGHT PANEL OR FULL-WIDTH 50,000x ZOOM)      */}
        {/* ========================================================================= */}
        {(view === 'chloroplast_lab' || view === 'split') && (
          <g transform={view === 'chloroplast_lab' ? "translate(25, 95)" : "translate(465, 95)"}>
            {/* Chloroplast Double-Membrane Envelope Container */}
            <rect
              x="0"
              y="0"
              width={view === 'chloroplast_lab' ? 910 : 480}
              height="350"
              rx="18"
              fill="url(#chloroDoubleMemGrad)"
              stroke={isStage3 || isStage4 ? "#4ade80" : "#10b981"}
              strokeWidth="2.5"
              filter="url(#realGlow)"
            />

            {/* Top Chloroplast Title Bar */}
            <rect
              x="0"
              y="0"
              width={view === 'chloroplast_lab' ? 910 : 480}
              height="32"
              rx="18"
              fill="#0f172a"
              fillOpacity="0.94"
            />
            <circle cx="20" cy="16" r="4.5" fill="#22c55e" className="animate-pulse" />
            <text x="32" y="20" fill="#86efac" fontSize="10.5" fontWeight="black" letterSpacing="0.5">
              🔬 CHLOROPLAST LAB: THYLAKOID WATER SPLITTING & CALVIN CYCLE
            </text>

            {/* Interactive Photon Laser Pulse Button */}
            <g
              transform={view === 'chloroplast_lab' ? "translate(600, 4)" : "translate(290, 4)"}
              className="cursor-pointer"
              onClick={handleTriggerLaser}
            >
              <rect x="0" y="0" width="105" height="24" rx="6" fill="#78350f" stroke="#facc15" strokeWidth="1" />
              <text x="52" y="16" fill="#fef08a" fontSize="8.5" fontWeight="black" textAnchor="middle">
                ⚡ Fire Light Pulse
              </text>
            </g>

            {/* Interactive Crank Calvin Wheel Button */}
            <g
              transform={view === 'chloroplast_lab' ? "translate(715, 4)" : "translate(400, 4)"}
              className="cursor-pointer"
              onClick={handleCrankCalvinWheel}
            >
              <rect x="0" y="0" width="70" height="24" rx="6" fill="#065f46" stroke="#34d399" strokeWidth="1" />
              <text x="35" y="16" fill="#a7f3d0" fontSize="8.5" fontWeight="black" textAnchor="middle">
                🔄 Crank 🍬
              </text>
            </g>

            {/* --------------------------------------------------------------------- */}
            {/* PART A: THYLAKOID MEMBRANE & LIGHT REACTIONS (WATER SPLITTING)        */}
            {/* --------------------------------------------------------------------- */}
            <g
              transform="translate(15, 42)"
              className="cursor-pointer"
              onClick={() => {
                handleTriggerLaser();
                setActiveTooltip("🥞 Thylakoid Grana Discs: Packed with Chlorophyll and Photosystems II & I! Solar photons crack incoming H₂O molecules into O₂ gas (exhaled) and high-energy ATP + NADPH batteries!");
              }}
            >
              <rect
                x="0"
                y="0"
                width={view === 'chloroplast_lab' ? 425 : 215}
                height="295"
                rx="14"
                fill="#022c22"
                fillOpacity="0.88"
                stroke={isStage1 || isStage3 ? "#4ade80" : "#059669"}
                strokeWidth={isStage1 || isStage3 ? "2" : "1"}
              />

              <text x="14" y="20" fill="#a7f3d0" fontSize="11" fontWeight="black">
                1. LIGHT REACTIONS (Thylakoids)
              </text>
              <text x="14" y="34" fill="#6ee7b7" fontSize="9">
                {difficulty === 'advanced'
                  ? 'Photosystems II & I (Photolysis & PMF)'
                  : 'Photolysis: H₂O ➔ 2H⁺ + ½O₂ + ATP'}
              </text>

              {/* Stack of Thylakoids (Granum) */}
              <g transform={view === 'chloroplast_lab' ? "translate(120, 100)" : "translate(90, 95)"}>
                {[-36, -18, 0, 18, 36].map((yOff, i) => (
                  <g key={i} transform={`translate(0, ${yOff})`}>
                    <ellipse
                      cx="0"
                      cy="0"
                      rx={view === 'chloroplast_lab' ? "48" : "36"}
                      ry="8.5"
                      fill="url(#thylakoidStackGrad)"
                      stroke="#15803d"
                      strokeWidth="1.5"
                    />
                    <ellipse
                      cx="0"
                      cy="-2"
                      rx={view === 'chloroplast_lab' ? "42" : "30"}
                      ry="5.5"
                      fill="#86efac"
                      opacity="0.4"
                    />
                  </g>
                ))}

                {/* Chlorophyll label on disc */}
                <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
                  CHLOROPHYLL 🟢
                </text>
              </g>

              {/* Laser Photon Pulse Beam Animation */}
              {laserPulseActive && (
                <g>
                  <line x1="20" y1="20" x2="90" y2="95" stroke="#fef08a" strokeWidth="6" filter="url(#laserBeamGlow)" />
                  <circle cx="90" cy="95" r="14" fill="#ffffff" filter="url(#realGlow)" />
                </g>
              )}

              {/* WATER SPLITTING MOLECULE INTERACTION CARD */}
              <g transform={view === 'chloroplast_lab' ? "translate(15, 180)" : "translate(8, 175)"}>
                <rect
                  x="0"
                  y="0"
                  width={view === 'chloroplast_lab' ? 395 : 200}
                  height="100"
                  rx="10"
                  fill="#0f172a"
                  fillOpacity="0.92"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                />

                <text x="12" y="16" fill="#7dd3fc" fontSize="9.5" fontWeight="black">
                  PHOTOLYSIS (WATER SPLITTING):
                </text>

                {/* H2O Incoming */}
                <g transform="translate(32, 48)">
                  <circle cx="0" cy="0" r="11" fill="#2563eb" stroke="#93c5fd" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">O</text>
                  <circle cx="-8" cy="-7" r="5" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
                  <text x="-8" y="-5" fill="#1e3a8a" fontSize="6" fontWeight="black" textAnchor="middle">H</text>
                  <circle cx="8" cy="-7" r="5" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
                  <text x="8" y="-5" fill="#1e3a8a" fontSize="6" fontWeight="black" textAnchor="middle">H</text>
                  <text x="0" y="24" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">H₂O</text>
                </g>

                {/* Zap Split Arrow */}
                <g transform="translate(68, 48)">
                  <path d="M 0 0 L 20 0" stroke="#facc15" strokeWidth="2.5" strokeDasharray="3 2" />
                  <polygon points="20,-4 26,0 20,4" fill="#facc15" />
                  <text x="10" y="-7" fill="#fde047" fontSize="7" fontWeight="black" textAnchor="middle">SPLIT! ⚡</text>
                </g>

                {/* Results of Split */}
                <g transform={view === 'chloroplast_lab' ? "translate(130, 38)" : "translate(120, 38)"}>
                  {/* O2 gas freed */}
                  <g transform="translate(0, 0)">
                    <circle cx="0" cy="0" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <text x="0" y="3" fill="#ffffff" fontSize="7" fontWeight="black" textAnchor="middle">O₂ 🫧</text>
                    <text x="14" y="3" fill="#bae6fd" fontSize="8" fontWeight="bold">Oxygen Released</text>
                  </g>

                  {/* H+ protons to Calvin Cycle */}
                  <g transform="translate(0, 28)">
                    <circle cx="0" cy="0" r="7.5" fill="#facc15" stroke="#713f12" strokeWidth="1" />
                    <text x="0" y="3" fill="#713f12" fontSize="7.5" fontWeight="black" textAnchor="middle">H⁺</text>
                    <text x="14" y="3" fill="#fde047" fontSize="8" fontWeight="bold">H⁺ to Sugar Wheel</text>
                  </g>
                </g>
              </g>
            </g>

            {/* CONVEYOR BRIDGE: ATP & H+ TO CALVIN CYCLE */}
            <g
              transform={view === 'chloroplast_lab' ? "translate(440, 185)" : "translate(230, 185)"}
              className="cursor-pointer"
              onClick={() =>
                setInspectedMolecule({
                  name: "Adenosine Triphosphate (ATP)",
                  formula: "ATP",
                  atoms: "Adenine base + Ribose sugar + 3 phosphate groups held by high-energy phosphoanhydride bonds (~P~P~P)",
                  role: "The cellular energy battery! Synthesized by ATP synthase using proton gradients across the thylakoid membrane during light reactions. Transports chemical energy to power glucose synthesis in the stroma.",
                  desc: "Molar energy transfer: ATP ➔ ADP + Pi releases 30.5 kJ/mol of usable biochemical work."
                })
              }
            >
              <path
                d={view === 'chloroplast_lab' ? "M 0 0 L 30 0" : "M 0 0 L 15 0"}
                stroke="#facc15"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="4 3"
                strokeDashoffset={-particleTick * 2.8}
              />
              <polygon
                points={view === 'chloroplast_lab' ? "30,-6 40,0 30,6" : "15,-5 22,0 15,5"}
                fill="#facc15"
              />
              <text
                x={view === 'chloroplast_lab' ? 18 : 10}
                y="-10"
                fill="#fde047"
                fontSize="7.5"
                fontWeight="black"
                textAnchor="middle"
              >
                ATP + H⁺ 🔋
              </text>
            </g>

            {/* --------------------------------------------------------------------- */}
            {/* PART B: CALVIN CYCLE (SUGAR KITCHEN IN STROMA)                        */}
            {/* --------------------------------------------------------------------- */}
            <g
              transform={view === 'chloroplast_lab' ? "translate(470, 42)" : "translate(245, 42)"}
              className="cursor-pointer"
              onClick={handleCrankCalvinWheel}
            >
              <rect
                x="0"
                y="0"
                width={view === 'chloroplast_lab' ? 425 : 220}
                height="295"
                rx="14"
                fill="#022c22"
                fillOpacity="0.88"
                stroke={isStage4 ? "#facc15" : "#059669"}
                strokeWidth={isStage4 ? "2" : "1"}
              />

              <text x="14" y="20" fill="#fde68a" fontSize="11" fontWeight="black">
                2. CALVIN CYCLE (Stroma)
              </text>
              <text x="14" y="34" fill="#fbbf24" fontSize="9">
                {difficulty === 'advanced'
                  ? 'Rubisco Carboxylation ➔ 3-PGA ➔ G3P ➔ Hexose'
                  : 'Carbon Fixation ➔ Sugar Construction (C₆H₁₂O₆)'}
              </text>

              {/* Incoming CO2 Input */}
              <g transform={view === 'chloroplast_lab' ? "translate(210, 52)" : "translate(110, 50)"}>
                <text x="0" y="0" fill="#c084fc" fontSize="8.5" fontWeight="black" textAnchor="middle">
                  ⬇ CO₂ INPUT (From Stoma Air)
                </text>
              </g>

              {/* Rotating Assembly Wheel */}
              <g transform={view === 'chloroplast_lab' ? "translate(210, 115)" : "translate(110, 110)"}>
                <circle
                  cx="0"
                  cy="0"
                  r={view === 'chloroplast_lab' ? "44" : "36"}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                />
                <g transform={`rotate(${particleTick * calvinSpeed + calvinCrankSpin * 45}, 0, 0)`}>
                  <circle cx="0" cy={view === 'chloroplast_lab' ? "-44" : "-36"} r="5" fill="#a855f7" />
                  <circle cx={view === 'chloroplast_lab' ? "44" : "36"} cy="0" r="5" fill="#facc15" />
                  <circle cx="0" cy={view === 'chloroplast_lab' ? "44" : "36"} r="5" fill="#34d399" />
                  <circle cx={view === 'chloroplast_lab' ? "-44" : "-36"} cy="0" r="5" fill="#38bdf8" />
                </g>

                <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="0" y="-2" fill="#fde047" fontSize="7.5" fontWeight="black" textAnchor="middle">
                  RUBISCO
                </text>
                <text x="0" y="8" fill="#cbd5e1" fontSize="6.5" textAnchor="middle">
                  Enzyme
                </text>
              </g>

              {/* SYNTHESIZED PRODUCT: GLUCOSE SUGAR */}
              <g transform={view === 'chloroplast_lab' ? "translate(15, 180)" : "translate(10, 175)"}>
                <rect
                  x="0"
                  y="0"
                  width={view === 'chloroplast_lab' ? 395 : 200}
                  height="100"
                  rx="10"
                  fill="#0f172a"
                  fillOpacity="0.92"
                  stroke="#facc15"
                  strokeWidth="1.5"
                  filter={isStage4 ? "url(#realGlow)" : undefined}
                />

                <text x="12" y="16" fill="#fde047" fontSize="9.5" fontWeight="black">
                  SWEET GLUCOSE SUGAR CREATED! 🍬
                </text>

                {/* Hexagon Glucose Icon */}
                <g transform="translate(38, 48)">
                  <polygon
                    points="-14,-8 0,-16 14,-8 14,8 0,16 -14,8"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    filter="url(#realGlow)"
                  />
                  <text x="0" y="3" fill="#78350f" fontSize="7" fontWeight="black" textAnchor="middle">
                    C₆H₁₂O₆
                  </text>
                  <text x="0" y="24" fill="#fde047" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    Glucose
                  </text>
                </g>

                <g transform={view === 'chloroplast_lab' ? "translate(105, 32)" : "translate(88, 30)"}>
                  <text x="0" y="12" fill="#f8fafc" fontSize="8.5" fontWeight="bold">
                    ➔ High-Energy Food
                  </text>
                  <text x="0" y="25" fill="#cbd5e1" fontSize="7.5">
                    Feeds roots, stems & fruits
                  </text>
                  <text x="0" y="38" fill="#4ade80" fontSize="7.5" fontWeight="black">
                    Powers all plant growth! 🪴
                  </text>
                </g>
              </g>
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM: THE 4-STAGE INTERACTIVE STORYBOARD PROGRESSION TABS (Y: 450-485)   */}
        {/* ========================================================================= */}
        <g transform="translate(15, 452)">
          {/* Step 1 */}
          <g
            transform="translate(0, 0)"
            className="cursor-pointer"
            onClick={() => onSelectStageIndex(0)}
          >
            <rect
              x="0"
              y="0"
              width="225"
              height="36"
              rx="9"
              fill={isStage1 ? "#854d0e" : "#0f172a"}
              fillOpacity={isStage1 ? "0.95" : "0.85"}
              stroke={isStage1 ? "#facc15" : "#334155"}
              strokeWidth={isStage1 ? "2" : "1"}
            />
            <circle cx="18" cy="18" r="8" fill={isStage1 ? "#facc15" : "#334155"} />
            <text x="18" y="21.5" fill={isStage1 ? "#78350f" : "#94a3b8"} fontSize="9" fontWeight="black" textAnchor="middle">1</text>
            <text x="32" y="15" fill={isStage1 ? "#fef08a" : "#cbd5e1"} fontSize="9.5" fontWeight="black">
              Trap Sunlight Photons ☀️
            </text>
            <text x="32" y="27" fill={isStage1 ? "#fde68a" : "#94a3b8"} fontSize="8">
              Chlorophyll absorbs solar energy
            </text>
          </g>

          {/* Step 2 */}
          <g
            transform="translate(235, 0)"
            className="cursor-pointer"
            onClick={() => onSelectStageIndex(1)}
          >
            <rect
              x="0"
              y="0"
              width="225"
              height="36"
              rx="9"
              fill={isStage2 ? "#0369a1" : "#0f172a"}
              fillOpacity={isStage2 ? "0.95" : "0.85"}
              stroke={isStage2 ? "#38bdf8" : "#334155"}
              strokeWidth={isStage2 ? "2" : "1"}
            />
            <circle cx="18" cy="18" r="8" fill={isStage2 ? "#38bdf8" : "#334155"} />
            <text x="18" y="21.5" fill={isStage2 ? "#0c4a6e" : "#94a3b8"} fontSize="9" fontWeight="black" textAnchor="middle">2</text>
            <text x="32" y="15" fill={isStage2 ? "#e0f2fe" : "#cbd5e1"} fontSize="9.5" fontWeight="black">
              Water & CO₂ In 💧💨
            </text>
            <text x="32" y="27" fill={isStage2 ? "#bae6fd" : "#94a3b8"} fontSize="8">
              Roots pull H₂O; stomata take CO₂
            </text>
          </g>

          {/* Step 3 */}
          <g
            transform="translate(470, 0)"
            className="cursor-pointer"
            onClick={() => onSelectStageIndex(2)}
          >
            <rect
              x="0"
              y="0"
              width="225"
              height="36"
              rx="9"
              fill={isStage3 ? "#047857" : "#0f172a"}
              fillOpacity={isStage3 ? "0.95" : "0.85"}
              stroke={isStage3 ? "#34d399" : "#334155"}
              strokeWidth={isStage3 ? "2" : "1"}
            />
            <circle cx="18" cy="18" r="8" fill={isStage3 ? "#34d399" : "#334155"} />
            <text x="18" y="21.5" fill={isStage3 ? "#064e3b" : "#94a3b8"} fontSize="9" fontWeight="black" textAnchor="middle">3</text>
            <text x="32" y="15" fill={isStage3 ? "#a7f3d0" : "#cbd5e1"} fontSize="9.5" fontWeight="black">
              Split Water & Make Sugar ⚡
            </text>
            <text x="32" y="27" fill={isStage3 ? "#6ee7b7" : "#94a3b8"} fontSize="8">
              H₂O splits into O₂ + Calvin cycle
            </text>
          </g>

          {/* Step 4 */}
          <g
            transform="translate(705, 0)"
            className="cursor-pointer"
            onClick={() => onSelectStageIndex(3)}
          >
            <rect
              x="0"
              y="0"
              width="225"
              height="36"
              rx="9"
              fill={isStage4 ? "#b45309" : "#0f172a"}
              fillOpacity={isStage4 ? "0.95" : "0.85"}
              stroke={isStage4 ? "#facc15" : "#334155"}
              strokeWidth={isStage4 ? "2" : "1"}
            />
            <circle cx="18" cy="18" r="8" fill={isStage4 ? "#facc15" : "#334155"} />
            <text x="18" y="21.5" fill={isStage4 ? "#78350f" : "#94a3b8"} fontSize="9" fontWeight="black" textAnchor="middle">4</text>
            <text x="32" y="15" fill={isStage4 ? "#fef08a" : "#cbd5e1"} fontSize="9.5" fontWeight="black">
              Store Food & Release O₂ 🍬🫧
            </text>
            <text x="32" y="27" fill={isStage4 ? "#fde68a" : "#94a3b8"} fontSize="8">
              Glucose feeds plant; O₂ frees to air
            </text>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* BOTTOM MASTER CHEMICAL EQUATION BAR (Color-Coded & Pedagogically Clear)   */}
        {/* ========================================================================= */}
        <g transform="translate(480, 514)">
          <rect
            x="-465"
            y="-18"
            width="930"
            height="36"
            rx="10"
            fill="#0f172a"
            fillOpacity="0.96"
            stroke="#10b981"
            strokeWidth="1.5"
          />
          <text x="0" y="5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
            <tspan fill={isStage2 ? "#d8b4fe" : "#c084fc"} fontWeight="black">
              {difficulty === 'beginner' ? 'Air (CO₂)' : '6 CO₂'}
            </tspan>
            <tspan fill="#94a3b8" fontSize="10"> (Air 💨)</tspan>
            <tspan fill="#64748b"> + </tspan>
            <tspan fill={isStage2 ? "#7dd3fc" : "#38bdf8"} fontWeight="black">
              {difficulty === 'beginner' ? 'Water (H₂O)' : '6 H₂O'}
            </tspan>
            <tspan fill="#94a3b8" fontSize="10"> (Soil Roots 💧)</tspan>
            <tspan fill="#64748b"> + </tspan>
            <tspan fill={isStage1 ? "#fef08a" : "#facc15"} fontWeight="black">Light Energy</tspan>
            <tspan fill="#94a3b8" fontSize="10"> (Sun ☀️)</tspan>
            <tspan fill="#4ade80" fontWeight="black"> ➔ </tspan>
            <tspan fill={isStage4 ? "#fef08a" : "#fde047"} fontWeight="black">
              {difficulty === 'beginner' ? 'Sugar' : 'C₆H₁₂O₆'}
            </tspan>
            <tspan fill="#fef08a" fontSize="10"> (Glucose Sugar Food 🍬)</tspan>
            <tspan fill="#64748b"> + </tspan>
            <tspan fill={isStage4 ? "#86efac" : "#4ade80"} fontWeight="black">
              {difficulty === 'beginner' ? 'Oxygen' : '6 O₂'}
            </tspan>
            <tspan fill="#86efac" fontSize="10"> (Pure Oxygen Gas for Us! 🫧)</tspan>
          </text>
        </g>
      </svg>
    );
  };

  // ==========================================
  // SCENE 4: ALGEBRA BALANCE SCALE (2x + 6 = 14)
  // ==========================================
  const renderMathScaleScene = () => {
    // Current step progression from knob or active stage
    const step = Math.min(4, Math.max(1, mathStep));

    return (
      <svg
        viewBox="0 0 800 460"
        className="w-full h-full select-none rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)' }}
      >
        {/* Scale Base and Central Fulcrum Pillar */}
        <polygon points="400,160 380,360 420,360" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
        <rect x="340" y="360" width="120" height="24" rx="8" fill="#334155" stroke="#64748b" strokeWidth="2" />
        <circle cx="400" cy="160" r="14" fill="#f59e0b" stroke="#fef08a" strokeWidth="3" />

        {/* Horizontal Balance Beam (Balanced horizontal line) */}
        <line x1="160" y1="160" x2="640" y2="160" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />

        {/* Left Pan Chains & Plate */}
        <line x1="200" y1="160" x2="160" y2="280" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="200" y1="160" x2="240" y2="280" stroke="#94a3b8" strokeWidth="2.5" />
        <ellipse cx="200" cy="280" rx="90" ry="16" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />

        {/* Right Pan Chains & Plate */}
        <line x1="600" y1="160" x2="560" y2="280" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="600" y1="160" x2="640" y2="280" stroke="#94a3b8" strokeWidth="2.5" />
        <ellipse cx="600" cy="280" rx="90" ry="16" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />

        {/* ITEMS ON LEFT PAN */}
        {/* Two mystery boxes 'x' */}
        <g transform="translate(170, 240)">
          {/* Mystery Box 1 */}
          <rect x="-35" y="-30" width="32" height="32" rx="6" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="2" />
          <text x="-19" y="-9" fill="#ffffff" fontSize="16" fontWeight="black" textAnchor="middle">
            {step === 4 ? "4" : "x"}
          </text>

          {/* Mystery Box 2 (hidden if step 3 divides into 1 box per side) */}
          <rect
            x="5"
            y="-30"
            width="32"
            height="32"
            rx="6"
            fill="#8b5cf6"
            stroke="#c4b5fd"
            strokeWidth="2"
            opacity={step >= 3 ? 0.3 : 1}
          />
          <text x="21" y="-9" fill="#ffffff" fontSize="16" fontWeight="black" textAnchor="middle" opacity={step >= 3 ? 0.3 : 1}>
            {step === 4 ? "4" : "x"}
          </text>
        </g>

        {/* Six +1 unit blocks on Left Pan (removed in step >= 2) */}
        {step === 1 && (
          <g transform="translate(200, 260)">
            {Array.from({ length: 6 }).map((_, i) => (
              <rect
                key={i}
                x={-35 + (i % 3) * 24}
                y={-14 - Math.floor(i / 3) * 22}
                width="20"
                height="20"
                rx="4"
                fill="#f59e0b"
                stroke="#fef08a"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}

        {/* ITEMS ON RIGHT PAN */}
        {/* Step 1: 14 unit weights */}
        {step === 1 && (
          <g transform="translate(600, 260)">
            {Array.from({ length: 14 }).map((_, i) => (
              <rect
                key={i}
                x={-45 + (i % 5) * 19}
                y={-12 - Math.floor(i / 5) * 18}
                width="16"
                height="16"
                rx="3"
                fill="#f59e0b"
                stroke="#fef08a"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}

        {/* Step 2: 8 unit weights remaining (14 - 6 = 8) */}
        {step === 2 && (
          <g transform="translate(600, 260)">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x={-38 + (i % 4) * 20}
                y={-14 - Math.floor(i / 4) * 20}
                width="18"
                height="18"
                rx="4"
                fill="#f59e0b"
                stroke="#fef08a"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}

        {/* Step 3: Divided into two groups of 4 */}
        {step === 3 && (
          <g transform="translate(600, 260)">
            <rect x="-48" y="-40" width="40" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <text x="-28" y="-16" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">4</text>
            <rect x="8" y="-40" width="40" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <text x="28" y="-16" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">4</text>
          </g>
        )}

        {/* Step 4: Solution x = 4 */}
        {step === 4 && (
          <g transform="translate(600, 240)">
            <rect x="-30" y="-30" width="60" height="45" rx="10" fill="#22c55e" stroke="#86efac" strokeWidth="3" />
            <text x="0" y="-2" fill="#ffffff" fontSize="22" fontWeight="black" textAnchor="middle">4</text>
          </g>
        )}

        {/* EQUATION DISPLAY HUD (Center Top) */}
        <g transform="translate(400, 70)">
          <rect x="-240" y="-35" width="480" height="70" rx="16" fill="#0f172a" fillOpacity="0.95" stroke="#a855f7" strokeWidth="2" />
          <text x="0" y="-8" fill="#c084fc" fontSize="13" fontWeight="bold" textAnchor="middle">
            {step === 1 && "Step 1: Original Balanced Equation"}
            {step === 2 && "Step 2: Subtract 6 from Both Sides (-6)"}
            {step === 3 && "Step 3: Divide Both Sides by 2 (÷2)"}
            {step === 4 && "Step 4: Solved with 100% Certainty! 🎉"}
          </text>
          <text x="0" y="22" fill="#f8fafc" fontSize="22" fontWeight="black" textAnchor="middle">
            {step === 1 && "2x + 6 = 14"}
            {step === 2 && "2x = 8"}
            {step === 3 && "(2x ÷ 2) = (8 ÷ 2)"}
            {step === 4 && "x = 4  ✓  [2(4) + 6 = 14]"}
          </text>
        </g>
      </svg>
    );
  };

  // ==========================================
  // SCENE 5: HEART BLOOD CIRCULATION
  // ==========================================
  const renderHeartCirculationScene = () => {
    const pulseScale = 1 + Math.sin(particleTick * 0.15 * (heartBpm / 75)) * 0.05;

    return (
      <svg
        viewBox="0 0 800 460"
        className="w-full h-full select-none rounded-2xl overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 50%, #450a0a 0%, #0f172a 100%)' }}
      >
        <g transform={`scale(${pulseScale})`} style={{ transformOrigin: "400px 230px" }}>
          {/* Heart Body Outline */}
          <path
            d="M 400 360 C 260 300 240 180 320 140 C 370 115 400 160 400 170 C 400 160 430 115 480 140 C 560 180 540 300 400 360 Z"
            fill="#881337"
            stroke="#e11d48"
            strokeWidth="5"
          />

          {/* Central Septum separating Left and Right */}
          <path d="M 400 170 L 400 360" stroke="#4c0519" strokeWidth="12" strokeLinecap="round" />

          {/* RIGHT ATRIUM (Blue Deoxygenated blood) */}
          <g transform="translate(340, 190)" className="cursor-pointer" onClick={() => setActiveTooltip("Right Atrium (RA): Receives deoxygenated blue blood returning from the veins!")}>
            <circle cx="0" cy="0" r="32" fill="#1e3a8a" opacity="0.8" />
            <text x="0" y="5" fill="#bfdbfe" fontSize="13" fontWeight="black" textAnchor="middle">RA 🔵</text>
          </g>

          {/* RIGHT VENTRICLE */}
          <g transform="translate(345, 270)" className="cursor-pointer" onClick={() => setActiveTooltip("Right Ventricle (RV): Pumps deoxygenated blood to the lungs to pick up fresh oxygen!")}>
            <circle cx="0" cy="0" r="38" fill="#1d4ed8" opacity="0.8" />
            <text x="0" y="5" fill="#dbeafe" fontSize="13" fontWeight="black" textAnchor="middle">RV 🫁</text>
          </g>

          {/* LEFT ATRIUM (Oxygenated Red blood) */}
          <g transform="translate(460, 190)" className="cursor-pointer" onClick={() => setActiveTooltip("Left Atrium (LA): Receives fresh oxygen-rich crimson blood returning from the lungs!")}>
            <circle cx="0" cy="0" r="32" fill="#991b1b" opacity="0.8" />
            <text x="0" y="5" fill="#fecaca" fontSize="13" fontWeight="black" textAnchor="middle">LA 🔴</text>
          </g>

          {/* LEFT VENTRICLE (Powerhouse chamber) */}
          <g transform="translate(455, 270)" className="cursor-pointer" onClick={() => setActiveTooltip("Left Ventricle (LV): The thickest muscle wall that propels blood to the brain and whole body!")}>
            <circle cx="0" cy="0" r="42" fill="#dc2626" opacity="0.85" />
            <text x="0" y="5" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle">LV 🚀</text>
          </g>

          {/* Great Vessels: Aorta & Vena Cava */}
          {/* Aortic Arch (Red Arching Right) */}
          <path d="M 450 170 Q 480 80 540 100 Q 570 120 570 160" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
          {/* Pulmonary Artery (Blue to Lungs) */}
          <path d="M 350 170 Q 320 80 260 100" fill="none" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round" />
        </g>

        {/* Moving Blood Cells */}
        {Array.from({ length: 8 }).map((_, i) => {
          const move = (particleTick * 3 + i * 40) % 200;
          return (
            <circle
              key={i}
              cx={450 + move * 0.6}
              cy={120 + Math.sin(move * 0.05) * 15}
              r="6"
              fill="#ef4444"
              stroke="#fee2e2"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Live Pulse Rate HUD */}
        <g transform="translate(100, 80)">
          <rect x="-80" y="-35" width="160" height="70" rx="14" fill="#0f172a" fillOpacity="0.95" stroke="#e11d48" strokeWidth="2" />
          <text x="0" y="-10" fill="#fda4af" fontSize="12" fontWeight="bold" textAnchor="middle">💓 HEART RATE</text>
          <text x="0" y="20" fill="#ffffff" fontSize="24" fontWeight="black" textAnchor="middle">{heartBpm} <tspan fontSize="13">BPM</tspan></text>
        </g>
      </svg>
    );
  };

  // ==========================================
  // SCENE 6: STATES OF MATTER (Solid / Liquid / Gas)
  // ==========================================
  const renderStatesOfMatterScene = () => {
    const isSolid = tempCelsius <= 0;
    const isLiquid = tempCelsius > 0 && tempCelsius < 100;
    const isGas = tempCelsius >= 100;

    return (
      <svg
        viewBox="0 0 800 460"
        className="w-full h-full select-none rounded-2xl overflow-hidden"
        style={{
          background: isSolid
            ? 'linear-gradient(180deg, #0c4a6e 0%, #075985 100%)'
            : isGas
            ? 'linear-gradient(180deg, #7c2d12 0%, #451a03 100%)'
            : 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)'
        }}
      >
        {/* Transparent Lab Beaker Container */}
        <rect x="220" y="100" width="360" height="260" rx="18" fill="#ffffff" fillOpacity="0.08" stroke="#38bdf8" strokeWidth="4" />
        {/* Beaker Lip */}
        <line x1="200" y1="100" x2="600" y2="100" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

        {/* Burner Flame beneath when Hot */}
        {tempCelsius > 30 && (
          <g transform="translate(400, 395)">
            <path
              d={`M -40 20 Q 0 ${-20 - (tempCelsius / 150) * 35} 40 20 Q 0 0 -40 20 Z`}
              fill="#f59e0b"
              filter="url(#glow)"
            />
            <path
              d={`M -20 20 Q 0 ${-10 - (tempCelsius / 150) * 20} 20 20 Q 0 5 -20 20 Z`}
              fill="#fef08a"
            />
            <text x="0" y="38" fill="#fde68a" fontSize="12" fontWeight="bold" textAnchor="middle">Thermal Heat Source 🔥</text>
          </g>
        )}

        {/* 40+ ATOMS IN CONTAINER */}
        {Array.from({ length: 42 }).map((_, idx) => {
          let x = 400;
          let y = 300;

          if (isSolid) {
            // Hexagonal tight crystal lattice with gentle shivering vibration
            const col = idx % 7;
            const row = Math.floor(idx / 7);
            const vibX = Math.sin(particleTick * 0.4 + idx) * 1.5;
            const vibY = Math.cos(particleTick * 0.4 + idx) * 1.5;
            x = 300 + col * 32 + (row % 2) * 16 + vibX;
            y = 220 + row * 26 + vibY;
          } else if (isLiquid) {
            // Rolling, flowing cohesive pool at bottom of beaker
            const col = idx % 8;
            const row = Math.floor(idx / 8);
            const flowX = Math.sin(particleTick * 0.08 + idx * 0.5) * 12;
            const flowY = Math.cos(particleTick * 0.08 + idx * 0.5) * 6;
            x = 280 + col * 34 + flowX;
            y = 260 + row * 20 + flowY;
          } else {
            // Gas: High kinetic speed, bouncing across entire chamber
            const speedFact = 1.8 * (speed || 1);
            x = 250 + ((idx * 83 + particleTick * speedFact * 7) % 300);
            y = 120 + ((idx * 57 + particleTick * speedFact * 5) % 220);
          }

          return (
            <g key={idx} transform={`translate(${x}, ${y})`}>
              <circle r="9" fill={isSolid ? "#7dd3fc" : isGas ? "#f87171" : "#38bdf8"} stroke="#ffffff" strokeWidth="1.5" />
              <circle r="3" fill="#ffffff" opacity="0.6" />
            </g>
          );
        })}

        {/* State Label HUD */}
        <g transform="translate(400, 55)">
          <rect x="-180" y="-30" width="360" height="60" rx="14" fill="#0f172a" fillOpacity="0.95" stroke="#38bdf8" strokeWidth="2" />
          <text x="0" y="-5" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">CURRENT MOLECULAR PHASE</text>
          <text x="0" y="22" fill="#ffffff" fontSize="22" fontWeight="black" textAnchor="middle">
            {isSolid && `Solid State (Ice) 🧊 [${tempCelsius}°C]`}
            {isLiquid && `Liquid State (Water) 💧 [${tempCelsius}°C]`}
            {isGas && `Gas Vapor (Steam) 💨 [${tempCelsius}°C]`}
          </text>
        </g>
      </svg>
    );
  };

  // ==========================================
  // SCENE 7: GENERIC DYNAMIC DIAGRAM
  // ==========================================
  const renderGenericDiagramScene = () => {
    const stageCount = simulation.stages.length;
    return (
      <svg
        viewBox="0 0 800 460"
        className="w-full h-full select-none rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        <defs>
          <linearGradient id="genericGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Central Connecting Flow Pipeline */}
        <line x1="120" y1="230" x2="680" y2="230" stroke="#334155" strokeWidth="8" strokeDasharray="8 6" />

        {/* Animated flow particle along pipeline */}
        <circle
          cx={120 + ((particleTick * 3 * (speed || 1)) % 560)}
          cy="230"
          r="9"
          fill="#38bdf8"
          stroke="#e0f2fe"
          strokeWidth="3"
        />

        {/* Stage Nodes */}
        {simulation.stages.map((st, idx) => {
          const stepX = 140 + (idx * 520) / (stageCount - 1 || 1);
          const isActive = idx === currentStageIndex;

          return (
            <g
              key={st.id}
              transform={`translate(${stepX}, 230)`}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onSelectStageIndex(idx)}
            >
              {/* Outer pulsing ring if active */}
              {isActive && (
                <circle cx="0" cy="0" r="46" fill="#a855f7" fillOpacity="0.25" stroke="#c084fc" strokeWidth="2" className="animate-ping" />
              )}
              {/* Main node bubble */}
              <circle
                cx="0"
                cy="0"
                r="36"
                fill={isActive ? "url(#genericGrad)" : "#1e293b"}
                stroke={isActive ? "#38bdf8" : "#475569"}
                strokeWidth={isActive ? "4" : "2"}
              />
              <text x="0" y="8" fill="#ffffff" fontSize="20" fontWeight="black" textAnchor="middle">
                {st.stageNumber}
              </text>
              {/* Node label box */}
              <rect x="-70" y={idx % 2 === 0 ? "50" : "-85"} width="140" height="38" rx="8" fill="#0f172a" fillOpacity="0.9" stroke="#475569" strokeWidth="1" />
              <text x="0" y={idx % 2 === 0 ? "73" : "-62"} fill={isActive ? "#38bdf8" : "#cbd5e1"} fontSize="11" fontWeight="bold" textAnchor="middle">
                {st.title.slice(0, 18)}...
              </text>
            </g>
          );
        })}

        {/* Selected Stage Detail Card */}
        <g transform="translate(400, 70)">
          <rect x="-260" y="-35" width="520" height="70" rx="16" fill="#0f172a" fillOpacity="0.95" stroke="#6366f1" strokeWidth="2" />
          <text x="0" y="-8" fill="#818cf8" fontSize="13" fontWeight="bold" textAnchor="middle">
            {currentStage.title}
          </text>
          <text x="0" y="18" fill="#e2e8f0" fontSize="13" textAnchor="middle">
            {currentStage.subtitle}
          </text>
        </g>
      </svg>
    );
  };

  // Dispatch Scene Selection
  const renderActiveVisualScene = () => {
    const sceneProps = {
      simulation,
      currentStageIndex,
      currentStage,
      knobValues,
      onChangeKnob,
      particleTick,
      speed,
      difficulty,
      soundEnabled,
      onInspectMolecule: setInspectedMolecule
    };

    switch (currentStage.visualScene) {
      case 'weather_water_cycle':
        return renderWaterCycleScene();
      case 'electric_circuit':
        return renderElectricCircuitScene();
      case 'photosynthesis':
        return renderPhotosynthesisScene();
      case 'math_scale':
        return renderMathScaleScene();
      case 'heart_circulation':
        return renderHeartCirculationScene();
      case 'states_of_matter':
        return renderStatesOfMatterScene();
      case 'aerodynamics_flight':
        return <AerodynamicsFlightScene {...sceneProps} />;
      case 'gravity_orbits':
        return <GravityOrbitsScene {...sceneProps} />;
      case 'rocket_propulsion':
        return <RocketPropulsionScene {...sceneProps} />;
      case 'solar_eclipse':
        return <SolarEclipseScene {...sceneProps} />;
      case 'sound_waves':
        return <SoundWavesScene {...sceneProps} />;
      case 'light_optics':
        return <LightOpticsScene {...sceneProps} />;
      case 'atom_quantum':
        return <AtomQuantumScene {...sceneProps} />;
      case 'dna_replication':
        return <DnaReplicationScene {...sceneProps} />;
      case 'cell_biology':
        return <CellBiologyScene {...sceneProps} />;
      case 'volcano_eruption':
        return <VolcanoEruptionScene {...sceneProps} />;
      case 'digestive_system':
        return <DigestiveSystemScene {...sceneProps} />;
      case 'custom_dynamic':
      default:
        return <EnhancedCustomDynamicScene {...sceneProps} />;
    }
  };

  return (
    <div className="relative w-full flex flex-col bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* 1. TOP STAGE PROGRESS BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Stage {currentStageIndex + 1} of {simulation.stages.length}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-200 font-bold truncate max-w-[280px]">
            {currentStage.title}
          </span>
        </div>

        {/* Speed Controls & Auto-Play */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Difficulty Switcher inside Stage */}
          {onChangeDifficulty && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5">
              {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onChangeDifficulty(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    difficulty === lvl
                      ? lvl === 'beginner'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                        : lvl === 'intermediate'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-purple-500 text-white font-black shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Switch simulation depth to ${lvl}`}
                >
                  {lvl === 'beginner' ? '🟢 Easy' : lvl === 'intermediate' ? '🟡 Standard' : '🟣 AP/Adv'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onTogglePlay}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Auto-Play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. THE INTERACTIVE VISUAL CANVAS */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {renderActiveVisualScene()}

        {/* Clickable Molecule Inspector Modal */}
        {inspectedMolecule && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-30 animate-fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/70 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 text-slate-100 max-h-[95%] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-sm border border-emerald-500/40 shadow-sm">
                    {inspectedMolecule.formula}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white">{inspectedMolecule.name}</h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      🔬 Interactive Molecular Structure Inspector
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedMolecule(null)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 3D Ball-and-Stick SVG Atomic Diagram */}
              <div className="w-full h-28 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 300 100" className="w-full h-full">
                  <defs>
                    <radialGradient id="molOxygenGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fca5a5" />
                      <stop offset="40%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>
                    <radialGradient id="molHydrogenGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </radialGradient>
                    <radialGradient id="molCarbonGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="40%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#4c1d95" />
                    </radialGradient>
                    <radialGradient id="molPhosphorusGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="40%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </radialGradient>
                  </defs>

                  {inspectedMolecule.formula.includes('H₂O') ? (
                    /* Water H2O: Bent 104.5 degree model */
                    <g transform="translate(150, 50)">
                      <line x1="0" y1="-4" x2="-38" y2="22" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                      <line x1="0" y1="-4" x2="38" y2="22" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                      {/* Oxygen Center */}
                      <circle cx="0" cy="-6" r="20" fill="url(#molOxygenGrad)" />
                      <text x="0" y="-1" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">O</text>
                      {/* Hydrogen Left */}
                      <circle cx="-38" cy="22" r="12" fill="url(#molHydrogenGrad)" />
                      <text x="-38" y="26" fill="#1e293b" fontSize="9" fontWeight="black" textAnchor="middle">H</text>
                      {/* Hydrogen Right */}
                      <circle cx="38" cy="22" r="12" fill="url(#molHydrogenGrad)" />
                      <text x="38" y="26" fill="#1e293b" fontSize="9" fontWeight="black" textAnchor="middle">H</text>
                      <text x="0" y="44" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">Polar Bent Angle: 104.5°</text>
                    </g>
                  ) : inspectedMolecule.formula.includes('CO₂') ? (
                    /* Carbon Dioxide: Linear O=C=O model */
                    <g transform="translate(150, 48)">
                      <line x1="-50" y1="-4" x2="50" y2="-4" stroke="#94a3b8" strokeWidth="3" />
                      <line x1="-50" y1="4" x2="50" y2="4" stroke="#94a3b8" strokeWidth="3" />
                      <circle cx="-55" cy="0" r="18" fill="url(#molOxygenGrad)" />
                      <text x="-55" y="4" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">O</text>
                      <circle cx="0" cy="0" r="19" fill="url(#molCarbonGrad)" />
                      <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">C</text>
                      <circle cx="55" cy="0" r="18" fill="url(#molOxygenGrad)" />
                      <text x="55" y="4" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">O</text>
                      <text x="0" y="38" fill="#c084fc" fontSize="8" fontWeight="bold" textAnchor="middle">Linear 180° Molecular Geometry (O=C=O)</text>
                    </g>
                  ) : inspectedMolecule.formula.includes('O₂') ? (
                    /* Diatomic Oxygen O=O */
                    <g transform="translate(150, 48)">
                      <line x1="-30" y1="-4" x2="30" y2="-4" stroke="#94a3b8" strokeWidth="3.5" />
                      <line x1="-30" y1="4" x2="30" y2="4" stroke="#94a3b8" strokeWidth="3.5" />
                      <circle cx="-32" cy="0" r="19" fill="url(#molOxygenGrad)" />
                      <text x="-32" y="4" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">O</text>
                      <circle cx="32" cy="0" r="19" fill="url(#molOxygenGrad)" />
                      <text x="32" y="4" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">O</text>
                      <text x="0" y="38" fill="#4ade80" fontSize="8" fontWeight="bold" textAnchor="middle">Diatomic Nonpolar Double Covalent Bond (O=O)</text>
                    </g>
                  ) : inspectedMolecule.formula.includes('C₆H₁₂O₆') ? (
                    /* Glucose Sugar Ring */
                    <g transform="translate(150, 46)">
                      <polygon points="-36,-18 0,-34 36,-18 36,18 0,34 -36,18" fill="#fbbf24" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="3" />
                      <circle cx="-36" cy="-18" r="8" fill="url(#molCarbonGrad)" />
                      <circle cx="0" cy="-34" r="9" fill="url(#molOxygenGrad)" />
                      <circle cx="36" cy="-18" r="8" fill="url(#molCarbonGrad)" />
                      <circle cx="36" cy="18" r="8" fill="url(#molCarbonGrad)" />
                      <circle cx="0" cy="34" r="8" fill="url(#molCarbonGrad)" />
                      <circle cx="-36" cy="18" r="8" fill="url(#molCarbonGrad)" />
                      <text x="0" y="4" fill="#fde047" fontSize="10" fontWeight="black" textAnchor="middle">C₆H₁₂O₆</text>
                      <text x="0" y="46" fill="#facc15" fontSize="8" fontWeight="bold" textAnchor="middle">Pyranose Hexose Ring (6-Carbon Sugar)</text>
                    </g>
                  ) : (
                    /* High energy ATP / Chlorophyll */
                    <g transform="translate(150, 48)">
                      <rect x="-80" y="-18" width="55" height="36" rx="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                      <text x="-52" y="4" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">Adenosine</text>
                      <line x1="-25" y1="0" x2="65" y2="0" stroke="#f59e0b" strokeWidth="4" />
                      <circle cx="0" cy="0" r="14" fill="url(#molPhosphorusGrad)" />
                      <text x="0" y="4" fill="#713f12" fontSize="9" fontWeight="black" textAnchor="middle">P₁</text>
                      <circle cx="35" cy="0" r="14" fill="url(#molPhosphorusGrad)" />
                      <text x="35" y="4" fill="#713f12" fontSize="9" fontWeight="black" textAnchor="middle">P₂</text>
                      <circle cx="70" cy="0" r="14" fill="url(#molPhosphorusGrad)" />
                      <text x="70" y="4" fill="#713f12" fontSize="9" fontWeight="black" textAnchor="middle">P₃</text>
                      <text x="0" y="38" fill="#facc15" fontSize="8" fontWeight="bold" textAnchor="middle">High-Energy Phosphoanhydride Bonds (~P~P~P)</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Data Cards */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <span className="text-[10px] font-black uppercase text-amber-400 block mb-0.5">
                    Atomic Composition:
                  </span>
                  <p className="text-slate-200">{inspectedMolecule.atoms}</p>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <span className="text-[10px] font-black uppercase text-sky-400 block mb-0.5">
                    Role in Photosynthesis & Energy:
                  </span>
                  <p className="text-slate-200 leading-relaxed">{inspectedMolecule.role}</p>
                </div>

                {inspectedMolecule.desc && (
                  <p className="text-[11px] text-slate-400 italic px-1">
                    {inspectedMolecule.desc}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Tap any element in the simulation to inspect its chemistry!
                </span>
                <button
                  onClick={() => setInspectedMolecule(null)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clickable Tooltip Banner */}
        {activeTooltip && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-indigo-500/70 text-slate-100 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-fade-in z-20">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{activeTooltip}</p>
            </div>
            <button
              onClick={() => setActiveTooltip(null)}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 3. STAGE NARRATION & ACTION PROMPT */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-900/80 text-indigo-300 border border-indigo-700/60">
              Interactive Guide
            </span>
            <h4 className="text-sm font-black text-white">{currentStage.actionPrompt}</h4>
          </div>
          {currentStage.keyPrinciple && (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
              💡 {currentStage.keyPrinciple}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-slate-300 font-normal">
          {currentStage.narration}
        </p>

        {/* Highlight Hotspots */}
        {currentStage.highlightLabels && currentStage.highlightLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Interactive Hotspots:</span>
            {currentStage.highlightLabels.map((lbl, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-md hover:border-indigo-400 transition-colors"
              >
                {lbl}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. REAL-TIME INTERACTIVE KNOBS & CONTROLS */}
      {simulation.interactiveKnobs && simulation.interactiveKnobs.length > 0 && (
        <div className="p-4 bg-slate-950/90 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-amber-400" />
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Interactive Experiment Sandbox (Tweak & Observe Live Simulation)
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {simulation.interactiveKnobs.map((knob) => {
              const currentVal = knobValues[knob.id] ?? knob.defaultValue;

              if (knob.type === 'slider') {
                return (
                  <div key={knob.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{knob.label}</span>
                      <span className="font-black text-amber-400">
                        {currentVal} {knob.unit || ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={knob.min ?? 0}
                      max={knob.max ?? 100}
                      value={currentVal}
                      onChange={(e) => onChangeKnob(knob.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {knob.impactDescription}
                    </p>
                  </div>
                );
              }

              if (knob.type === 'toggle') {
                return (
                  <div key={knob.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{knob.label}</span>
                      <button
                        onClick={() => onChangeKnob(knob.id, !currentVal)}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentVal
                            ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/25'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {currentVal ? 'ENABLED ✓' : 'OFF'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {knob.impactDescription}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
