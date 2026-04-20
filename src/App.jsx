import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Eye, X, Calendar, TrendingUp, Flame, Plus, Minus, RotateCcw, Trophy, Clock, Dumbbell, Zap, Target, BarChart3, History, Activity, ChevronDown, ChevronUp, Trash2, Award, Layers } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'gym-tracker-state-v2';
const STORAGE_KEY_V1 = 'gym-tracker-state-v1';

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_TO_WORKOUT = { 1: 'A', 3: 'B', 5: 'C' };

const WORKOUTS = {
  A: {
    id: 'A',
    name: 'DÍA A',
    subtitle: 'Empuje + Sentadilla',
    suggestedDay: 'Lunes',
    accent: '#f97316',
    accentSoft: '#fed7aa',
    exercises: [
      {
        id: 'a-squat', name: 'Sentadilla con barra', muscles: 'Cuádriceps · Glúteos · Core',
        sets: 4, reps: '6-8', rest: '2:00', anim: 'squat',
        tips: [
          'Pies al ancho de hombros, puntas ligeramente afuera.',
          'Pecho arriba, espalda neutra, abdomen apretado.',
          'Baja hasta que la cadera quede debajo de la rodilla (profundidad completa).',
          'Empuja desde los talones; las rodillas siguen la línea de los pies.',
        ],
      },
      {
        id: 'a-bench', name: 'Press de banca', muscles: 'Pecho · Tríceps · Hombros',
        sets: 4, reps: '6-8', rest: '2:00', anim: 'bench',
        tips: [
          'Escápulas retraídas y pegadas a la banca.',
          'La barra toca el pecho a la altura del esternón medio.',
          'Codos a ~75° del torso, no abiertos a 90°.',
          'Empuja en línea recta arriba, sin arquear la espalda baja en exceso.',
        ],
      },
      {
        id: 'a-row', name: 'Remo con barra', muscles: 'Espalda · Bíceps · Trapecios',
        sets: 3, reps: '8-10', rest: '1:30', anim: 'row',
        tips: [
          'Cadera bisagrada, espalda neutra, torso ~45°.',
          'Lleva la barra al ombligo, no al pecho.',
          'Aprieta los omóplatos al final del movimiento.',
          'Controla la bajada, sin dejar caer el peso.',
        ],
      },
      {
        id: 'a-ohp-db', name: 'Press militar mancuernas', muscles: 'Hombros · Tríceps',
        sets: 3, reps: '10', rest: '1:30', anim: 'ohp',
        tips: [
          'Sentado o de pie, core apretado.',
          'Inicia con mancuernas a la altura de los hombros.',
          'Empuja arriba sin trabar codos.',
          'No arquees la espalda baja al subir.',
        ],
      },
      {
        id: 'a-plank', name: 'Plancha frontal', muscles: 'Core · Hombros',
        sets: 3, reps: '30-45 s', rest: '0:45', anim: 'plank', isTime: true,
        tips: [
          'Codos directamente debajo de los hombros.',
          'Cuerpo en línea recta de cabeza a talones.',
          'Aprieta abdomen y glúteos durante todo el tiempo.',
          'Respira controlado, no aguantes la respiración.',
        ],
      },
    ],
    finisher: {
      name: 'EMOM 10 minutos',
      work: 'Cada minuto: 10 swings con kettlebell + 5 burpees',
      anims: [{ name: 'Swing KB', type: 'kbswing' }, { name: 'Burpee', type: 'burpee' }],
    },
  },

  B: {
    id: 'B',
    name: 'DÍA B',
    subtitle: 'Jalón + Cadena posterior',
    suggestedDay: 'Miércoles',
    accent: '#22d3ee',
    accentSoft: '#a5f3fc',
    exercises: [
      {
        id: 'b-deadlift', name: 'Peso muerto convencional', muscles: 'Glúteos · Isquios · Espalda baja',
        sets: 4, reps: '5', rest: '2:30', anim: 'deadlift',
        tips: [
          'Barra sobre el medio del pie, casi tocando la tibia.',
          'Cadera más alta que rodillas, pecho arriba.',
          'Empuja el suelo, no jales con la espalda.',
          'Termina con cadera completamente extendida sin hiperextender.',
        ],
      },
      {
        id: 'b-pullup', name: 'Dominadas', muscles: 'Dorsal · Bíceps · Espalda media',
        sets: 4, reps: '6-10', rest: '2:00', anim: 'pullup',
        tips: [
          'Agarre ligeramente más ancho que los hombros.',
          'Inicia colgando completamente con escápulas activas.',
          'Lleva el pecho hacia la barra, no solo la barbilla.',
          'Si no llegas: usa banda elástica o sustituye por jalón al pecho.',
        ],
      },
      {
        id: 'b-incline', name: 'Press inclinado mancuernas', muscles: 'Pecho superior · Hombros',
        sets: 3, reps: '8-10', rest: '1:30', anim: 'incline',
        tips: [
          'Banca inclinada a 30-45 grados.',
          'Mancuernas con palmas hacia el frente.',
          'Baja controlado a la altura del pecho superior.',
          'Aprieta el pecho arriba sin trabar codos.',
        ],
      },
      {
        id: 'b-lunge', name: 'Zancadas caminando', muscles: 'Cuádriceps · Glúteos · Estabilizadores',
        sets: 3, reps: '10 c/pierna', rest: '1:30', anim: 'lunge',
        tips: [
          'Paso largo, baja la rodilla trasera hasta cerca del suelo.',
          'Rodilla delantera alineada con el pie.',
          'Torso erguido, pecho arriba.',
          'Empuja desde el talón delantero al avanzar.',
        ],
      },
      {
        id: 'b-arms', name: 'Curl + Extensión tríceps', muscles: 'Bíceps · Tríceps',
        sets: 3, reps: '10 + 10', rest: '1:00', anim: 'curl',
        tips: [
          'Superserie: 10 curls, sin descanso, 10 extensiones.',
          'Curls: codos pegados al torso, sin balanceo.',
          'Extensiones en polea: codos fijos, solo se mueve el antebrazo.',
          'Controla la fase excéntrica (bajada) en ambos.',
        ],
      },
    ],
    finisher: {
      name: 'AMRAP 12 minutos',
      work: '200 m remo + 10 wall balls + 10 lagartijas',
      anims: [
        { name: 'Remo', type: 'rower' },
        { name: 'Wall ball', type: 'wallball' },
        { name: 'Lagartija', type: 'pushup' },
      ],
    },
  },

  C: {
    id: 'C',
    name: 'DÍA C',
    subtitle: 'Piernas + Condición',
    suggestedDay: 'Viernes',
    accent: '#a3e635',
    accentSoft: '#d9f99d',
    exercises: [
      {
        id: 'c-bulgarian', name: 'Sentadilla búlgara', muscles: 'Cuádriceps · Glúteos · Estabilizadores',
        sets: 4, reps: '8 c/pierna', rest: '2:00', anim: 'bulgarian',
        tips: [
          'Pie trasero elevado en banca, distancia de un paso largo.',
          'Baja casi vertical; rodilla delantera no rebasa demasiado el pie.',
          'Torso ligeramente inclinado al frente.',
          'Empuja con el talón delantero al subir.',
        ],
      },
      {
        id: 'c-hipthrust', name: 'Hip thrust con barra', muscles: 'Glúteos · Isquios',
        sets: 4, reps: '8-10', rest: '2:00', anim: 'hipthrust',
        tips: [
          'Espalda alta apoyada en banca, pies cerca del glúteo.',
          'Barra en cadera (usa colchoneta o pad).',
          'Empuja con talones, aprieta glúteos arriba.',
          'Cadera completamente extendida en el tope, neutral (no hiperextender).',
        ],
      },
      {
        id: 'c-ohp-bar', name: 'Press militar barra', muscles: 'Hombros · Tríceps · Core',
        sets: 3, reps: '6-8', rest: '1:30', anim: 'ohp',
        tips: [
          'Barra apoyada en clavícula, codos ligeramente al frente.',
          'Mete la cabeza al pasar la barra.',
          'Aprieta glúteos y abdomen, no arquees la espalda.',
          'Bloquea arriba con la barra encima de la cabeza, no enfrente.',
        ],
      },
      {
        id: 'c-cablerow', name: 'Remo en máquina o T-bar', muscles: 'Espalda media · Dorsales',
        sets: 3, reps: '10', rest: '1:30', anim: 'cablerow',
        tips: [
          'Pecho arriba, espalda neutra.',
          'Jala con codos pegados al torso.',
          'Aprieta omóplatos al final.',
          'Controla 1-2 segundos al regresar.',
        ],
      },
      {
        id: 'c-abwheel', name: 'Rueda abdominal', muscles: 'Core · Hombros · Dorsales',
        sets: 3, reps: '8-12', rest: '1:00', anim: 'abwheel',
        tips: [
          'Inicia de rodillas, manos en el agarre.',
          'Rueda hacia adelante manteniendo el core apretado.',
          'No arquees la espalda baja.',
          'Regresa controlado contrayendo abdomen.',
        ],
      },
    ],
    finisher: {
      name: '5 rondas',
      work: '250 m remo o bici + 10 thrusters + 10 sit-ups',
      anims: [
        { name: 'Remo', type: 'rower' },
        { name: 'Thruster', type: 'thruster' },
        { name: 'Sit-up', type: 'situp' },
      ],
    },
  },
};

