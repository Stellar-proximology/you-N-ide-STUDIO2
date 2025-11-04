/**
 * 7 CHART CALCULATORS FOR ERN CALIBRATION
 * 
 * Each chart type seeds a different consciousness layer:
 * 1. Natal Chart → BEING (physical/genetic foundation)
 * 2. Transit Chart → MOVEMENT (current temporal state)
 * 3. Progressed Chart → EVOLUTION (developmental arc)
 * 4. Solar Return → DESIGN (yearly intentions)
 * 5. Lunar Return → SPACE (monthly emotional cycles)
 * 6. Composite Chart → TRANSPERSONAL (relational field)
 * 7. Draconic Chart → VOID (soul purpose/karmic template)
 * 
 * These convert ephemeris data → Human Design gates → field activation seeds
 */

import Astronomy from 'astronomy-engine';

// LLM integration for chart interpretation
interface ChartInterpretation {
  summary: string;
  layerInsights: Record<string, string>;
  calibrationGuidance: string;
  dominantThemes: string[];
  energySignature: string;
}

// ============================================================================
// TYPES
// ============================================================================

export interface BirthData {
  datetime: Date;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PlanetaryPosition {
  planet: string;
  longitude: number; // 0-360 degrees
  latitude: number;
  speed: number;
}

export interface GateActivation {
  gate: number; // 1-64
  line: number; // 1-6
  color: number; // 1-6
  tone: number; // 1-6
  base: number; // 1-5
}

export interface CenterActivation {
  center: string;
  phase: number; // 0-2π
  amplitude: number; // 0-1
  frequency: number; // multiplier
}

export interface ChartSeeds {
  layer: string;
  centers: Record<string, CenterActivation>;
  gates: GateActivation[];
  dominantElement: string;
  coherenceBias: number;
}

// ============================================================================
// PLANET TO GATE MAPPING (Human Design)
// ============================================================================

const PLANET_GATE_MAP = {
  // Personality (conscious) - calculated from birth time
  Sun: { design: true, personality: true },
  Earth: { design: true, personality: true },
  Moon: { design: true, personality: true },
  NorthNode: { design: true, personality: true },
  SouthNode: { design: true, personality: true },
  Mercury: { design: true, personality: true },
  Venus: { design: true, personality: true },
  Mars: { design: true, personality: true },
  Jupiter: { design: true, personality: true },
  Saturn: { design: true, personality: true },
  Uranus: { design: true, personality: true },
  Neptune: { design: true, personality: true },
  Pluto: { design: true, personality: true },
};

const GATE_TO_CENTER_MAP: Record<number, string> = {
  // Head Center
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna Center
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat Center
  62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat',
  45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 20: 'Throat', 16: 'Throat',
  // G Center
  7: 'G', 1: 'G', 13: 'G', 10: 'G', 15: 'G', 46: 'G', 25: 'G', 2: 'G',
  // Heart/Ego Center
  51: 'Heart/Ego', 21: 'Heart/Ego', 40: 'Heart/Ego', 26: 'Heart/Ego',
  // Solar Plexus Center
  6: 'Solar Plexus', 37: 'Solar Plexus', 22: 'Solar Plexus', 36: 'Solar Plexus',
  30: 'Solar Plexus', 55: 'Solar Plexus', 49: 'Solar Plexus',
  // Sacral Center
  5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral',
  3: 'Sacral', 42: 'Sacral', 27: 'Sacral', 34: 'Sacral',
  // Spleen Center
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  // Root Center
  58: 'Root', 38: 'Root', 54: 'Root', 53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
};

const CENTER_FREQUENCIES = {
  'Head': 1.33,
  'Ajna': 1.33,
  'Throat': 1.33,
  'G': 3.33,
  'Heart/Ego': 3.33,
  'Solar Plexus': 3.33,
  'Sacral': 1.0,
  'Spleen': 1.0,
  'Root': 1.0,
};

// ============================================================================
// BASE EPHEMERIS CALCULATOR (will use swisseph when available)
// ============================================================================

class EphemerisCalculator {
  /**
   * Calculate planetary positions using Astronomy Engine
   */
  static calculatePositions(datetime: Date, latitude: number, longitude: number): PlanetaryPosition[] {
    const astroTime = Astronomy.MakeTime(datetime);
    
    // Calculate actual planetary positions
    const positions: PlanetaryPosition[] = [];
    
    // Sun (SunPosition already returns ecliptic coordinates)
    const sunEcliptic = Astronomy.SunPosition(astroTime);
    positions.push({
      planet: 'Sun',
      longitude: sunEcliptic.elon,
      latitude: sunEcliptic.elat,
      speed: 1.0
    });
    
    // Moon
    const moonEcliptic = Astronomy.Ecliptic(Astronomy.GeoMoon(astroTime));
    positions.push({
      planet: 'Moon',
      longitude: moonEcliptic.elon,
      latitude: moonEcliptic.elat,
      speed: 13.0
    });
    
    // Planets
    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const speeds = [1.6, 1.2, 0.5, 0.08, 0.03, 0.01, 0.006, 0.004];
    
    planets.forEach((planet, idx) => {
      const bodyCode = planet as Astronomy.Body;
      const geoVector = Astronomy.GeoVector(bodyCode, astroTime, false);
      const ecliptic = Astronomy.Ecliptic(geoVector);
      
      positions.push({
        planet,
        longitude: ecliptic.elon,
        latitude: ecliptic.elat,
        speed: speeds[idx]
      });
    });
    
    // North Node (approximation using Moon's orbit)
    const moonNode = this.calculateMoonNode(astroTime);
    positions.push({
      planet: 'NorthNode',
      longitude: moonNode,
      latitude: 0,
      speed: -0.05
    });
    
    // South Node (opposite North Node)
    positions.push({
      planet: 'SouthNode',
      longitude: (moonNode + 180) % 360,
      latitude: 0,
      speed: -0.05
    });
    
    // Earth (opposite Sun)
    positions.push({
      planet: 'Earth',
      longitude: (sunEcliptic.elon + 180) % 360,
      latitude: 0,
      speed: 1.0
    });
    
    return positions;
  }
  
