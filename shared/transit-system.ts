// Transit System - Core Types for Growth Program Engine
// Handles multi-chart projections and field vector computation

export type ChartType = "Sidereal" | "Tropical" | "Draconic";
// 9 Consciousness Bodies (Human Design Centers mapped to field names)
export type FieldName = 
  | "Mind"              // Head/Ajna - Mental awareness
  | "Ajna"              // Ajna - Conceptual processing  
  | "ThroatExpression"  // Throat - Communication & manifestation
  | "SolarIdentity"     // G-Center - Identity & direction
  | "Will"              // Heart/Ego - Willpower & commitment
  | "SacralLife"        // Sacral - Life force & creativity
  | "Emotions"          // Solar Plexus - Emotional awareness
  | "Instinct"          // Spleen - Intuition & survival
  | "Root";             // Root - Pressure & drive
export type Planet = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto" | "NorthNode" | "Chiron";

export interface PlanetaryPosition {
  planet: Planet;
  longitude: number;        // 0-360 degrees
  gate: number;            // 1-64 (I Ching hexagram)
  line: number;            // 1-6
  speed: number;           // degrees per day
  retrograde: boolean;
}

export interface TransitProjection {
  chartType: ChartType;
  timestamp: Date;
  positions: PlanetaryPosition[];
}

export interface FieldVector {
  field: FieldName;
  chartType: ChartType;
  activeGates: number[];
  transitPressure: number;        // 0.0-1.0: How many planets activating this field
  historicalResonance: number;    // 0.0-1.0: User's past response to this field
  weight: number;                 // Computed: transitPressure × historicalResonance
  dominantPlanets: Planet[];      // Which planets are driving this field
}

export interface TransitCache {
  timestamp: Date;
  expiresAt: Date;
  projections: {
    sidereal: TransitProjection;
    tropical: TransitProjection;
    draconic: TransitProjection;
  };
}

export interface UserChartSignature {
  userId: string;
  birthData: {
    date: Date;
    latitude: number;
    longitude: number;
  };
  fieldAssignments: {
    [key in FieldName]: {
      chartType: ChartType;
      sensitiveGates: number[];  // Gates user is particularly responsive to
    };
  };
  resonanceHistory: {
    [key in FieldName]: number;  // Running average of engagement
  };
}

// Field → Chart Type mapping (default assignments)
export const FIELD_CHART_MAPPING: { [key in FieldName]: ChartType } = {
  Mind: "Sidereal",
  Ajna: "Sidereal",
  ThroatExpression: "Tropical",
  SolarIdentity: "Draconic",
  Will: "Tropical",
  SacralLife: "Tropical",
  Emotions: "Draconic",
  Instinct: "Sidereal",
  Root: "Tropical"
};

// Gate → Degree ranges (each gate = 5.625 degrees)
// 360 degrees ÷ 64 gates = 5.625° per gate
export function longitudeToGate(longitude: number): { gate: number; line: number } {
  const normalized = longitude % 360;
  const gateWidth = 360 / 64; // 5.625 degrees
  const lineWidth = gateWidth / 6; // ~0.9375 degrees
  
  // Gates start at 0° (Gate 1), proceed sequentially
  const gateIndex = Math.floor(normalized / gateWidth);
  const gate = ((gateIndex + 1) % 64) || 64; // 1-64
  
  const positionInGate = normalized % gateWidth;
  const line = Math.floor(positionInGate / lineWidth) + 1; // 1-6
  
  return { gate, line };
}

// Projection offsets
export const PROJECTION_OFFSETS = {
  Sidereal: -23.4, // Ayanamsa (approximate, adjust per year)
  Tropical: 0,
  Draconic: 0      // Uses Moon's North Node as 0° Aries
};