// ============================================================
// STORAGE HELPERS
// ============================================================

const defaultState = () => ({
  v: 2,
  startDate: new Date().toISOString(),
  current: { A: null, B: null, C: null },
  history: { A: [], B: [], C: [] },
  stats: { totalSessions: 0 },
});

const newSession = (workoutId) => ({
  date: new Date().toISOString(),
  workoutId,
  exercises: WORKOUTS[workoutId].exercises.reduce((acc, ex) => {
    acc[ex.id] = {
      sets: Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false })),
    };
    return acc;
  }, {}),
});

async function loadState() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) return JSON.parse(value);
  } catch (_) { /* not found */ }
  // Try migration from v1
  try {
    const v1 = localStorage.getItem(STORAGE_KEY_V1);
    if (v1) {
      const oldState = JSON.parse(v1);
      const migrated = {
        v: 2,
        startDate: oldState.startDate ?? new Date().toISOString(),
        current: oldState.current ?? { A: null, B: null, C: null },
        history: {
          A: oldState.last?.A ? [oldState.last.A] : [],
          B: oldState.last?.B ? [oldState.last.B] : [],
          C: oldState.last?.C ? [oldState.last.C] : [],
        },
        stats: oldState.stats ?? { totalSessions: 0 },
      };
      return migrated;
    }
  } catch (_) { /* not found */ }
  return defaultState();
}

async function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed', e);
  }
}

// ============================================================
// ANALYTICS HELPERS
// ============================================================

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

// Epley formula: 1RM ≈ weight × (1 + reps/30)
const estimateOneRM = (weight, reps) => {
  const w = num(weight);
  const r = num(reps);
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30));
};

// Volume of a session = sum of (weight × reps) across all completed sets
const sessionVolume = (session) => {
  if (!session?.exercises) return 0;
  let vol = 0;
  for (const exId in session.exercises) {
    for (const set of session.exercises[exId].sets) {
      if (set.done) vol += num(set.weight) * num(set.reps);
    }
  }
  return Math.round(vol);
};

// Top set per exercise = best 1RM estimate from the session's done sets
const topSetForExercise = (session, exerciseId) => {
  if (!session?.exercises?.[exerciseId]) return null;
  let best = null;
  for (const set of session.exercises[exerciseId].sets) {
    if (!set.done) continue;
    const w = num(set.weight);
    const r = num(set.reps);
    if (w <= 0 || r <= 0) continue;
    const e1rm = estimateOneRM(w, r);
    if (!best || e1rm > best.e1rm) best = { weight: w, reps: r, e1rm };
  }
  return best;
};

// All sessions chronologically across all days
const allSessionsSorted = (state) => {
  const all = [];
  for (const d of ['A', 'B', 'C']) {
    for (const s of state.history[d] ?? []) all.push(s);
  }
  return all.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Sessions in the last N days
const sessionsInLastDays = (state, days) => {
  const cutoff = Date.now() - days * 86400000;
  return allSessionsSorted(state).filter(s => new Date(s.date).getTime() >= cutoff);
};

// Get the start of the week (Monday) for a date
const startOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  d.setDate(d.getDate() + diff);
  return d;
};

// Group sessions by week
const sessionsByWeek = (sessions) => {
  const groups = {};
  for (const s of sessions) {
    const week = startOfWeek(s.date).toISOString();
    if (!groups[week]) groups[week] = [];
    groups[week].push(s);
  }
  return groups;
};

// Days since last session
const daysSinceLastSession = (state) => {
  const all = allSessionsSorted(state);
  if (!all.length) return null;
  const last = new Date(all[all.length - 1].date);
  return Math.floor((Date.now() - last.getTime()) / 86400000);
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatDateShort = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
};

const formatTime = (d) => {
  const date = new Date(d);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const formatVolume = (v) => {
  if (v >= 1000) return (v / 1000).toFixed(1) + 't';
  return v + 'kg';
};

// Find exercise definition by ID across all workouts
const findExerciseDef = (id) => {
  for (const w of Object.values(WORKOUTS)) {
    const ex = w.exercises.find(e => e.id === id);
    if (ex) return { ...ex, workoutId: w.id, accent: w.accent };
  }
  return null;
};

// ============================================================
// EXERCISE ANIMATIONS — SVG with internal CSS keyframes
// ============================================================

const animBase = "w-full h-full";
const stroke = "white";
const sw = 7;

// Helper: 2-frame flipbook with smooth crossfade
const useFlipKeys = (id) => `
  @keyframes ${id}-fa { 0%,42% { opacity: 1 } 50%,92% { opacity: 0 } 100% { opacity: 1 } }
  @keyframes ${id}-fb { 0%,42% { opacity: 0 } 50%,92% { opacity: 1 } 100% { opacity: 0 } }
  .${id}-a { animation: ${id}-fa 1.8s ease-in-out infinite; }
  .${id}-b { animation: ${id}-fb 1.8s ease-in-out infinite; }
`;

function SquatAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('sq')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — standing */}
      <g className="sq-a">
        <rect x="35" y="48" width="130" height="6" fill={accent} rx="3" />
        <circle cx="35" cy="51" r="14" fill={accent} />
        <circle cx="165" cy="51" r="14" fill={accent} />
        <circle cx="100" cy="33" r="13" fill={stroke} />
        <line x1="100" y1="46" x2="100" y2="135" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="60" x2="65" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="60" x2="135" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="92" y1="135" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="108" y1="135" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — bottom */}
      <g className="sq-b">
        <rect x="35" y="118" width="130" height="6" fill={accent} rx="3" />
        <circle cx="35" cy="121" r="14" fill={accent} />
        <circle cx="165" cy="121" r="14" fill={accent} />
        <circle cx="100" cy="103" r="13" fill={stroke} />
        <line x1="100" y1="116" x2="105" y2="195" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="130" x2="65" y2="125" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="130" x2="135" y2="125" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        {/* Bent legs */}
        <line x1="105" y1="195" x2="70" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="70" y1="225" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="195" x2="140" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="140" y1="225" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function BenchAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 200" className={animBase}>
      <style>{useFlipKeys('bp')}</style>
      {/* Bench */}
      <rect x="50" y="120" width="140" height="14" fill={stroke} opacity="0.15" rx="3" />
      <line x1="60" y1="134" x2="60" y2="180" stroke={stroke} strokeWidth="4" opacity="0.3" />
      <line x1="180" y1="134" x2="180" y2="180" stroke={stroke} strokeWidth="4" opacity="0.3" />
      {/* Body lying */}
      <circle cx="65" cy="110" r="12" fill={stroke} />
      <line x1="76" y1="115" x2="190" y2="115" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      <line x1="190" y1="115" x2="200" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="200" y1="155" x2="220" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms — frame A bottom (bar at chest) */}
      <g className="bp-a">
        <line x1="135" y1="115" x2="135" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="135" y1="100" x2="135" y2="80" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="100" y="76" width="70" height="6" fill={accent} rx="3" />
        <circle cx="100" cy="79" r="10" fill={accent} />
        <circle cx="170" cy="79" r="10" fill={accent} />
      </g>
      {/* Arms — frame B top (bar extended) */}
      <g className="bp-b">
        <line x1="135" y1="115" x2="135" y2="80" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="135" y1="80" x2="135" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="100" y="36" width="70" height="6" fill={accent} rx="3" />
        <circle cx="100" cy="39" r="10" fill={accent} />
        <circle cx="170" cy="39" r="10" fill={accent} />
      </g>
    </svg>
  );
}

function DeadliftAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('dl')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — bottom (bent over, bar on floor) */}
      <g className="dl-a">
        <circle cx="100" cy="80" r="12" fill={stroke} />
        <line x1="100" y1="92" x2="105" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="105" y1="155" x2="100" y2="240" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="155" x2="80" y2="200" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="200" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="155" x2="130" y2="200" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="130" y1="200" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="100" x2="100" y2="245" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="40" y="248" width="120" height="6" fill={accent} rx="3" />
        <circle cx="40" cy="251" r="20" fill={accent} />
        <circle cx="160" cy="251" r="20" fill={accent} />
      </g>
      {/* Frame B — lockout (standing tall with bar at hip) */}
      <g className="dl-b">
        <circle cx="100" cy="35" r="13" fill={stroke} />
        <line x1="100" y1="48" x2="100" y2="135" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="60" x2="100" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="92" y1="135" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="108" y1="135" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="40" y="145" width="120" height="6" fill={accent} rx="3" />
        <circle cx="40" cy="148" r="20" fill={accent} />
        <circle cx="160" cy="148" r="20" fill={accent} />
      </g>
    </svg>
  );
}

function RowAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 240" className={animBase}>
      <style>{useFlipKeys('rw')}</style>
      <line x1="15" y1="230" x2="225" y2="230" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Bent over body (static) */}
      <circle cx="80" cy="65" r="12" fill={stroke} />
      <line x1="92" y1="72" x2="170" y2="105" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      <line x1="170" y1="105" x2="170" y2="165" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="170" y1="165" x2="155" y2="230" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="170" y1="165" x2="190" y2="230" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms — A bar low */}
      <g className="rw-a">
        <line x1="130" y1="92" x2="125" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="180" x2="135" y2="210" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="80" y="208" width="110" height="6" fill={accent} rx="3" />
        <circle cx="80" cy="211" r="14" fill={accent} />
        <circle cx="190" cy="211" r="14" fill={accent} />
      </g>
      {/* Arms — B bar to belly */}
      <g className="rw-b">
        <line x1="130" y1="92" x2="125" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="135" x2="135" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="80" y="113" width="110" height="6" fill={accent} rx="3" />
        <circle cx="80" cy="116" r="14" fill={accent} />
        <circle cx="190" cy="116" r="14" fill={accent} />
      </g>
    </svg>
  );
}

function OHPAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('oh')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Body standing */}
      <circle cx="100" cy="80" r="13" fill={stroke} />
      <line x1="100" y1="93" x2="100" y2="180" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      <line x1="92" y1="180" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="108" y1="180" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms — A: at shoulders */}
      <g className="oh-a">
        <line x1="100" y1="105" x2="65" y2="120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="65" y1="120" x2="65" y2="90" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="105" x2="135" y2="120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="135" y1="120" x2="135" y2="90" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="65" cy="80" r="11" fill={accent} />
        <circle cx="135" cy="80" r="11" fill={accent} />
      </g>
      {/* Arms — B: overhead */}
      <g className="oh-b">
        <line x1="100" y1="105" x2="75" y2="60" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="75" y1="60" x2="75" y2="20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="105" x2="125" y2="60" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="60" x2="125" y2="20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="75" cy="14" r="11" fill={accent} />
        <circle cx="125" cy="14" r="11" fill={accent} />
      </g>
    </svg>
  );
}

function PlankAnim({ accent }) {
  return (
    <svg viewBox="0 0 280 160" className={animBase}>
      <style>{`@keyframes pk-breath { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } } .pk { animation: pk-breath 2.4s ease-in-out infinite; transform-origin: center; }`}</style>
      <line x1="15" y1="148" x2="265" y2="148" stroke={stroke} strokeWidth="2" opacity="0.25" />
      <g className="pk">
        <circle cx="55" cy="70" r="13" fill={stroke} />
        <line x1="68" y1="78" x2="225" y2="105" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        {/* Forearm */}
        <line x1="68" y1="78" x2="55" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="55" y1="110" x2="60" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="42" y1="148" x2="78" y2="148" stroke={accent} strokeWidth={sw - 1} strokeLinecap="round" />
        {/* Legs */}
        <line x1="225" y1="105" x2="245" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="225" y1="105" x2="250" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function PullupAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('pu')}</style>
      {/* Bar at top */}
      <rect x="20" y="20" width="160" height="8" fill={accent} rx="3" />
      {/* Frame A — hanging */}
      <g className="pu-a">
        <line x1="80" y1="28" x2="80" y2="80" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="28" x2="120" y2="80" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="80" x2="100" y2="120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="80" x2="100" y2="120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="100" cy="100" r="12" fill={stroke} />
        <line x1="100" y1="120" x2="100" y2="200" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="200" x2="92" y2="260" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="200" x2="108" y2="260" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — chin over bar */}
      <g className="pu-b">
        <line x1="80" y1="28" x2="80" y2="50" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="28" x2="120" y2="50" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="50" x2="100" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="50" x2="100" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="100" cy="38" r="12" fill={stroke} />
        <line x1="100" y1="55" x2="100" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="155" x2="85" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="155" x2="115" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function InclineAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 220" className={animBase}>
      <style>{useFlipKeys('ip')}</style>
      {/* Inclined bench */}
      <line x1="40" y1="200" x2="200" y2="80" stroke={stroke} strokeWidth="14" opacity="0.15" strokeLinecap="round" />
      <line x1="50" y1="200" x2="50" y2="215" stroke={stroke} strokeWidth="3" opacity="0.3" />
      <line x1="195" y1="90" x2="195" y2="60" stroke={stroke} strokeWidth="3" opacity="0.3" />
      {/* Body lying inclined */}
      <circle cx="180" cy="80" r="12" fill={stroke} />
      <line x1="170" y1="88" x2="80" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      <line x1="80" y1="155" x2="65" y2="200" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms — A: at chest */}
      <g className="ip-a">
        <line x1="135" y1="120" x2="120" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="100" x2="100" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="95" cy="100" r="9" fill={accent} />
        <line x1="135" y1="120" x2="155" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="155" y1="105" x2="155" y2="80" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="155" cy="78" r="9" fill={accent} />
      </g>
      {/* Arms — B: extended */}
      <g className="ip-b">
        <line x1="135" y1="120" x2="100" y2="60" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="60" x2="80" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="78" cy="36" r="9" fill={accent} />
        <line x1="135" y1="120" x2="155" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="155" y1="55" x2="170" y2="30" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="172" cy="28" r="9" fill={accent} />
      </g>
    </svg>
  );
}

function LungeAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 280" className={animBase}>
      <style>{useFlipKeys('ln')}</style>
      <line x1="15" y1="270" x2="225" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — standing/step start */}
      <g className="ln-a">
        <circle cx="100" cy="55" r="13" fill={stroke} />
        <line x1="100" y1="68" x2="100" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="80" x2="78" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="80" x2="122" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="76" cy="140" r="9" fill={accent} />
        <circle cx="124" cy="140" r="9" fill={accent} />
        <line x1="92" y1="155" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="108" y1="155" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — lunge bottom */}
      <g className="ln-b">
        <circle cx="120" cy="100" r="13" fill={stroke} />
        <line x1="120" y1="113" x2="125" y2="190" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="120" y1="125" x2="98" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="125" x2="142" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="96" cy="185" r="9" fill={accent} />
        <circle cx="144" cy="185" r="9" fill={accent} />
        {/* Front leg bent */}
        <line x1="125" y1="190" x2="170" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="170" y1="220" x2="180" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        {/* Back leg bent */}
        <line x1="125" y1="190" x2="80" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="220" x2="60" y2="265" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function CurlAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('cl')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      <circle cx="100" cy="55" r="13" fill={stroke} />
      <line x1="100" y1="68" x2="100" y2="170" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      <line x1="92" y1="170" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="108" y1="170" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms — A: extended down */}
      <g className="cl-a">
        <line x1="100" y1="80" x2="75" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="75" y1="135" x2="75" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="80" x2="125" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="135" x2="125" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="75" cy="190" r="11" fill={accent} />
        <circle cx="125" cy="190" r="11" fill={accent} />
      </g>
      {/* Arms — B: curled up */}
      <g className="cl-b">
        <line x1="100" y1="80" x2="75" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="75" y1="135" x2="80" y2="85" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="80" x2="125" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="135" x2="120" y2="85" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="80" cy="78" r="11" fill={accent} />
        <circle cx="120" cy="78" r="11" fill={accent} />
      </g>
    </svg>
  );
}

function BulgarianAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 280" className={animBase}>
      <style>{useFlipKeys('bg')}</style>
      <line x1="15" y1="270" x2="225" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Bench in back */}
      <rect x="170" y="190" width="60" height="10" fill={stroke} opacity="0.2" rx="2" />
      <line x1="180" y1="200" x2="180" y2="265" stroke={stroke} strokeWidth="3" opacity="0.3" />
      <line x1="220" y1="200" x2="220" y2="265" stroke={stroke} strokeWidth="3" opacity="0.3" />
      {/* Frame A — top */}
      <g className="bg-a">
        <circle cx="120" cy="55" r="13" fill={stroke} />
        <line x1="120" y1="68" x2="120" y2="160" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="120" y1="80" x2="98" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="80" x2="142" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="160" x2="115" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="160" x2="180" y2="190" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — bottom */}
      <g className="bg-b">
        <circle cx="120" cy="115" r="13" fill={stroke} />
        <line x1="120" y1="128" x2="125" y2="200" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="120" y1="140" x2="98" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="140" x2="142" y2="180" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="200" x2="100" y2="240" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="240" x2="115" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="200" x2="180" y2="195" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function HipthrustAnim({ accent }) {
  return (
    <svg viewBox="0 0 280 200" className={animBase}>
      <style>{useFlipKeys('ht')}</style>
      <line x1="15" y1="190" x2="265" y2="190" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Bench */}
      <rect x="20" y="80" width="80" height="14" fill={stroke} opacity="0.15" rx="3" />
      <line x1="30" y1="94" x2="30" y2="190" stroke={stroke} strokeWidth="4" opacity="0.3" />
      <line x1="90" y1="94" x2="90" y2="190" stroke={stroke} strokeWidth="4" opacity="0.3" />
      {/* Head & shoulders fixed on bench */}
      <circle cx="55" cy="70" r="12" fill={stroke} />
      <line x1="65" y1="78" x2="115" y2="80" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      {/* Frame A — hips down */}
      <g className="ht-a">
        <line x1="115" y1="80" x2="135" y2="160" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="135" y1="160" x2="190" y2="170" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="190" y1="170" x2="200" y2="190" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="125" y="155" width="20" height="6" fill={accent} rx="2" />
        <circle cx="135" cy="158" r="14" fill={accent} opacity="0.8" />
      </g>
      {/* Frame B — hips up */}
      <g className="ht-b">
        <line x1="115" y1="80" x2="195" y2="100" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="195" y1="100" x2="220" y2="160" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="220" y1="160" x2="220" y2="190" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="180" y="92" width="30" height="6" fill={accent} rx="2" />
        <circle cx="195" cy="95" r="14" fill={accent} opacity="0.8" />
      </g>
    </svg>
  );
}