  static calculateMoonNode(astroTime: Astronomy.AstroTime): number {
    // Approximate North Node calculation
    // Using simplified formula: Node = 125.04 - 0.0529539 * days from J2000
    const j2000 = Astronomy.MakeTime(new Date('2000-01-01T12:00:00Z'));
    const daysSinceJ2000 = astroTime.ut - j2000.ut;
    const nodePosition = (125.04 - 0.0529539 * daysSinceJ2000) % 360;
    return nodePosition < 0 ? nodePosition + 360 : nodePosition;
  }

  static longitudeToGate(longitude: number): GateActivation {
    // Convert 360° zodiac to 64 gates (each gate = 5.625°)
    const gateNumber = Math.floor(longitude / 5.625) + 1;
    const gatePosition = (longitude % 5.625) / 5.625;
    
    // Line (1-6)
    const line = Math.floor(gatePosition * 6) + 1;
    const linePosition = (gatePosition * 6) % 1;
    
    // Color (1-6)
    const color = Math.floor(linePosition * 6) + 1;
    const colorPosition = (linePosition * 6) % 1;
    
    // Tone (1-6)
    const tone = Math.floor(colorPosition * 6) + 1;
    const tonePosition = (colorPosition * 6) % 1;
    
    // Base (1-5)
    const base = Math.floor(tonePosition * 5) + 1;
    
    return {
      gate: gateNumber,
      line,
      color,
      tone,
      base,
    };
  }
}

// ============================================================================
// 1. NATAL CHART CALCULATOR → BEING LAYER
// ============================================================================

export class NatalChartCalculator {
  /**
   * Calculate natal chart and convert to BEING layer seeds
   * This is the genetic/physical foundation
   */
  static calculate(birthData: BirthData): ChartSeeds {
    const positions = EphemerisCalculator.calculatePositions(
      birthData.datetime,
      birthData.latitude,
      birthData.longitude
    );

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    // Initialize all centers
    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.3, // default baseline
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    // Process planetary positions
    positions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      // Activate corresponding center
      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.15);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'BEING',
      centers: centerActivations,
      gates,
      dominantElement: 'C', // Carbon (physical structure)
      coherenceBias: 0.5,
    };
  }
}

// ============================================================================
// 2. TRANSIT CHART CALCULATOR → MOVEMENT LAYER
// ============================================================================

export class TransitChartCalculator {
  /**
   * Calculate current transits → MOVEMENT layer
   * This is the current temporal state
   */
  static calculate(currentTime: Date, natalData: BirthData): ChartSeeds {
    const positions = EphemerisCalculator.calculatePositions(
      currentTime,
      natalData.latitude,
      natalData.longitude
    );

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.2,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    positions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.1);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'MOVEMENT',
      centers: centerActivations,
      gates,
      dominantElement: 'H', // Hydrogen (movement/energy)
      coherenceBias: 0.4,
    };
  }
}