function CableRowAnim({ accent }) {
  return (
    <svg viewBox="0 0 280 200" className={animBase}>
      <style>{useFlipKeys('cr')}</style>
      <line x1="15" y1="190" x2="265" y2="190" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Cable machine pulley */}
      <rect x="240" y="100" width="20" height="90" fill={stroke} opacity="0.2" />
      <circle cx="250" cy="105" r="6" fill={stroke} opacity="0.4" />
      {/* Body seated */}
      <circle cx="80" cy="60" r="12" fill={stroke} />
      <line x1="80" y1="72" x2="80" y2="140" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
      <line x1="80" y1="140" x2="160" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="160" y1="155" x2="160" y2="190" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="200" y1="155" x2="200" y2="190" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms with cable */}
      <g className="cr-a">
        <line x1="80" y1="85" x2="160" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="160" y1="105" x2="220" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="220" y1="115" x2="250" y2="105" stroke={accent} strokeWidth="2" strokeDasharray="3,3" />
        <rect x="215" y="110" width="14" height="10" fill={accent} rx="2" />
      </g>
      <g className="cr-b">
        <line x1="80" y1="85" x2="115" y2="120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="115" y1="120" x2="100" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="105" x2="250" y2="105" stroke={accent} strokeWidth="2" strokeDasharray="3,3" />
        <rect x="92" y="100" width="14" height="10" fill={accent} rx="2" />
      </g>
    </svg>
  );
}

function AbWheelAnim({ accent }) {
  return (
    <svg viewBox="0 0 280 180" className={animBase}>
      <style>{useFlipKeys('aw')}</style>
      <line x1="15" y1="170" x2="265" y2="170" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — kneeling start */}
      <g className="aw-a">
        <circle cx="100" cy="60" r="12" fill={stroke} />
        <line x1="100" y1="72" x2="100" y2="120" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="120" x2="115" y2="150" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="115" y1="150" x2="160" y2="160" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="85" x2="135" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="140" cy="155" r="14" fill="none" stroke={accent} strokeWidth="4" />
        <line x1="124" y1="155" x2="156" y2="155" stroke={accent} strokeWidth="3" />
      </g>
      {/* Frame B — extended */}
      <g className="aw-b">
        <circle cx="80" cy="100" r="12" fill={stroke} />
        <line x1="92" y1="105" x2="160" y2="135" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="160" y1="135" x2="120" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="155" x2="80" y2="160" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="105" x2="220" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="225" cy="155" r="14" fill="none" stroke={accent} strokeWidth="4" />
        <line x1="209" y1="155" x2="241" y2="155" stroke={accent} strokeWidth="3" />
      </g>
    </svg>
  );
}

function KBSwingAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('kb')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — hip hinge with KB between legs */}
      <g className="kb-a">
        <circle cx="80" cy="90" r="12" fill={stroke} />
        <line x1="92" y1="98" x2="135" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="135" y1="155" x2="125" y2="200" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="125" y1="200" x2="115" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="135" y1="155" x2="155" y2="200" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="155" y1="200" x2="155" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="115" x2="120" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="120" cy="230" r="13" fill={accent} />
        <line x1="118" y1="220" x2="122" y2="220" stroke={accent} strokeWidth="4" />
      </g>
      {/* Frame B — KB at chest level */}
      <g className="kb-b">
        <circle cx="100" cy="55" r="13" fill={stroke} />
        <line x1="100" y1="68" x2="100" y2="170" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="92" y1="170" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="108" y1="170" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="80" x2="100" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="100" x2="100" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="100" cy="145" r="13" fill={accent} />
      </g>
    </svg>
  );
}

function BurpeeAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 240" className={animBase}>
      <style>{useFlipKeys('bu')}</style>
      <line x1="15" y1="230" x2="225" y2="230" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — plank */}
      <g className="bu-a">
        <circle cx="55" cy="170" r="11" fill={stroke} />
        <line x1="65" y1="175" x2="195" y2="195" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="65" y1="175" x2="60" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="195" y1="195" x2="210" y2="230" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="195" y1="195" x2="220" y2="230" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — jump up */}
      <g className="bu-b">
        <circle cx="120" cy="40" r="13" fill={stroke} />
        <line x1="120" y1="53" x2="120" y2="140" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="120" y1="65" x2="85" y2="20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="65" x2="155" y2="20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="140" x2="105" y2="195" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="140" x2="135" y2="195" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="195" x2="100" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="135" y1="195" x2="140" y2="220" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        {/* Motion lines */}
        <line x1="60" y1="200" x2="60" y2="220" stroke={accent} strokeWidth="3" opacity="0.6" />
        <line x1="180" y1="200" x2="180" y2="220" stroke={accent} strokeWidth="3" opacity="0.6" />
      </g>
    </svg>
  );
}

function PushupAnim({ accent }) {
  return (
    <svg viewBox="0 0 280 160" className={animBase}>
      <style>{useFlipKeys('ph')}</style>
      <line x1="15" y1="148" x2="265" y2="148" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — top (extended) */}
      <g className="ph-a">
        <circle cx="55" cy="50" r="12" fill={stroke} />
        <line x1="65" y1="58" x2="220" y2="100" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="65" y1="58" x2="60" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="220" y1="100" x2="240" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="220" y1="100" x2="245" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — bottom (chest near floor) */}
      <g className="ph-b">
        <circle cx="55" cy="100" r="12" fill={stroke} />
        <line x1="65" y1="105" x2="220" y2="125" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="65" y1="105" x2="65" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="220" y1="125" x2="240" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="220" y1="125" x2="245" y2="148" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function WallballAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('wb')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Wall (right side) */}
      <line x1="180" y1="10" x2="180" y2="270" stroke={stroke} strokeWidth="3" opacity="0.2" />
      {/* Frame A — squat with ball at chest */}
      <g className="wb-a">
        <circle cx="80" cy="115" r="12" fill={stroke} />
        <line x1="80" y1="127" x2="85" y2="195" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="80" y1="140" x2="100" y2="160" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="160" x2="115" y2="140" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="85" y1="195" x2="65" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="65" y1="225" x2="75" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="85" y1="195" x2="105" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="225" x2="115" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="125" cy="135" r="16" fill={accent} />
      </g>
      {/* Frame B — standing throw */}
      <g className="wb-b">
        <circle cx="80" cy="55" r="12" fill={stroke} />
        <line x1="80" y1="67" x2="80" y2="170" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="80" y1="80" x2="120" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="40" x2="150" y2="20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="72" y1="170" x2="72" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="88" y1="170" x2="88" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="160" cy="20" r="16" fill={accent} />
      </g>
    </svg>
  );
}

function RowerAnim({ accent }) {
  return (
    <svg viewBox="0 0 280 160" className={animBase}>
      <style>{useFlipKeys('rm')}</style>
      <line x1="15" y1="148" x2="265" y2="148" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Rower rail */}
      <rect x="40" y="120" width="200" height="6" fill={stroke} opacity="0.2" rx="2" />
      <rect x="20" y="105" width="40" height="35" fill={accent} opacity="0.8" rx="3" />
      <line x1="60" y1="115" x2="220" y2="115" stroke={accent} strokeWidth="2" strokeDasharray="4,3" />
      {/* Frame A — catch (knees bent) */}
      <g className="rm-a">
        <circle cx="190" cy="65" r="12" fill={stroke} />
        <line x1="190" y1="77" x2="190" y2="115" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="190" y1="90" x2="160" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="160" y1="105" x2="120" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="190" y1="115" x2="160" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="160" y1="105" x2="195" y2="120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="115" y="113" width="14" height="6" fill={accent} rx="2" />
      </g>
      {/* Frame B — finish (legs extended, handle pulled) */}
      <g className="rm-b">
        <circle cx="220" cy="55" r="12" fill={stroke} />
        <line x1="220" y1="67" x2="215" y2="125" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="215" y1="85" x2="180" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="180" y1="100" x2="195" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="215" y1="125" x2="170" y2="125" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="170" y1="125" x2="120" y2="125" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <rect x="190" y="113" width="14" height="6" fill={accent} rx="2" />
      </g>
    </svg>
  );
}

function ThrusterAnim({ accent }) {
  return (
    <svg viewBox="0 0 200 280" className={animBase}>
      <style>{useFlipKeys('th')}</style>
      <line x1="15" y1="270" x2="185" y2="270" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — front squat bottom */}
      <g className="th-a">
        <rect x="55" y="115" width="90" height="6" fill={accent} rx="3" />
        <circle cx="55" cy="118" r="14" fill={accent} />
        <circle cx="145" cy="118" r="14" fill={accent} />
        <circle cx="100" cy="100" r="13" fill={stroke} />
        <line x1="100" y1="113" x2="105" y2="190" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="125" x2="80" y2="118" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="125" x2="120" y2="118" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="190" x2="70" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="70" y1="225" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="105" y1="190" x2="140" y2="225" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="140" y1="225" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — overhead lockout */}
      <g className="th-b">
        <rect x="55" y="20" width="90" height="6" fill={accent} rx="3" />
        <circle cx="55" cy="23" r="14" fill={accent} />
        <circle cx="145" cy="23" r="14" fill={accent} />
        <circle cx="100" cy="60" r="13" fill={stroke} />
        <line x1="100" y1="73" x2="100" y2="160" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="85" x2="80" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="40" x2="80" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="100" y1="85" x2="120" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="120" y1="40" x2="120" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="92" y1="160" x2="92" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="108" y1="160" x2="108" y2="270" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