// ============================================================================
// 3. PROGRESSED CHART CALCULATOR → EVOLUTION LAYER
// ============================================================================

export class ProgressedChartCalculator {
  /**
   * Calculate progressed chart (1 day = 1 year) → EVOLUTION layer
   * This is the developmental arc
   */
  static calculate(birthData: BirthData, currentAge: number): ChartSeeds {
    // Progress birth time by 1 day per year of life
    const progressedDate = new Date(birthData.datetime);
    progressedDate.setDate(progressedDate.getDate() + currentAge);

    const positions = EphemerisCalculator.calculatePositions(
      progressedDate,
      birthData.latitude,
      birthData.longitude
    );

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.25,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    positions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.12);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'EVOLUTION',
      centers: centerActivations,
      gates,
      dominantElement: 'N', // Nitrogen (transformation/breath)
      coherenceBias: 0.6,
    };
  }
}

// ============================================================================
// 4. SOLAR RETURN CALCULATOR → DESIGN LAYER
// ============================================================================

export class SolarReturnCalculator {
  /**
   * Calculate solar return (Sun returns to natal position) → DESIGN layer
   * This is yearly intentions/themes
   */
  static calculate(birthData: BirthData, year: number): ChartSeeds {
    // Calculate when Sun returns to natal position in given year
    // TODO: Use actual solar return calculation with swisseph
    const solarReturnDate = new Date(year, birthData.datetime.getMonth(), birthData.datetime.getDate());

    const positions = EphemerisCalculator.calculatePositions(
      solarReturnDate,
      birthData.latitude,
      birthData.longitude
    );

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.35,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    positions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.13);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'DESIGN',
      centers: centerActivations,
      gates,
      dominantElement: 'O', // Oxygen (breath/intention)
      coherenceBias: 0.7,
    };
  }
}

// ============================================================================
// 5. LUNAR RETURN CALCULATOR → SPACE LAYER
// ============================================================================

export class LunarReturnCalculator {
  /**
   * Calculate lunar return (Moon returns to natal position) → SPACE layer
   * This is monthly emotional cycles
   */
  static calculate(birthData: BirthData, date: Date): ChartSeeds {
    // Calculate when Moon returns to natal position
    // TODO: Use actual lunar return calculation with swisseph
    const lunarReturnDate = date;

    const positions = EphemerisCalculator.calculatePositions(
      lunarReturnDate,
      birthData.latitude,
      birthData.longitude
    );

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.3,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    positions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.14);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'SPACE',
      centers: centerActivations,
      gates,
      dominantElement: 'O', // Oxygen (emotional waves)
      coherenceBias: 0.55,
    };
  }
}

// ============================================================================
// 6. COMPOSITE CHART CALCULATOR → TRANSPERSONAL LAYER
// ============================================================================

export class CompositeChartCalculator {
  /**
   * Calculate composite chart (midpoint between two charts) → TRANSPERSONAL layer
   * This is relational field/connection
   */
  static calculate(person1: BirthData, person2: BirthData): ChartSeeds {
    const positions1 = EphemerisCalculator.calculatePositions(
      person1.datetime,
      person1.latitude,
      person1.longitude
    );

    const positions2 = EphemerisCalculator.calculatePositions(
      person2.datetime,
      person2.latitude,
      person2.longitude
    );

    // Calculate midpoints
    const compositePositions: PlanetaryPosition[] = [];
    for (let i = 0; i < positions1.length; i++) {
      const midLongitude = (positions1[i].longitude + positions2[i].longitude) / 2;
      compositePositions.push({
        planet: positions1[i].planet,
        longitude: midLongitude,
        latitude: 0,
        speed: (positions1[i].speed + positions2[i].speed) / 2,
      });
    }

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.4,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    compositePositions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.15);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'TRANSPERSONAL',
      centers: centerActivations,
      gates,
      dominantElement: 'S', // Sulfur (connection/bridge)
      coherenceBias: 0.8,
    };
  }
}

// ============================================================================
// 7. DRACONIC CHART CALCULATOR → VOID LAYER
// ============================================================================

export class DraconicChartCalculator {
  /**
   * Calculate draconic chart (North Node at 0° Aries) → VOID layer
   * This is soul purpose/karmic template
   */
  static calculate(birthData: BirthData): ChartSeeds {
    const positions = EphemerisCalculator.calculatePositions(
      birthData.datetime,
      birthData.latitude,
      birthData.longitude
    );

    // Find North Node position
    const northNode = positions.find(p => p.planet === 'NorthNode');
    const nodeOffset = northNode ? northNode.longitude : 0;

    // Rotate all positions so North Node is at 0°
    const draconicPositions = positions.map(pos => ({
      ...pos,
      longitude: (pos.longitude - nodeOffset + 360) % 360,
    }));

    const gates: GateActivation[] = [];
    const centerActivations: Record<string, CenterActivation> = {};

    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      centerActivations[center] = {
        center,
        phase: 0,
        amplitude: 0.2,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    draconicPositions.forEach(pos => {
      const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
      gates.push(gateActivation);

      const center = GATE_TO_CENTER_MAP[gateActivation.gate];
      if (center && centerActivations[center]) {
        centerActivations[center].amplitude = Math.min(1.0, centerActivations[center].amplitude + 0.1);
        centerActivations[center].phase = (pos.longitude * Math.PI) / 180;
      }
    });

    return {
      layer: 'VOID',
      centers: centerActivations,
      gates,
      dominantElement: 'H', // Hydrogen (primordial essence)
      coherenceBias: 0.3,
    };
  }
}

// ============================================================================
// MASTER CALIBRATOR
// ============================================================================

export class ConsciousnessCalibrator {
  /**
   * Calculate all 7 charts and merge into complete field seeding matrix
   */
  static calibrateAll(birthData: BirthData, currentTime?: Date): Record<string, ChartSeeds> {
    const now = currentTime || new Date();
    const age = this.calculateAge(birthData.datetime, now);
    const currentYear = now.getFullYear();

    return {
      BEING: NatalChartCalculator.calculate(birthData),
      MOVEMENT: TransitChartCalculator.calculate(now, birthData),
      EVOLUTION: ProgressedChartCalculator.calculate(birthData, age),
      DESIGN: SolarReturnCalculator.calculate(birthData, currentYear),
      SPACE: LunarReturnCalculator.calculate(birthData, now),
      TRANSPERSONAL: CompositeChartCalculator.calculate(birthData, birthData), // self-composite for now
      VOID: DraconicChartCalculator.calculate(birthData),
    };
  }

  static calculateAge(birthDate: Date, currentDate: Date): number {
    const diff = currentDate.getTime() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  /**
   * Merge all layer seeds into unified oscillator initialization
   */
  static mergeSeeds(allSeeds: Record<string, ChartSeeds>): Record<string, CenterActivation> {
    const merged: Record<string, CenterActivation> = {};

    // Initialize
    Object.keys(CENTER_FREQUENCIES).forEach(center => {
      merged[center] = {
        center,
        phase: 0,
        amplitude: 0,
        frequency: CENTER_FREQUENCIES[center as keyof typeof CENTER_FREQUENCIES],
      };
    });

    // Weight different layers
    const weights = {
      BEING: 0.3,       // 30% from natal
      MOVEMENT: 0.2,    // 20% from transits
      EVOLUTION: 0.15,  // 15% from progressed
      DESIGN: 0.15,     // 15% from solar return
      SPACE: 0.1,       // 10% from lunar return
      TRANSPERSONAL: 0.05, // 5% from composite
      VOID: 0.05,       // 5% from draconic
    };

    // Merge weighted contributions
    Object.entries(allSeeds).forEach(([layer, seeds]) => {
      const weight = weights[layer as keyof typeof weights];
      Object.entries(seeds.centers).forEach(([centerName, activation]) => {
        if (merged[centerName]) {
          merged[centerName].amplitude += activation.amplitude * weight;
          merged[centerName].phase += activation.phase * weight;
        }
      });
    });

    // Normalize amplitudes to [0, 1]
    Object.values(merged).forEach(center => {
      center.amplitude = Math.min(1.0, center.amplitude);
      center.phase = center.phase % (2 * Math.PI);
    });

    return merged;
  }
}

// ============================================================================
// LLM CHART INTERPRETER (HuggingFace)
// ============================================================================

import { HfInference } from '@huggingface/inference';

export class ChartInterpreter {
  private static hf: HfInference | null = null;

  private static getHF(): HfInference {
    if (!this.hf) {
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      if (!apiKey) {
        throw new Error('HuggingFace API key not configured. Set HUGGINGFACE_API_KEY environment variable.');
      }
      this.hf = new HfInference(apiKey);
    }
    return this.hf;
  }