function SitupAnim({ accent }) {
  return (
    <svg viewBox="0 0 240 180" className={animBase}>
      <style>{useFlipKeys('su')}</style>
      <line x1="15" y1="170" x2="225" y2="170" stroke={stroke} strokeWidth="2" opacity="0.25" />
      {/* Frame A — lying flat, knees up */}
      <g className="su-a">
        <circle cx="50" cy="135" r="12" fill={stroke} />
        <line x1="60" y1="142" x2="140" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="50" y1="125" x2="40" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="40" y1="105" x2="55" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="140" y1="155" x2="170" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="170" y1="115" x2="200" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="200" y1="155" x2="200" y2="170" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
      {/* Frame B — upright */}
      <g className="su-b">
        <circle cx="100" cy="60" r="12" fill={stroke} />
        <line x1="105" y1="72" x2="145" y2="155" stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" />
        <line x1="100" y1="73" x2="80" y2="60" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="80" y1="60" x2="100" y2="50" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="145" y1="155" x2="180" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="180" y1="115" x2="210" y2="155" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <line x1="210" y1="155" x2="210" y2="170" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    </svg>
  );
}

const ANIM_MAP = {
  squat: SquatAnim,
  bench: BenchAnim,
  deadlift: DeadliftAnim,
  row: RowAnim,
  ohp: OHPAnim,
  plank: PlankAnim,
  pullup: PullupAnim,
  incline: InclineAnim,
  lunge: LungeAnim,
  curl: CurlAnim,
  bulgarian: BulgarianAnim,
  hipthrust: HipthrustAnim,
  cablerow: CableRowAnim,
  abwheel: AbWheelAnim,
  kbswing: KBSwingAnim,
  burpee: BurpeeAnim,
  pushup: PushupAnim,
  wallball: WallballAnim,
  rower: RowerAnim,
  thruster: ThrusterAnim,
  situp: SitupAnim,
};