  /**
   * Interpret all 7 charts using HuggingFace LLM
   */
  static async interpretCharts(allSeeds: Record<string, ChartSeeds>, birthData: BirthData): Promise<ChartInterpretation> {
    const hf = this.getHF();

    const chartSummary = this.generateChartSummary(allSeeds);
    
    const prompt = `You are an expert consciousness calibration analyst specializing in the 7-layer semantic framework for human consciousness field activation.

Analyze this multi-layered chart reading and provide deep insights:

${chartSummary}

Birth Data:
- Date: ${birthData.datetime.toISOString()}
- Location: ${birthData.latitude}, ${birthData.longitude}

Provide a comprehensive interpretation focusing on:
1. Overall consciousness signature
2. Dominant energy centers and their interplay
3. Layer-specific insights for each of the 7 consciousness layers
4. Calibration guidance for optimal field activation
5. Key themes and archetypal patterns

Format your response as JSON:
{
  "summary": "overall consciousness signature summary",
  "layerInsights": {
    "BEING": "insights about physical/genetic foundation",
    "MOVEMENT": "insights about temporal movement state",
    "EVOLUTION": "insights about developmental arc",
    "DESIGN": "insights about yearly intentions",
    "SPACE": "insights about emotional cycles",
    "TRANSPERSONAL": "insights about relational field",
    "VOID": "insights about soul purpose"
  },
  "calibrationGuidance": "specific guidance for ERN oscillator calibration",
  "dominantThemes": ["theme1", "theme2", "theme3"],
  "energySignature": "unique consciousness energy signature description"
}`;

    try {
      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      });

      const generated = response.generated_text.trim();
      
      let parsed: ChartInterpretation;
      try {
        const jsonMatch = generated.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        parsed = {
          summary: generated,
          layerInsights: {
            BEING: 'Analysis in progress',
            MOVEMENT: 'Analysis in progress',
            EVOLUTION: 'Analysis in progress',
            DESIGN: 'Analysis in progress',
            SPACE: 'Analysis in progress',
            TRANSPERSONAL: 'Analysis in progress',
            VOID: 'Analysis in progress'
          },
          calibrationGuidance: 'Interpreting consciousness field patterns...',
          dominantThemes: ['Consciousness', 'Field Activation', 'ERN Calibration'],
          energySignature: 'Unique consciousness signature'
        };
      }

      return parsed;
    } catch (error) {
      console.error('HuggingFace interpretation error:', error);
      
      return {
        summary: 'Consciousness field calculated successfully. LLM interpretation temporarily unavailable.',
        layerInsights: this.generateFallbackInsights(allSeeds),
        calibrationGuidance: 'Use merged center activations for ERN oscillator initialization.',
        dominantThemes: this.extractDominantThemes(allSeeds),
        energySignature: this.generateEnergySignature(allSeeds)
      };
    }
  }

  private static generateChartSummary(allSeeds: Record<string, ChartSeeds>): string {
    let summary = '';
    
    Object.entries(allSeeds).forEach(([layer, seeds]) => {
      const activeCenters = Object.entries(seeds.centers)
        .filter(([_, c]) => c.amplitude > 0.5)
        .map(([name, c]) => `${name} (amp: ${c.amplitude.toFixed(2)})`);
      
      summary += `\n${layer} LAYER:\n`;
      summary += `- Element: ${seeds.dominantElement}\n`;
      summary += `- Coherence: ${seeds.coherenceBias.toFixed(2)}\n`;
      summary += `- Active Centers: ${activeCenters.join(', ')}\n`;
      summary += `- Gates Activated: ${seeds.gates.length}\n`;
    });
    
    return summary;
  }

  private static generateFallbackInsights(allSeeds: Record<string, ChartSeeds>): Record<string, string> {
    const insights: Record<string, string> = {};
    
    Object.entries(allSeeds).forEach(([layer, seeds]) => {
      const activeCenters = Object.keys(seeds.centers).filter(c => seeds.centers[c].amplitude > 0.5);
      insights[layer] = `${layer} layer activated with ${activeCenters.length} primary centers. Dominant element: ${seeds.dominantElement}`;
    });
    
    return insights;
  }

  private static extractDominantThemes(allSeeds: Record<string, ChartSeeds>): string[] {
    const elements = Object.values(allSeeds).map(s => s.dominantElement);
    const unique = Array.from(new Set(elements));
    return unique.map(el => `${el}-Element Consciousness`);
  }

  private static generateEnergySignature(allSeeds: Record<string, ChartSeeds>): string {
    const avgCoherence = Object.values(allSeeds).reduce((sum, s) => sum + s.coherenceBias, 0) / 7;
    const totalGates = Object.values(allSeeds).reduce((sum, s) => sum + s.gates.length, 0);
    
    return `Consciousness field with ${totalGates} gate activations, ${avgCoherence.toFixed(2)} coherence rating`;
  }
}