function ExerciseAnim({ type, accent = '#f97316' }) {
  const Comp = ANIM_MAP[type];
  if (!Comp) return null;
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Comp accent={accent} />
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Stylesheet() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
      .display-font { font-family: 'Bebas Neue', Impact, sans-serif; letter-spacing: 0.02em; }
      .body-font { font-family: 'Manrope', system-ui, sans-serif; }
      .mono-font { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
      
      .gym-app {
        font-family: 'Manrope', system-ui, sans-serif;
        background: #050403;
        color: #fafaf9;
        min-height: 100vh;
        min-height: 100dvh;
        position: relative;
        isolation: isolate;
      }
      
      /* Ambient decorative backgrounds */
      .ambient-bg {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: 
          radial-gradient(ellipse 800px 600px at 50% -10%, rgba(249, 115, 22, 0.10), transparent 50%),
          radial-gradient(ellipse 900px 700px at 50% 110%, rgba(34, 211, 238, 0.05), transparent 50%),
          radial-gradient(ellipse 600px 500px at 85% 40%, rgba(163, 230, 53, 0.04), transparent 50%);
      }
      
      .grain {
        position: fixed; inset: 0; pointer-events: none; opacity: 0.025; z-index: 1;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }
      
      /* Decorative side panels for wide screens */
      @media (min-width: 768px) {
        .side-decor-l, .side-decor-r {
          position: fixed; top: 0; bottom: 0; width: calc(50vw - 240px); pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse at center, rgba(249, 115, 22, 0.03), transparent 70%);
        }
        .side-decor-l { left: 0; }
        .side-decor-r { right: 0; }
      }
      
      .number-input::-webkit-outer-spin-button,
      .number-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      .number-input { -moz-appearance: textfield; }
      
      @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.6); }
        70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
        100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
      }
      .today-pulse { animation: pulse-ring 2s infinite; }
      
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .slide-up { animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .fade-in { animation: fade-in 0.3s ease-out; }
      
      @keyframes done-pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.18); }
        100% { transform: scale(1); }
      }
      .done-pop { animation: done-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      
      @keyframes glow-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      .glow-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
      
      .hatched {
        background-image: repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 7px);
      }
      
      .card-surface {
        background: linear-gradient(180deg, rgba(28, 25, 23, 0.7), rgba(12, 10, 9, 0.7));
        border: 1px solid rgba(68, 64, 60, 0.4);
        backdrop-filter: blur(12px);
      }
      
      .card-hover { transition: border-color 0.2s, transform 0.2s; }
      .card-hover:active { transform: scale(0.995); }
      
      .button-tap { transition: transform 0.1s; }
      .button-tap:active { transform: scale(0.96); }
      
      /* iOS-style bottom sheet for modal */
      @media (max-width: 640px) {
        .modal-sheet { max-height: 92vh; border-radius: 20px 20px 0 0; }
      }
    `}</style>
  );
}

function Header({ stats, today, daysSince }) {
  const todayWorkoutId = DAY_TO_WORKOUT[today];
  const todayWorkout = todayWorkoutId ? WORKOUTS[todayWorkoutId] : null;
  
  return (
    <div className="pt-safe">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-4 h-4 text-stone-950" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-stone-500 body-font font-bold leading-none">Gym</div>
            <div className="display-font text-lg text-white leading-none mt-0.5">TRACKER</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-stone-500 body-font uppercase tracking-widest leading-none">Hoy</div>
          <div className="display-font text-base text-stone-200 leading-none mt-1">{DAYS_ES[today]}</div>
        </div>
      </div>
      
      {/* Live indicator row */}
      <div className="px-5 pb-4 flex items-center gap-4 border-b border-stone-800/60">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="mono-font text-xs text-stone-300">
            <span className="font-bold text-white">{stats.totalSessions}</span>
            <span className="text-stone-500"> sesiones</span>
          </span>
        </div>
        {daysSince !== null && (
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${daysSince <= 1 ? 'bg-lime-400 glow-pulse' : daysSince <= 3 ? 'bg-amber-400' : 'bg-stone-600'}`} />
            <span className="mono-font text-xs text-stone-500">
              {daysSince === 0 ? 'Entrenaste hoy' : daysSince === 1 ? 'Ayer' : `hace ${daysSince}d`}
            </span>
          </div>
        )}
        {todayWorkout && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full today-pulse" style={{ background: todayWorkout.accent }} />
            <span className="text-[10px] uppercase tracking-widest body-font font-bold" style={{ color: todayWorkout.accent }}>
              Toca {todayWorkout.name.split(' ')[1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DayTabs({ selected, onSelect, today }) {
  const todayWorkout = DAY_TO_WORKOUT[today];
  return (
    <div className="px-5 pt-4 pb-3 grid grid-cols-3 gap-2">
      {Object.values(WORKOUTS).map((w) => {
        const isSelected = selected === w.id;
        const isToday = todayWorkout === w.id;
        return (
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            className={`relative p-3 rounded-xl border transition-all text-left button-tap overflow-hidden ${
              isSelected 
                ? 'bg-stone-900/80 border-stone-600' 
                : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
            }`}
            style={isSelected ? { 
              borderColor: w.accent + '60', 
              boxShadow: `0 0 0 1px ${w.accent}30, 0 8px 24px -8px ${w.accent}25`,
              background: `linear-gradient(180deg, ${w.accent}10, transparent 80%)`,
            } : {}}
          >
            {isToday && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full today-pulse" style={{ background: w.accent }} />
            )}
            <div className="display-font text-2xl leading-none" style={{ color: isSelected ? w.accent : '#a8a29e' }}>{w.name}</div>
            <div className="text-[10px] uppercase tracking-wider mt-1.5 text-stone-500 body-font font-semibold leading-tight line-clamp-2 min-h-[24px]">{w.subtitle}</div>
            <div className="text-[10px] mt-1 text-stone-600 body-font">{w.suggestedDay}</div>
          </button>
        );
      })}
    </div>
  );
}

function SetRow({ setIdx, setData, lastSet, isTime, accent, onChange, onToggle }) {
  const labels = isTime ? ['SEG', 'NOTA'] : ['KG', 'REPS'];
  return (
    <div className={`grid grid-cols-[28px_1fr_1fr_44px] gap-2 items-center py-1.5 px-3 rounded-lg transition-colors ${setData.done ? 'bg-stone-900/60' : 'hover:bg-stone-900/30'}`}>
      <div className="display-font text-stone-500 text-base text-center">{setIdx + 1}</div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={setData.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          placeholder={lastSet?.weight ?? labels[0]}
          className="number-input w-full bg-stone-900/80 border border-stone-800 rounded-lg px-2.5 py-2 mono-font text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-600 focus:bg-stone-900"
        />
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={setData.reps}
          onChange={(e) => onChange('reps', e.target.value)}
          placeholder={lastSet?.reps ?? labels[1]}
          className="number-input w-full bg-stone-900/80 border border-stone-800 rounded-lg px-2.5 py-2 mono-font text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-600 focus:bg-stone-900"
        />
      </div>
      <button
        onClick={onToggle}
        className={`button-tap w-11 h-10 rounded-lg flex items-center justify-center transition-all ${setData.done ? 'done-pop' : ''}`}
        style={{
          background: setData.done ? accent : 'transparent',
          border: `1.5px solid ${setData.done ? accent : '#44403c'}`,
          boxShadow: setData.done ? `0 0 16px -2px ${accent}60` : 'none',
        }}
      >
        <Check className={`w-4 h-4 ${setData.done ? 'text-stone-950' : 'text-stone-600'}`} strokeWidth={3} />
      </button>
    </div>
  );
}

function ExerciseCard({ exercise, sessionData, lastSessionData, accent, onUpdateSet, onShowDemo }) {
  const completed = sessionData.sets.filter(s => s.done).length;
  const total = sessionData.sets.length;
  const lastSets = lastSessionData?.exercises[exercise.id]?.sets ?? [];
  const isComplete = completed === total && total > 0;
  
  return (
    <div 
      className="card-surface rounded-xl overflow-hidden card-hover relative"
      style={isComplete ? { borderColor: accent + '50', boxShadow: `0 0 0 1px ${accent}20` } : {}}
    >
      {/* Accent strip left edge */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity"
        style={{ background: accent, opacity: isComplete ? 1 : 0.4 }}
      />
      
      <div className="pl-4 pr-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="display-font text-xl sm:text-2xl text-white leading-tight">{exercise.name}</h3>
          <p className="text-[10px] text-stone-500 mt-0.5 body-font font-medium uppercase tracking-wide">{exercise.muscles}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="mono-font text-xs text-stone-300">
              <span style={{ color: accent }} className="font-bold">{exercise.sets}</span>
              <span className="text-stone-600"> × </span>
              <span>{exercise.reps}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 body-font">
              <Clock className="w-3 h-3" />
              {exercise.rest}
            </div>
            <div className="ml-auto flex items-center gap-1 mono-font text-xs">
              <span className="font-bold" style={{ color: completed === total && total > 0 ? accent : '#78716c' }}>{completed}</span>
              <span className="text-stone-700">/</span>
              <span className="text-stone-500">{total}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onShowDemo(exercise)}
          className="button-tap shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg text-[11px] body-font font-bold uppercase tracking-wider text-stone-300"
        >
          <Eye className="w-3.5 h-3.5" />
          Técnica
        </button>
      </div>
      
      <div className="pl-3 pr-2 pb-2 border-t border-stone-900/80">
        <div className="grid grid-cols-[28px_1fr_1fr_44px] gap-2 px-3 pt-2 pb-1">
          <div></div>
          <div className="text-[9px] uppercase tracking-widest text-stone-600 body-font font-bold">{exercise.isTime ? 'Seg' : 'Kg'}</div>
          <div className="text-[9px] uppercase tracking-widest text-stone-600 body-font font-bold">{exercise.isTime ? 'Nota' : 'Reps'}</div>
          <div></div>
        </div>
        {sessionData.sets.map((set, idx) => (
          <SetRow
            key={idx}
            setIdx={idx}
            setData={set}
            lastSet={lastSets[idx]}
            isTime={exercise.isTime}
            accent={accent}
            onChange={(field, val) => onUpdateSet(exercise.id, idx, field, val)}
            onToggle={() => onUpdateSet(exercise.id, idx, 'done', !set.done)}
          />
        ))}
        
        {lastSets.length > 0 && lastSets.some(s => s.weight) && (
          <div className="mt-2 mx-3 px-3 py-2 rounded-lg bg-stone-900/40 border border-stone-900">
            <div className="text-[9px] uppercase tracking-widest text-stone-600 body-font font-bold mb-1 flex items-center gap-1">
              <History className="w-2.5 h-2.5" />
              Última sesión
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {lastSets.map((s, i) => s.weight && (
                <span key={i} className="mono-font text-[11px] text-stone-400">
                  <span className="text-stone-600">{i + 1}:</span> {s.weight}
                  {!exercise.isTime && s.reps && <span className="text-stone-500">×{s.reps}</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FinisherCard({ finisher, accent, onShowDemo }) {
  return (
    <div className="rounded-xl overflow-hidden border relative" style={{ borderColor: accent + '40' }}>
      <div 
        className="px-4 py-3 hatched flex items-center gap-2 relative" 
        style={{ background: `linear-gradient(90deg, ${accent}20, ${accent}08)` }}
      >
        <Zap className="w-4 h-4" style={{ color: accent }} />
        <span className="display-font text-lg tracking-wider" style={{ color: accent }}>FINISHER METABÓLICO</span>
      </div>
      <div className="p-4 card-surface">
        <div className="display-font text-2xl text-white leading-tight">{finisher.name}</div>
        <p className="text-sm text-stone-400 body-font mt-1.5 leading-snug">{finisher.work}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {finisher.anims.map((a) => (
            <button
              key={a.type}
              onClick={() => onShowDemo({ name: a.name, anim: a.type, tips: [], muscles: '' })}
              className="button-tap flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg text-[11px] body-font font-semibold text-stone-300"
            >
              <Eye className="w-3 h-3" />
              {a.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoModal({ exercise, accent, onClose }) {
  if (!exercise) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md fade-in" onClick={onClose}>
      <div
        className="modal-sheet bg-stone-950 border-t sm:border border-stone-800 sm:rounded-2xl w-full sm:max-w-md overflow-y-auto pb-safe slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 80px ${accent}25` }}
      >
        <div className="sticky top-0 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 px-5 py-3 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest body-font font-bold" style={{ color: accent }}>Técnica</div>
            <h2 className="display-font text-xl sm:text-2xl text-white leading-tight truncate">{exercise.name}</h2>
          </div>
          <button onClick={onClose} className="button-tap shrink-0 ml-3 w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 flex items-center justify-center">
            <X className="w-4 h-4 text-stone-400" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="aspect-square w-full max-w-xs mx-auto bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border border-stone-800 p-4 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 hatched opacity-40" />
            <div 
              className="absolute -inset-1 opacity-20 blur-3xl pointer-events-none" 
              style={{ background: `radial-gradient(circle at center, ${accent}, transparent 60%)` }}
            />
            <div className="relative w-full h-full">
              <ExerciseAnim type={exercise.anim} accent={accent} />
            </div>
          </div>
          
          {exercise.muscles && (
            <div className="mt-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-xs text-stone-400 body-font font-semibold uppercase tracking-wide">{exercise.muscles}</span>
            </div>
          )}
          
          {exercise.tips?.length > 0 && (
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-widest text-stone-500 body-font font-bold mb-2.5">Puntos clave</div>
              <ul className="space-y-2.5">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-300 body-font leading-snug">
                    <span className="display-font shrink-0 mt-0.5 text-lg leading-none" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletionBanner({ workout, onSave, onReset }) {
  return (
    <div className="rounded-2xl p-5 border-2 border-dashed text-center relative overflow-hidden" style={{ borderColor: workout.accent + '60', background: workout.accent + '08' }}>
      <div className="absolute inset-0 opacity-30 blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle at center, ${workout.accent}40, transparent 70%)` }} />
      <div className="relative">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: workout.accent + '25' }}>
          <Trophy className="w-7 h-7" style={{ color: workout.accent }} />
        </div>
        <div className="display-font text-3xl text-white leading-none">¡SESIÓN COMPLETA!</div>
        <p className="text-sm text-stone-400 body-font mt-2">Guarda tu progreso para verlo en la próxima.</p>
        <div className="flex gap-2 mt-4 justify-center">
          <button
            onClick={onSave}
            className="button-tap display-font px-7 py-3 rounded-lg text-stone-950 text-lg shadow-lg tracking-wider"
            style={{ background: workout.accent, boxShadow: `0 8px 24px -6px ${workout.accent}80` }}
          >
            GUARDAR SESIÓN
          </button>
          <button
            onClick={onReset}
            className="button-tap px-3 py-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400"
            title="Empezar de nuevo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STATS VIEW
// ============================================================

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="card-surface rounded-xl p-3.5 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10 blur-2xl rounded-full" style={{ background: accent }} />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          <span className="text-[9px] uppercase tracking-widest text-stone-500 body-font font-bold">{label}</span>
        </div>
        <div className="display-font text-3xl text-white leading-none">{value}</div>
        {sub && <div className="text-[10px] text-stone-500 body-font mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900 border border-stone-700 rounded px-2.5 py-1.5 shadow-lg">
      <div className="text-[10px] text-stone-500 body-font uppercase tracking-wider">{label}</div>
      <div className="mono-font text-sm text-white font-bold">{payload[0].value}{suffix}</div>
    </div>
  );
}

function ProgressionChart({ data, accent }) {
  if (data.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center text-stone-600 body-font text-sm text-center px-6">
        Necesitas al menos 2 sesiones registradas para ver tu progresión.
      </div>
    );
  }
  return (
    <div className="h-44 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#292524" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#57534e" tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
          <YAxis stroke="#57534e" tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={32} />
          <Tooltip content={<ChartTooltip suffix="kg" />} cursor={{ stroke: accent, strokeOpacity: 0.3, strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={2.5}
            dot={{ fill: accent, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: accent, r: 5, strokeWidth: 2, stroke: '#0a0908' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function VolumeChart({ data, accent }) {
  if (!data.length) {
    return (
      <div className="h-32 flex items-center justify-center text-stone-600 body-font text-sm">
        Sin datos de volumen aún.
      </div>
    );
  }
  return (
    <div className="h-32 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#292524" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" stroke="#57534e" tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
          <YAxis stroke="#57534e" tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={32} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}t` : v} />
          <Tooltip content={<ChartTooltip suffix="kg" />} cursor={{ fill: accent, fillOpacity: 0.08 }} />
          <Bar dataKey="value" fill={accent} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatsView({ state }) {
  const allSessions = useMemo(() => allSessionsSorted(state), [state]);
  const totalVolume = useMemo(() => allSessions.reduce((sum, s) => sum + sessionVolume(s), 0), [allSessions]);
  const sessionsThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date()).getTime();
    return allSessions.filter(s => new Date(s.date).getTime() >= weekStart).length;
  }, [allSessions]);
  const daysSince = daysSinceLastSession(state);
  
  // Build list of all unique exercises that have data
  const exercisesWithData = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const s of allSessions) {
      for (const exId in s.exercises) {
        if (seen.has(exId)) continue;
        const top = topSetForExercise(s, exId);
        if (top) {
          seen.add(exId);
          const def = findExerciseDef(exId);
          if (def) list.push(def);
        }
      }
    }
    return list;
  }, [allSessions]);
  
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Auto-select first exercise on mount
  useEffect(() => {
    if (!selectedExercise && exercisesWithData.length) {
      setSelectedExercise(exercisesWithData[0].id);
    }
  }, [exercisesWithData, selectedExercise]);
  
  const selectedDef = selectedExercise ? findExerciseDef(selectedExercise) : null;
  
  // Build progression data for selected exercise
  const progressionData = useMemo(() => {
    if (!selectedExercise) return [];
    const points = [];
    for (const s of allSessions) {
      const top = topSetForExercise(s, selectedExercise);
      if (top) {
        points.push({
          date: formatDateShort(s.date),
          value: top.e1rm,
          weight: top.weight,
          reps: top.reps,
        });
      }
    }
    return points;
  }, [allSessions, selectedExercise]);
  
  // Volume per session (last 10)
  const volumeData = useMemo(() => {
    const recent = allSessions.slice(-10);
    return recent.map(s => ({
      label: formatDateShort(s.date),
      value: sessionVolume(s),
      day: s.workoutId,
    }));
  }, [allSessions]);
  
  // Personal records: top 1RM per exercise
  const records = useMemo(() => {
    const recs = {};
    for (const s of allSessions) {
      for (const exId in s.exercises) {
        const top = topSetForExercise(s, exId);
        if (top && (!recs[exId] || top.e1rm > recs[exId].e1rm)) {
          recs[exId] = { ...top, date: s.date, exId };
        }
      }
    }
    return Object.values(recs)
      .map(r => ({ ...r, def: findExerciseDef(r.exId) }))
      .filter(r => r.def)
      .sort((a, b) => b.e1rm - a.e1rm)
      .slice(0, 5);
  }, [allSessions]);
  
  if (!allSessions.length) {
    return (
      <div className="px-5 py-12 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 flex items-center justify-center shadow-xl">
            <TrendingUp className="w-10 h-10 text-stone-600" strokeWidth={1.5} />
          </div>
        </div>
        <div className="display-font text-3xl text-white leading-tight">SIN DATOS<br/><span className="text-stone-600">AÚN</span></div>
        <p className="text-sm text-stone-500 body-font mt-3 max-w-xs leading-relaxed">
          Completa y guarda tu primera sesión para empezar a ver gráficas de progresión, récords personales y volumen semanal.
        </p>
        {/* Preview of what's coming */}
        <div className="mt-6 w-full max-w-xs opacity-30 pointer-events-none">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-stone-900/50 border border-stone-800/50" />
            ))}
          </div>
          <div className="h-24 rounded-xl bg-stone-900/50 border border-stone-800/50 flex items-end justify-around p-3 gap-1">
            {[40, 60, 45, 75, 55, 85, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-stone-700 to-stone-800 rounded" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-5 py-4 space-y-5">
      {/* Top stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Sesiones" value={state.stats.totalSessions} sub="totales" icon={Flame} accent="#f97316" />
        <StatCard label="Esta semana" value={`${sessionsThisWeek}/3`} sub={sessionsThisWeek >= 3 ? '¡Completa!' : `${3 - sessionsThisWeek} restantes`} icon={Calendar} accent="#22d3ee" />
        <StatCard label="Volumen total" value={formatVolume(totalVolume)} sub="kg levantados" icon={Layers} accent="#a3e635" />
        <StatCard label="Última sesión" value={daysSince === 0 ? 'Hoy' : daysSince === 1 ? 'Ayer' : `${daysSince}d`} sub={daysSince > 3 ? '¡A entrenar!' : 'recuperado'} icon={Activity} accent="#fbbf24" />
      </div>
      
      {/* Exercise progression */}
      <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: selectedDef?.accent ?? '#f97316' }} />
            <span className="display-font text-lg text-white">PROGRESIÓN</span>
          </div>
          {progressionData.length > 0 && (
            <div className="text-right">
              <div className="mono-font text-sm font-bold" style={{ color: selectedDef?.accent }}>
                {progressionData[progressionData.length - 1].value} kg
              </div>
              <div className="text-[9px] uppercase tracking-widest text-stone-500 body-font">1RM est.</div>
            </div>
          )}
        </div>
        
        {/* Exercise picker */}
        <div className="px-4 pb-2 overflow-x-auto">
          <div className="flex gap-1.5 min-w-min">
            {exercisesWithData.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelectedExercise(ex.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded text-[11px] body-font font-bold border transition-colors ${
                  selectedExercise === ex.id ? 'bg-stone-800 text-white border-stone-700' : 'bg-stone-900 text-stone-500 border-stone-900 hover:border-stone-800'
                }`}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
        
        {selectedDef && (
          <div className="px-2 pb-3">
            <ProgressionChart data={progressionData} accent={selectedDef.accent} />
          </div>
        )}
      </div>
      
      {/* Volume per session */}
      <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl overflow-hidden">
        <div className="px-4 pt-3.5 pb-1 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" />
          <span className="display-font text-lg text-white">VOLUMEN POR SESIÓN</span>
        </div>
        <p className="px-4 pb-2 text-[10px] text-stone-500 body-font uppercase tracking-wider">Últimas {volumeData.length}</p>
        <div className="px-2 pb-3">
          <VolumeChart data={volumeData} accent="#f97316" />
        </div>
      </div>
      
      {/* Records */}
      {records.length > 0 && (
        <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl overflow-hidden">
          <div className="px-4 pt-3.5 pb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="display-font text-lg text-white">RÉCORDS PERSONALES</span>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {records.map((r, i) => (
              <div key={r.exId} className="flex items-center gap-3 py-1.5">
                <div className="display-font text-2xl text-stone-700 w-6">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white body-font font-bold truncate">{r.def.name}</div>
                  <div className="text-[10px] text-stone-500 body-font">{formatDate(r.date)}</div>
                </div>
                <div className="text-right">
                  <div className="mono-font text-base font-bold" style={{ color: r.def.accent }}>{r.e1rm} kg</div>
                  <div className="mono-font text-[10px] text-stone-500">{r.weight}×{r.reps}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HISTORY VIEW
// ============================================================

function SessionDetail({ session }) {
  const workout = WORKOUTS[session.workoutId];
  return (
    <div className="px-3 pb-3 space-y-2 border-t border-stone-900/80 pt-3 mt-1">
      {workout.exercises.map(ex => {
        const data = session.exercises[ex.id];
        if (!data) return null;
        const doneSets = data.sets.filter(s => s.done);
        if (!doneSets.length) return null;
        return (
          <div key={ex.id} className="bg-stone-900/40 rounded p-2.5">
            <div className="text-xs body-font font-bold text-stone-200 mb-1">{ex.name}</div>
            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
              {data.sets.map((s, i) => s.done && (
                <span key={i} className="mono-font text-[11px] text-stone-400">
                  <span className="text-stone-600">{i + 1}:</span>{' '}
                  {ex.isTime ? `${s.weight}s` : `${s.weight}×${s.reps}`}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryItem({ session, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const workout = WORKOUTS[session.workoutId];
  const volume = sessionVolume(session);
  const exerciseCount = Object.values(session.exercises).filter(
    e => e.sets.some(s => s.done)
  ).length;
  
  return (
    <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-3 flex items-center gap-3 text-left hover:bg-stone-900/30 transition-colors"
      >
        <div
          className="w-1 h-12 rounded-full shrink-0"
          style={{ background: workout.accent }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="display-font text-xl" style={{ color: workout.accent }}>{workout.name}</span>
            <span className="text-[10px] text-stone-500 body-font uppercase tracking-wider truncate">{workout.subtitle}</span>
          </div>
          <div className="text-xs text-stone-400 body-font mt-0.5">
            {formatDate(session.date)} · {formatTime(session.date)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="mono-font text-sm text-stone-200 font-bold">{formatVolume(volume)}</div>
          <div className="text-[10px] text-stone-500 body-font">{exerciseCount} ejerc.</div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-600" /> : <ChevronDown className="w-4 h-4 text-stone-600" />}
      </button>
      {expanded && (
        <>
          <SessionDetail session={session} />
          <div className="px-3 pb-3">
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta sesión del historial?')) onDelete();
              }}
              className="w-full py-1.5 text-[10px] uppercase tracking-widest text-red-500/70 hover:text-red-500 body-font font-bold flex items-center justify-center gap-1.5 border border-red-900/30 hover:border-red-900/60 rounded"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function HistoryView({ state, onDeleteSession }) {
  const allSessions = useMemo(() => allSessionsSorted(state).reverse(), [state]);
  const grouped = useMemo(() => sessionsByWeek(allSessions), [allSessions]);
  const weekKeys = useMemo(() => Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)), [grouped]);
  
  if (!allSessions.length) {
    return (
      <div className="px-5 py-12 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 flex items-center justify-center shadow-xl">
            <History className="w-10 h-10 text-stone-600" strokeWidth={1.5} />
          </div>
        </div>
        <div className="display-font text-3xl text-white leading-tight">SIN HISTORIAL<br/><span className="text-stone-600">AÚN</span></div>
        <p className="text-sm text-stone-500 body-font mt-3 max-w-xs leading-relaxed">
          Completa tu primera sesión y guárdala. Aquí verás todas tus sesiones agrupadas por semana, con volumen y detalle de cada serie.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-stone-600 body-font">
          <div className="w-6 h-px bg-stone-800" />
          <span className="uppercase tracking-widest font-bold">Paso 1 de 3</span>
          <div className="w-6 h-px bg-stone-800" />
        </div>
        <div className="mt-5 text-[11px] text-stone-500 body-font leading-relaxed max-w-xs">
          <div className="flex items-center gap-2.5 py-1.5">
            <div className="w-5 h-5 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] display-font text-orange-500">1</div>
            <span>Ve a <span className="text-stone-300 font-semibold">Entrenar</span> y registra cada serie.</span>
          </div>
          <div className="flex items-center gap-2.5 py-1.5">
            <div className="w-5 h-5 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] display-font text-orange-500">2</div>
            <span>Termina y toca <span className="text-stone-300 font-semibold">Guardar sesión</span>.</span>
          </div>
          <div className="flex items-center gap-2.5 py-1.5">
            <div className="w-5 h-5 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] display-font text-orange-500">3</div>
            <span>Regresa aquí y ve tu progreso.</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-5 py-4 space-y-5">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-stone-600 body-font font-bold">Total</div>
          <div className="display-font text-3xl text-white">{allSessions.length} sesiones</div>
        </div>
      </div>
      
      {weekKeys.map(wk => {
        const weekDate = new Date(wk);
        const weekLabel = `Semana del ${weekDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
        const weekSessions = grouped[wk].sort((a, b) => new Date(b.date) - new Date(a.date));
        const weekVolume = weekSessions.reduce((sum, s) => sum + sessionVolume(s), 0);
        return (
          <div key={wk}>
            <div className="flex items-baseline justify-between mb-2 px-1">
              <div className="text-[11px] uppercase tracking-widest text-stone-500 body-font font-bold">{weekLabel}</div>
              <div className="mono-font text-[11px] text-stone-500">
                {weekSessions.length} ses · {formatVolume(weekVolume)}
              </div>
            </div>
            <div className="space-y-2">
              {weekSessions.map(s => (
                <HistoryItem
                  key={s.date}
                  session={s}
                  onDelete={() => onDeleteSession(s.workoutId, s.date)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// BOTTOM NAVIGATION
// ============================================================

function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'train', label: 'Entrenar', icon: Dumbbell },
    { id: 'stats', label: 'Progreso', icon: BarChart3 },
    { id: 'history', label: 'Historial', icon: History },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/80 pb-safe">
      <div className="max-w-md md:max-w-lg mx-auto grid grid-cols-3">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="button-tap py-2.5 flex flex-col items-center gap-1 transition-colors relative"
            >
              {isActive && (
                <>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-orange-500 rounded-b-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                </>
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-500' : 'text-stone-600'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] uppercase tracking-wider body-font font-bold transition-colors ${isActive ? 'text-orange-500' : 'text-stone-600'}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const today = new Date().getDay();
  const defaultDay = DAY_TO_WORKOUT[today] ?? 'A';
  
  const [state, setState] = useState(null);
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [demoExercise, setDemoExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('train');
  
  // Load state on mount
  useEffect(() => {
    loadState().then(setState);
  }, []);
  
  // Save state on changes
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);
  
  const workout = WORKOUTS[selectedDay];
  
  const session = useMemo(() => {
    if (!state) return null;
    return state.current[selectedDay] ?? newSession(selectedDay);
  }, [state, selectedDay]);
  
  const lastSession = useMemo(() => {
    if (!state) return null;
    const hist = state.history?.[selectedDay] ?? [];
    return hist.length ? hist[hist.length - 1] : null;
  }, [state, selectedDay]);
  
  const completion = useMemo(() => {
    if (!session) return { done: 0, total: 0, complete: false };
    let done = 0, total = 0;
    for (const ex of workout.exercises) {
      const ses = session.exercises[ex.id];
      if (!ses) continue;
      total += ses.sets.length;
      done += ses.sets.filter(s => s.done).length;
    }
    return { done, total, complete: done === total && total > 0 };
  }, [session, workout]);
  
  if (!state || !session) {
    return (
      <div className="gym-app flex items-center justify-center">
        <Stylesheet />
        <div className="display-font text-stone-600 text-2xl">Cargando...</div>
      </div>
    );
  }
  
  const updateSet = (exerciseId, setIdx, field, value) => {
    setState((prev) => {
      const cur = prev.current[selectedDay] ?? newSession(selectedDay);
      const exData = cur.exercises[exerciseId] ?? { sets: [] };
      const newSets = [...exData.sets];
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
      return {
        ...prev,
        current: {
          ...prev.current,
          [selectedDay]: {
            ...cur,
            exercises: { ...cur.exercises, [exerciseId]: { sets: newSets } },
          },
        },
      };
    });
  };
  
  const saveSession = () => {
    setState((prev) => {
      const sessionToSave = {
        ...prev.current[selectedDay],
        date: new Date().toISOString(), // Update date to completion time
      };
      return {
        ...prev,
        history: {
          ...prev.history,
          [selectedDay]: [...(prev.history[selectedDay] ?? []), sessionToSave],
        },
        current: { ...prev.current, [selectedDay]: null },
        stats: { ...prev.stats, totalSessions: (prev.stats?.totalSessions ?? 0) + 1 },
      };
    });
  };
  
  const resetSession = () => {
    if (!confirm('¿Reiniciar esta sesión? Se borrarán los datos no guardados.')) return;
    setState((prev) => ({
      ...prev,
      current: { ...prev.current, [selectedDay]: null },
    }));
  };
  
  const deleteSession = (dayId, sessionDate) => {
    setState((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [dayId]: (prev.history[dayId] ?? []).filter(s => s.date !== sessionDate),
      },
      stats: { ...prev.stats, totalSessions: Math.max(0, (prev.stats?.totalSessions ?? 0) - 1) },
    }));
  };
  
  const progressPct = completion.total ? Math.round((completion.done / completion.total) * 100) : 0;
  const daysSince = daysSinceLastSession(state);
  
  return (
    <div className="gym-app relative">
      <Stylesheet />
      <div className="ambient-bg" />
      <div className="grain" />
      <div className="side-decor-l hidden md:block" />
      <div className="side-decor-r hidden md:block" />
      
      <div className="max-w-md md:max-w-lg mx-auto relative z-10 pb-32">
        <Header stats={state.stats} today={today} daysSince={daysSince} />
        
        {activeTab === 'train' && (
          <div className="fade-in">
            <DayTabs selected={selectedDay} onSelect={setSelectedDay} today={today} />
            
            {/* Workout focus header */}
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-stone-600 body-font font-bold">Enfoque</div>
                  <div className="display-font text-2xl sm:text-3xl text-white leading-tight truncate">{workout.subtitle}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="mono-font text-3xl sm:text-4xl font-bold leading-none" style={{ color: workout.accent }}>{progressPct}<span className="text-xl">%</span></div>
                  <div className="text-[10px] uppercase tracking-widest text-stone-600 body-font font-bold mt-1">
                    {completion.done}/{completion.total} series
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${progressPct}%`, 
                    background: `linear-gradient(90deg, ${workout.accent}, ${workout.accent}cc)`,
                    boxShadow: progressPct > 0 ? `0 0 12px ${workout.accent}80` : 'none',
                  }} 
                />
              </div>
            </div>
            
            {/* Exercises */}
            <div className="px-5 pb-4 space-y-3">
              {workout.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  sessionData={session.exercises[ex.id] ?? { sets: Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false })) }}
                  lastSessionData={lastSession}
                  accent={workout.accent}
                  onUpdateSet={updateSet}
                  onShowDemo={setDemoExercise}
                />
              ))}
            </div>
            
            {/* Finisher */}
            <div className="px-5 pb-4">
              <FinisherCard finisher={workout.finisher} accent={workout.accent} onShowDemo={setDemoExercise} />
            </div>
            
            {/* Completion / Save */}
            <div className="px-5 pb-6">
              {completion.complete ? (
                <CompletionBanner workout={workout} onSave={saveSession} onReset={resetSession} />
              ) : (
                <button
                  onClick={resetSession}
                  className="button-tap w-full py-2.5 text-xs uppercase tracking-widest text-stone-600 body-font font-bold hover:text-stone-400 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reiniciar sesión
                </button>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && <div className="fade-in"><StatsView state={state} /></div>}
        
        {activeTab === 'history' && <div className="fade-in"><HistoryView state={state} onDeleteSession={deleteSession} /></div>}
      </div>
      
      <BottomNav active={activeTab} onChange={setActiveTab} />
      
      <DemoModal exercise={demoExercise} accent={workout.accent} onClose={() => setDemoExercise(null)} />
    </div>
  );
}
