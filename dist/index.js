var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/chart-calculators.ts
var chart_calculators_exports = {};
__export(chart_calculators_exports, {
  ChartInterpreter: () => ChartInterpreter,
  CompositeChartCalculator: () => CompositeChartCalculator,
  ConsciousnessCalibrator: () => ConsciousnessCalibrator,
  DraconicChartCalculator: () => DraconicChartCalculator,
  LunarReturnCalculator: () => LunarReturnCalculator,
  NatalChartCalculator: () => NatalChartCalculator,
  ProgressedChartCalculator: () => ProgressedChartCalculator,
  SolarReturnCalculator: () => SolarReturnCalculator,
  TransitChartCalculator: () => TransitChartCalculator
});
import Astronomy from "astronomy-engine";
import { HfInference } from "@huggingface/inference";
var GATE_TO_CENTER_MAP, CENTER_FREQUENCIES, EphemerisCalculator, NatalChartCalculator, TransitChartCalculator, ProgressedChartCalculator, SolarReturnCalculator, LunarReturnCalculator, CompositeChartCalculator, DraconicChartCalculator, ConsciousnessCalibrator, ChartInterpreter;
var init_chart_calculators = __esm({
  "server/services/chart-calculators.ts"() {
    "use strict";
    GATE_TO_CENTER_MAP = {
      // Head Center
      64: "Head",
      61: "Head",
      63: "Head",
      // Ajna Center
      47: "Ajna",
      24: "Ajna",
      4: "Ajna",
      17: "Ajna",
      43: "Ajna",
      11: "Ajna",
      // Throat Center
      62: "Throat",
      23: "Throat",
      56: "Throat",
      35: "Throat",
      12: "Throat",
      45: "Throat",
      33: "Throat",
      8: "Throat",
      31: "Throat",
      20: "Throat",
      16: "Throat",
      // G Center
      7: "G",
      1: "G",
      13: "G",
      10: "G",
      15: "G",
      46: "G",
      25: "G",
      2: "G",
      // Heart/Ego Center
      51: "Heart/Ego",
      21: "Heart/Ego",
      40: "Heart/Ego",
      26: "Heart/Ego",
      // Solar Plexus Center
      6: "Solar Plexus",
      37: "Solar Plexus",
      22: "Solar Plexus",
      36: "Solar Plexus",
      30: "Solar Plexus",
      55: "Solar Plexus",
      49: "Solar Plexus",
      // Sacral Center
      5: "Sacral",
      14: "Sacral",
      29: "Sacral",
      59: "Sacral",
      9: "Sacral",
      3: "Sacral",
      42: "Sacral",
      27: "Sacral",
      34: "Sacral",
      // Spleen Center
      48: "Spleen",
      57: "Spleen",
      44: "Spleen",
      50: "Spleen",
      32: "Spleen",
      28: "Spleen",
      18: "Spleen",
      // Root Center
      58: "Root",
      38: "Root",
      54: "Root",
      53: "Root",
      60: "Root",
      52: "Root",
      19: "Root",
      39: "Root",
      41: "Root"
    };
    CENTER_FREQUENCIES = {
      "Head": 1.33,
      "Ajna": 1.33,
      "Throat": 1.33,
      "G": 3.33,
      "Heart/Ego": 3.33,
      "Solar Plexus": 3.33,
      "Sacral": 1,
      "Spleen": 1,
      "Root": 1
    };
    EphemerisCalculator = class {
      /**
       * Calculate planetary positions using Astronomy Engine
       */
      static calculatePositions(datetime, latitude, longitude) {
        const astroTime = Astronomy.MakeTime(datetime);
        const positions = [];
        const sunEcliptic = Astronomy.SunPosition(astroTime);
        positions.push({
          planet: "Sun",
          longitude: sunEcliptic.elon,
          latitude: sunEcliptic.elat,
          speed: 1
        });
        const moonEcliptic = Astronomy.Ecliptic(Astronomy.GeoMoon(astroTime));
        positions.push({
          planet: "Moon",
          longitude: moonEcliptic.elon,
          latitude: moonEcliptic.elat,
          speed: 13
        });
        const planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
        const speeds = [1.6, 1.2, 0.5, 0.08, 0.03, 0.01, 6e-3, 4e-3];
        planets.forEach((planet, idx) => {
          const bodyCode = planet;
          const geoVector = Astronomy.GeoVector(bodyCode, astroTime, false);
          const ecliptic = Astronomy.Ecliptic(geoVector);
          positions.push({
            planet,
            longitude: ecliptic.elon,
            latitude: ecliptic.elat,
            speed: speeds[idx]
          });
        });
        const moonNode = this.calculateMoonNode(astroTime);
        positions.push({
          planet: "NorthNode",
          longitude: moonNode,
          latitude: 0,
          speed: -0.05
        });
        positions.push({
          planet: "SouthNode",
          longitude: (moonNode + 180) % 360,
          latitude: 0,
          speed: -0.05
        });
        positions.push({
          planet: "Earth",
          longitude: (sunEcliptic.elon + 180) % 360,
          latitude: 0,
          speed: 1
        });
        return positions;
      }
      static calculateMoonNode(astroTime) {
        const j2000 = Astronomy.MakeTime(/* @__PURE__ */ new Date("2000-01-01T12:00:00Z"));
        const daysSinceJ2000 = astroTime.ut - j2000.ut;
        const nodePosition = (125.04 - 0.0529539 * daysSinceJ2000) % 360;
        return nodePosition < 0 ? nodePosition + 360 : nodePosition;
      }
      static longitudeToGate(longitude) {
        const gateNumber = Math.floor(longitude / 5.625) + 1;
        const gatePosition = longitude % 5.625 / 5.625;
        const line = Math.floor(gatePosition * 6) + 1;
        const linePosition = gatePosition * 6 % 1;
        const color = Math.floor(linePosition * 6) + 1;
        const colorPosition = linePosition * 6 % 1;
        const tone = Math.floor(colorPosition * 6) + 1;
        const tonePosition = colorPosition * 6 % 1;
        const base = Math.floor(tonePosition * 5) + 1;
        return {
          gate: gateNumber,
          line,
          color,
          tone,
          base
        };
      }
    };
    NatalChartCalculator = class {
      /**
       * Calculate natal chart and convert to BEING layer seeds
       * This is the genetic/physical foundation
       */
      static calculate(birthData) {
        const positions = EphemerisCalculator.calculatePositions(
          birthData.datetime,
          birthData.latitude,
          birthData.longitude
        );
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.3,
            // default baseline
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        positions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.15);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "BEING",
          centers: centerActivations,
          gates,
          dominantElement: "C",
          // Carbon (physical structure)
          coherenceBias: 0.5
        };
      }
    };
    TransitChartCalculator = class {
      /**
       * Calculate current transits → MOVEMENT layer
       * This is the current temporal state
       */
      static calculate(currentTime, natalData) {
        const positions = EphemerisCalculator.calculatePositions(
          currentTime,
          natalData.latitude,
          natalData.longitude
        );
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.2,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        positions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.1);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "MOVEMENT",
          centers: centerActivations,
          gates,
          dominantElement: "H",
          // Hydrogen (movement/energy)
          coherenceBias: 0.4
        };
      }
    };
    ProgressedChartCalculator = class {
      /**
       * Calculate progressed chart (1 day = 1 year) → EVOLUTION layer
       * This is the developmental arc
       */
      static calculate(birthData, currentAge) {
        const progressedDate = new Date(birthData.datetime);
        progressedDate.setDate(progressedDate.getDate() + currentAge);
        const positions = EphemerisCalculator.calculatePositions(
          progressedDate,
          birthData.latitude,
          birthData.longitude
        );
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.25,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        positions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.12);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "EVOLUTION",
          centers: centerActivations,
          gates,
          dominantElement: "N",
          // Nitrogen (transformation/breath)
          coherenceBias: 0.6
        };
      }
    };
    SolarReturnCalculator = class {
      /**
       * Calculate solar return (Sun returns to natal position) → DESIGN layer
       * This is yearly intentions/themes
       */
      static calculate(birthData, year) {
        const solarReturnDate = new Date(year, birthData.datetime.getMonth(), birthData.datetime.getDate());
        const positions = EphemerisCalculator.calculatePositions(
          solarReturnDate,
          birthData.latitude,
          birthData.longitude
        );
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.35,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        positions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.13);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "DESIGN",
          centers: centerActivations,
          gates,
          dominantElement: "O",
          // Oxygen (breath/intention)
          coherenceBias: 0.7
        };
      }
    };
    LunarReturnCalculator = class {
      /**
       * Calculate lunar return (Moon returns to natal position) → SPACE layer
       * This is monthly emotional cycles
       */
      static calculate(birthData, date) {
        const lunarReturnDate = date;
        const positions = EphemerisCalculator.calculatePositions(
          lunarReturnDate,
          birthData.latitude,
          birthData.longitude
        );
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.3,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        positions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.14);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "SPACE",
          centers: centerActivations,
          gates,
          dominantElement: "O",
          // Oxygen (emotional waves)
          coherenceBias: 0.55
        };
      }
    };
    CompositeChartCalculator = class {
      /**
       * Calculate composite chart (midpoint between two charts) → TRANSPERSONAL layer
       * This is relational field/connection
       */
      static calculate(person1, person2) {
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
        const compositePositions = [];
        for (let i = 0; i < positions1.length; i++) {
          const midLongitude = (positions1[i].longitude + positions2[i].longitude) / 2;
          compositePositions.push({
            planet: positions1[i].planet,
            longitude: midLongitude,
            latitude: 0,
            speed: (positions1[i].speed + positions2[i].speed) / 2
          });
        }
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.4,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        compositePositions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.15);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "TRANSPERSONAL",
          centers: centerActivations,
          gates,
          dominantElement: "S",
          // Sulfur (connection/bridge)
          coherenceBias: 0.8
        };
      }
    };
    DraconicChartCalculator = class {
      /**
       * Calculate draconic chart (North Node at 0° Aries) → VOID layer
       * This is soul purpose/karmic template
       */
      static calculate(birthData) {
        const positions = EphemerisCalculator.calculatePositions(
          birthData.datetime,
          birthData.latitude,
          birthData.longitude
        );
        const northNode = positions.find((p) => p.planet === "NorthNode");
        const nodeOffset = northNode ? northNode.longitude : 0;
        const draconicPositions = positions.map((pos) => ({
          ...pos,
          longitude: (pos.longitude - nodeOffset + 360) % 360
        }));
        const gates = [];
        const centerActivations = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          centerActivations[center] = {
            center,
            phase: 0,
            amplitude: 0.2,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        draconicPositions.forEach((pos) => {
          const gateActivation = EphemerisCalculator.longitudeToGate(pos.longitude);
          gates.push(gateActivation);
          const center = GATE_TO_CENTER_MAP[gateActivation.gate];
          if (center && centerActivations[center]) {
            centerActivations[center].amplitude = Math.min(1, centerActivations[center].amplitude + 0.1);
            centerActivations[center].phase = pos.longitude * Math.PI / 180;
          }
        });
        return {
          layer: "VOID",
          centers: centerActivations,
          gates,
          dominantElement: "H",
          // Hydrogen (primordial essence)
          coherenceBias: 0.3
        };
      }
    };
    ConsciousnessCalibrator = class {
      /**
       * Calculate all 7 charts and merge into complete field seeding matrix
       */
      static calibrateAll(birthData, currentTime) {
        const now = currentTime || /* @__PURE__ */ new Date();
        const age = this.calculateAge(birthData.datetime, now);
        const currentYear = now.getFullYear();
        return {
          BEING: NatalChartCalculator.calculate(birthData),
          MOVEMENT: TransitChartCalculator.calculate(now, birthData),
          EVOLUTION: ProgressedChartCalculator.calculate(birthData, age),
          DESIGN: SolarReturnCalculator.calculate(birthData, currentYear),
          SPACE: LunarReturnCalculator.calculate(birthData, now),
          TRANSPERSONAL: CompositeChartCalculator.calculate(birthData, birthData),
          // self-composite for now
          VOID: DraconicChartCalculator.calculate(birthData)
        };
      }
      static calculateAge(birthDate, currentDate) {
        const diff = currentDate.getTime() - birthDate.getTime();
        return Math.floor(diff / (1e3 * 60 * 60 * 24 * 365.25));
      }
      /**
       * Merge all layer seeds into unified oscillator initialization
       */
      static mergeSeeds(allSeeds) {
        const merged = {};
        Object.keys(CENTER_FREQUENCIES).forEach((center) => {
          merged[center] = {
            center,
            phase: 0,
            amplitude: 0,
            frequency: CENTER_FREQUENCIES[center]
          };
        });
        const weights = {
          BEING: 0.3,
          // 30% from natal
          MOVEMENT: 0.2,
          // 20% from transits
          EVOLUTION: 0.15,
          // 15% from progressed
          DESIGN: 0.15,
          // 15% from solar return
          SPACE: 0.1,
          // 10% from lunar return
          TRANSPERSONAL: 0.05,
          // 5% from composite
          VOID: 0.05
          // 5% from draconic
        };
        Object.entries(allSeeds).forEach(([layer, seeds]) => {
          const weight = weights[layer];
          Object.entries(seeds.centers).forEach(([centerName, activation]) => {
            if (merged[centerName]) {
              merged[centerName].amplitude += activation.amplitude * weight;
              merged[centerName].phase += activation.phase * weight;
            }
          });
        });
        Object.values(merged).forEach((center) => {
          center.amplitude = Math.min(1, center.amplitude);
          center.phase = center.phase % (2 * Math.PI);
        });
        return merged;
      }
    };
    ChartInterpreter = class {
      static hf = null;
      static getHF() {
        if (!this.hf) {
          const apiKey = process.env.HUGGINGFACE_API_KEY;
          if (!apiKey) {
            throw new Error("HuggingFace API key not configured. Set HUGGINGFACE_API_KEY environment variable.");
          }
          this.hf = new HfInference(apiKey);
        }
        return this.hf;
      }
      /**
       * Interpret all 7 charts using HuggingFace LLM
       */
      static async interpretCharts(allSeeds, birthData) {
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
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            inputs: prompt,
            parameters: {
              max_new_tokens: 1500,
              temperature: 0.7,
              top_p: 0.95,
              return_full_text: false
            }
          });
          const generated = response.generated_text.trim();
          let parsed;
          try {
            const jsonMatch = generated.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("No JSON found in response");
            }
          } catch (parseError) {
            parsed = {
              summary: generated,
              layerInsights: {
                BEING: "Analysis in progress",
                MOVEMENT: "Analysis in progress",
                EVOLUTION: "Analysis in progress",
                DESIGN: "Analysis in progress",
                SPACE: "Analysis in progress",
                TRANSPERSONAL: "Analysis in progress",
                VOID: "Analysis in progress"
              },
              calibrationGuidance: "Interpreting consciousness field patterns...",
              dominantThemes: ["Consciousness", "Field Activation", "ERN Calibration"],
              energySignature: "Unique consciousness signature"
            };
          }
          return parsed;
        } catch (error) {
          console.error("HuggingFace interpretation error:", error);
          return {
            summary: "Consciousness field calculated successfully. LLM interpretation temporarily unavailable.",
            layerInsights: this.generateFallbackInsights(allSeeds),
            calibrationGuidance: "Use merged center activations for ERN oscillator initialization.",
            dominantThemes: this.extractDominantThemes(allSeeds),
            energySignature: this.generateEnergySignature(allSeeds)
          };
        }
      }
      static generateChartSummary(allSeeds) {
        let summary = "";
        Object.entries(allSeeds).forEach(([layer, seeds]) => {
          const activeCenters = Object.entries(seeds.centers).filter(([_, c]) => c.amplitude > 0.5).map(([name, c]) => `${name} (amp: ${c.amplitude.toFixed(2)})`);
          summary += `
${layer} LAYER:
`;
          summary += `- Element: ${seeds.dominantElement}
`;
          summary += `- Coherence: ${seeds.coherenceBias.toFixed(2)}
`;
          summary += `- Active Centers: ${activeCenters.join(", ")}
`;
          summary += `- Gates Activated: ${seeds.gates.length}
`;
        });
        return summary;
      }
      static generateFallbackInsights(allSeeds) {
        const insights = {};
        Object.entries(allSeeds).forEach(([layer, seeds]) => {
          const activeCenters = Object.keys(seeds.centers).filter((c) => seeds.centers[c].amplitude > 0.5);
          insights[layer] = `${layer} layer activated with ${activeCenters.length} primary centers. Dominant element: ${seeds.dominantElement}`;
        });
        return insights;
      }
      static extractDominantThemes(allSeeds) {
        const elements = Object.values(allSeeds).map((s) => s.dominantElement);
        const unique = Array.from(new Set(elements));
        return unique.map((el) => `${el}-Element Consciousness`);
      }
      static generateEnergySignature(allSeeds) {
        const avgCoherence = Object.values(allSeeds).reduce((sum, s) => sum + s.coherenceBias, 0) / 7;
        const totalGates = Object.values(allSeeds).reduce((sum, s) => sum + s.gates.length, 0);
        return `Consciousness field with ${totalGates} gate activations, ${avgCoherence.toFixed(2)} coherence rating`;
      }
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  tokenLedgers;
  ideonSeeds;
  worldManifestations;
  zips;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.tokenLedgers = /* @__PURE__ */ new Map();
    this.ideonSeeds = /* @__PURE__ */ new Map();
    this.worldManifestations = /* @__PURE__ */ new Map();
    this.zips = /* @__PURE__ */ new Map();
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Token ledger methods
  async getTokenLedger(userId, month) {
    return Array.from(this.tokenLedgers.values()).find(
      (ledger) => ledger.userId === userId && ledger.month === month
    );
  }
  async createTokenLedger(insertLedger) {
    const id = randomUUID();
    const ledger = {
      ...insertLedger,
      id,
      tokensRemaining: insertLedger.tokensRemaining ?? 5,
      tokensUsed: insertLedger.tokensUsed ?? 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.tokenLedgers.set(id, ledger);
    return ledger;
  }
  async updateTokenLedger(id, updates) {
    const ledger = this.tokenLedgers.get(id);
    if (!ledger) return void 0;
    const updated = { ...ledger, ...updates };
    this.tokenLedgers.set(id, updated);
    return updated;
  }
  async decrementToken(userId, month) {
    let ledger = await this.getTokenLedger(userId, month);
    if (!ledger) {
      ledger = await this.createTokenLedger({
        userId,
        month,
        tokensRemaining: 5,
        tokensUsed: 0
      });
    }
    if (ledger.tokensRemaining <= 0) {
      return false;
    }
    await this.updateTokenLedger(ledger.id, {
      tokensRemaining: ledger.tokensRemaining - 1,
      tokensUsed: ledger.tokensUsed + 1
    });
    return true;
  }
  // Ideon seed methods
  async getIdeonSeed(id) {
    return this.ideonSeeds.get(id);
  }
  async getIdeonSeedsByUser(userId) {
    return Array.from(this.ideonSeeds.values()).filter((seed) => seed.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createIdeonSeed(insertSeed) {
    const id = randomUUID();
    const seed = {
      ...insertSeed,
      id,
      status: insertSeed.status ?? "pending",
      movement: insertSeed.movement ?? null,
      evolution: insertSeed.evolution ?? null,
      being: insertSeed.being ?? null,
      design: insertSeed.design ?? null,
      space: insertSeed.space ?? null,
      transpersonal: insertSeed.transpersonal ?? null,
      void: insertSeed.void ?? null,
      symbolicStructure: insertSeed.symbolicStructure ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null
    };
    this.ideonSeeds.set(id, seed);
    return seed;
  }
  async updateIdeonSeed(id, updates) {
    const seed = this.ideonSeeds.get(id);
    if (!seed) return void 0;
    const updated = { ...seed, ...updates };
    this.ideonSeeds.set(id, updated);
    return updated;
  }
  // World manifestation methods
  async getWorldManifestation(id) {
    return this.worldManifestations.get(id);
  }
  async getWorldManifestationByIdeonId(ideonSeedId) {
    return Array.from(this.worldManifestations.values()).find(
      (manifestation) => manifestation.ideonSeedId === ideonSeedId
    );
  }
  async createWorldManifestation(insertManifestation) {
    const id = randomUUID();
    const manifestation = {
      ...insertManifestation,
      id,
      narrative: insertManifestation.narrative ?? null,
      worldAttributes: insertManifestation.worldAttributes ?? null,
      semanticGanResult: insertManifestation.semanticGanResult ?? null,
      videoGanResult: insertManifestation.videoGanResult ?? null,
      coherenceScore: insertManifestation.coherenceScore ?? null,
      resonanceScore: insertManifestation.resonanceScore ?? null,
      beautyScore: insertManifestation.beautyScore ?? null,
      reflectionNotes: insertManifestation.reflectionNotes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.worldManifestations.set(id, manifestation);
    return manifestation;
  }
  // ZIP archive methods
  async getZip(id) {
    return this.zips.get(id);
  }
  async getAllZips() {
    return Array.from(this.zips.values()).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }
  async createZip(zip) {
    const id = randomUUID();
    const storedZip = {
      ...zip,
      id
    };
    this.zips.set(id, storedZip);
    return storedZip;
  }
  async deleteZip(id) {
    return this.zips.delete(id);
  }
  async getZipFileContent(zipId, filePath) {
    const zip = this.zips.get(zipId);
    if (!zip) {
      throw new Error("ZIP not found");
    }
    const entry = zip.structure.entries.find((e) => e.path === filePath && e.type === "file");
    if (!entry) {
      throw new Error("File not found in ZIP");
    }
    return `<!-- File: ${filePath} from ${zip.originalName} -->
<p>File content would be loaded from ZIP archive</p>`;
  }
  async mergeZips(zipIds, conflictResolutions) {
    const zips = zipIds.map((id) => this.zips.get(id)).filter((z2) => z2 !== void 0);
    if (zips.length < 2) {
      throw new Error("Need at least 2 ZIPs to merge");
    }
    const mergedEntries = /* @__PURE__ */ new Map();
    let totalSize = 0;
    let fileCount = 0;
    let directoryCount = 0;
    for (const zip of zips) {
      for (const entry of zip.structure.entries) {
        const path3 = entry.path;
        if (mergedEntries.has(path3)) {
          const resolution = conflictResolutions[path3] || "last";
          if (resolution === "last") {
            mergedEntries.set(path3, entry);
          } else if (resolution === "rename") {
            const newPath = `${path3}.${zip.id.slice(0, 8)}`;
            mergedEntries.set(newPath, { ...entry, path: newPath });
          }
        } else {
          mergedEntries.set(path3, entry);
        }
        if (entry.type === "file") {
          fileCount++;
          totalSize += entry.size || 0;
        } else {
          directoryCount++;
        }
      }
    }
    const mergedZip = await this.createZip({
      filename: `merged_${Date.now()}.zip`,
      originalName: `Merged Archive (${zips.length} files)`,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      size: totalSize,
      objectPath: `merged/${randomUUID()}`,
      structure: {
        entries: Array.from(mergedEntries.values()),
        totalSize,
        fileCount,
        directoryCount
      },
      analysis: {
        description: `Merged from ${zips.length} archives`,
        projectType: "merged",
        technologies: [],
        confidence: 0.5
      }
    });
    return { id: mergedZip.id, fileCount };
  }
};
var storage = new MemStorage();

// server/lib/googleDriveService.ts
import { google } from "googleapis";
var connectionSettings;
async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  const response = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connection_names=google-drive",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  );
  const data = await response.json();
  connectionSettings = data.items?.[0];
  if (!connectionSettings) {
    throw new Error("Google Drive not connected");
  }
  const accessToken = connectionSettings.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!accessToken) {
    throw new Error("Google Drive not connected");
  }
  return accessToken;
}
async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}
async function uploadProjectToGoogleDrive(projectName, files) {
  const drive = await getUncachableGoogleDriveClient();
  const folderMetadata = {
    name: projectName,
    mimeType: "application/vnd.google-apps.folder"
  };
  const folderResponse = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id, name, webViewLink"
  });
  const rootFolderId = folderResponse.data.id;
  const folderCache = /* @__PURE__ */ new Map();
  folderCache.set("", rootFolderId);
  async function ensureFolder(path3) {
    if (folderCache.has(path3)) {
      return folderCache.get(path3);
    }
    const parts = path3.split("/");
    let currentPath = "";
    let parentId = rootFolderId;
    for (const part of parts) {
      if (!part) continue;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (folderCache.has(currentPath)) {
        parentId = folderCache.get(currentPath);
      } else {
        const folderMetadata2 = {
          name: part,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentId]
        };
        const response = await drive.files.create({
          requestBody: folderMetadata2,
          fields: "id"
        });
        parentId = response.data.id;
        folderCache.set(currentPath, parentId);
      }
    }
    return parentId;
  }
  const uploadedFiles = [];
  for (const file of files) {
    const pathParts = file.path.split("/");
    const fileName = pathParts.pop() || file.path;
    const dirPath = pathParts.join("/");
    const parentFolderId = await ensureFolder(dirPath);
    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId]
    };
    const media = {
      mimeType: "text/plain",
      body: file.content || ""
      // Include empty files
    };
    const fileResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, webViewLink"
    });
    uploadedFiles.push(fileResponse.data);
  }
  return {
    folder: folderResponse.data,
    files: uploadedFiles
  };
}

// server/lib/githubService.ts
async function getGitHubAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found");
  }
  const response = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connection_names=github",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  );
  const data = await response.json();
  const connection = data.items?.[0];
  if (!connection) {
    throw new Error("GitHub not connected");
  }
  return connection.settings.access_token;
}
async function createOrUpdateGitHubRepo(repoName, files, description = "Created from YOU\u2013N\u2013I\u2013VERSE Studio") {
  const token = await getGitHubAccessToken();
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });
  const user = await userResponse.json();
  const username = user.login;
  const repoCheckResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });
  let repoUrl;
  if (repoCheckResponse.status === 404) {
    const createResponse = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: false,
        auto_init: true
      })
    });
    const repo = await createResponse.json();
    repoUrl = repo.html_url;
  } else {
    const repo = await repoCheckResponse.json();
    repoUrl = repo.html_url;
  }
  for (const file of files) {
    const contentBase64 = Buffer.from(file.content).toString("base64");
    const fileCheckResponse = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );
    let sha;
    if (fileCheckResponse.status === 200) {
      const existingFile = await fileCheckResponse.json();
      sha = existingFile.sha;
    }
    await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update ${file.path} from YOU\u2013N\u2013I\u2013VERSE Studio`,
          content: contentBase64,
          sha
        })
      }
    );
  }
  return {
    url: repoUrl,
    username,
    repoName
  };
}

// server/lib/githubImportService.ts
async function importGitHubRepo(repoUrl) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
    if (!match) {
      throw new Error("Invalid GitHub URL format");
    }
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, "");
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/zipball`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "YOU-N-I-VERSE IDE",
        "Accept": "application/vnd.github.v3+json"
      },
      redirect: "follow"
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    const zipBuffer = await response.arrayBuffer();
    return {
      success: true,
      repoName,
      owner,
      zipData: Buffer.from(zipBuffer),
      url: repoUrl
    };
  } catch (error) {
    console.error("GitHub import error:", error);
    throw new Error(error.message || "Failed to import repository");
  }
}

// server/lib/netlifyService.ts
async function deployToNetlify(apiKey, files, siteName) {
  try {
    let siteId;
    if (siteName) {
      const sitesResponse = await fetch("https://api.netlify.com/api/v1/sites", {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      const sites = await sitesResponse.json();
      const existingSite = sites.find(
        (site) => site.name === siteName || site.custom_domain === `${siteName}.netlify.app`
      );
      if (existingSite) {
        siteId = existingSite.id;
      } else {
        const createResponse = await fetch("https://api.netlify.com/api/v1/sites", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: siteName
          })
        });
        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.message || "Failed to create site");
        }
        const site = await createResponse.json();
        siteId = site.id;
      }
    } else {
      const createResponse = await fetch("https://api.netlify.com/api/v1/sites", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || "Failed to create site");
      }
      const site = await createResponse.json();
      siteId = site.id;
    }
    const crypto = await import("crypto");
    const fileDigest = {};
    for (const file of files) {
      if (file.content === void 0 || file.content === null || typeof file.content !== "string") {
        console.warn(`Skipping file ${file.path} - no valid content`);
        continue;
      }
      const hash = crypto.createHash("sha1").update(file.content).digest("hex");
      fileDigest[file.path] = hash;
    }
    const deployResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ files: fileDigest })
      }
    );
    if (!deployResponse.ok) {
      const error = await deployResponse.json();
      throw new Error(error.message || "Failed to create deploy");
    }
    const deploy = await deployResponse.json();
    const deployId = deploy.id;
    const requiredFiles = deploy.required || [];
    for (const sha of requiredFiles) {
      const filePath = Object.keys(fileDigest).find(
        (path3) => fileDigest[path3] === sha
      );
      if (!filePath) continue;
      const file = files.find((f) => f.path === filePath);
      if (!file) continue;
      const uploadResponse = await fetch(
        `https://api.netlify.com/api/v1/deploys/${deployId}/files/${encodeURIComponent(filePath)}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/octet-stream"
          },
          body: file.content
        }
      );
      if (!uploadResponse.ok) {
        console.error(`Failed to upload ${filePath}`);
      }
    }
    let deployStatus = deploy.state;
    let attempts = 0;
    const maxAttempts = 60;
    while (deployStatus !== "ready" && deployStatus !== "error" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const statusResponse = await fetch(
        `https://api.netlify.com/api/v1/deploys/${deployId}`,
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`
          }
        }
      );
      const statusData = await statusResponse.json();
      deployStatus = statusData.state;
      attempts++;
    }
    if (deployStatus === "error") {
      throw new Error("Deployment failed");
    }
    return {
      url: deploy.ssl_url || deploy.url,
      deployId: deploy.id,
      siteId,
      status: deployStatus
    };
  } catch (error) {
    console.error("Netlify deployment error:", error);
    throw new Error(error.message || "Failed to deploy to Netlify");
  }
}

// server/services/symbolic-parser.ts
var SYMBOLIC_MEANINGS = {
  "\u2022": "individuality/movement",
  ".": "completion/being",
  "\xB0": "elevation/transpersonal",
  ":": "relationship/design",
  ";": "evolution/connection",
  ",": "space/separation",
  "...": "void/potential",
  "\u2026": "void/potential",
  "!": "assertion/energy",
  "?": "inquiry/unknown",
  "-": "transition/bridge",
  "\u2014": "transition/bridge"
};
function parseSymbolicStructure(text) {
  const operators = [];
  for (const [symbol, semanticHint] of Object.entries(SYMBOLIC_MEANINGS)) {
    let index = 0;
    while ((index = text.indexOf(symbol, index)) !== -1) {
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + symbol.length + 20);
      const context = text.slice(start, end).trim();
      operators.push({
        symbol,
        position: index,
        context,
        semanticHint
      });
      index += symbol.length;
    }
  }
  operators.sort((a, b) => a.position - b.position);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const phrases = text.split(/[,;:—\-]+/).map((p) => p.trim()).filter((p) => p.length > 0);
  const complexity = calculateComplexity(text, operators);
  const density = operators.length / text.length * 100;
  const pattern = operators.map((op) => op.symbol).join("");
  return {
    operators,
    sentences,
    phrases,
    rhythm: {
      complexity,
      density,
      pattern
    }
  };
}
function calculateComplexity(text, operators) {
  if (operators.length === 0) return 0;
  const uniqueSymbols = new Set(operators.map((op) => op.symbol));
  const varietyScore = Math.min(uniqueSymbols.size / 7, 1);
  const textLength = text.length;
  const positions = operators.map((op) => op.position / textLength);
  const avgGap = positions.length > 1 ? positions.slice(1).reduce((sum, pos, i) => sum + Math.abs(pos - positions[i]), 0) / (positions.length - 1) : 0.5;
  const distributionScore = avgGap;
  return varietyScore * 0.6 + distributionScore * 0.4;
}
function extractSemanticHints(structure) {
  const layerCounts = {
    movement: 0,
    evolution: 0,
    being: 0,
    design: 0,
    space: 0,
    transpersonal: 0,
    void: 0
  };
  for (const op of structure.operators) {
    if (op.semanticHint.includes("individuality/movement")) layerCounts.movement++;
    if (op.semanticHint.includes("evolution/connection")) layerCounts.evolution++;
    if (op.semanticHint.includes("completion/being")) layerCounts.being++;
    if (op.semanticHint.includes("relationship/design")) layerCounts.design++;
    if (op.semanticHint.includes("space/separation")) layerCounts.space++;
    if (op.semanticHint.includes("elevation/transpersonal")) layerCounts.transpersonal++;
    if (op.semanticHint.includes("void/potential")) layerCounts.void++;
  }
  const primaryLayers = Object.entries(layerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([layer]) => layer);
  const suggestions = `Text shows ${structure.rhythm.complexity > 0.5 ? "high" : "moderate"} symbolic complexity. Emphasis on: ${primaryLayers.join(", ")}. Pattern: ${structure.rhythm.pattern.slice(0, 20)}${structure.rhythm.pattern.length > 20 ? "..." : ""}`;
  return {
    primaryLayers,
    suggestions
  };
}

// server/services/llm-observer.ts
import OpenAI from "openai";
var openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 3e4
      // 30 second timeout
    });
  }
  return openai;
}
async function observeIdeon(rawText, symbolicStructure) {
  const systemPrompt = `You are the LLM Observer for Ideogenesis, a meta-creative system that transforms text into playable worlds.

Your task is to interpret player ideas through a 7-layer semantic framework based on Yi Jing and Human Design:

1. MOVEMENT (Individuality) - "I Define" - Activity, Uniqueness, Personal Expression
2. EVOLUTION (Mind) - "I Remember" - Character, Role, Historical Context
3. BEING (Body) - "I Am" - Biology, Genetics, Physical Presence
4. DESIGN (Ego) - "I Design" - Growth, Self-Development, Intentionality
5. SPACE (Personality) - "I Think" - Type, Presence, Positioning
6. TRANSPERSONAL (Archetypal) - Collective patterns, mythic resonance
7. VOID (Pure Potential) - The unformed, noise vectors, latent possibilities

For each layer, extract:
- interpretation: What this layer reveals about the world
- symbols: Key symbolic elements from this layer
- qualities: Attributes or characteristics

Also generate:
- narrative: A cohesive story/description of the world
- worldAttributes: tone, mood, physicalRules (array), visualStyle
- reflectionNotes: Your meta-observations about the interpretation process

Respond with JSON matching the ParsedSemantics structure.`;
  const userPrompt = `Interpret this player idea through the 7-layer semantic framework:

TEXT: "${rawText}"

SYMBOLIC STRUCTURE: ${JSON.stringify(symbolicStructure, null, 2)}

Parse each semantic layer and generate a world manifestation.`;
  try {
    console.log("[LLM Observer] Calling OpenAI API with model gpt-4o...");
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096
    });
    console.log("[LLM Observer] Received response from OpenAI");
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return parsed;
  } catch (error) {
    console.error("[LLM Observer] Error:", error);
    throw new Error(`LLM Observer failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function evaluateWorld(narrative, worldAttributes) {
  const prompt = `Evaluate this generated world on three dimensions (0-100):

NARRATIVE: ${narrative}

ATTRIBUTES: ${JSON.stringify(worldAttributes)}

Rate:
1. coherenceScore: How internally consistent and logical is this world?
2. resonanceScore: How emotionally/aesthetically compelling is it?
3. beautyScore: How elegant and harmonious is the overall design?

Respond with JSON: { "coherenceScore": number, "resonanceScore": number, "beautyScore": number }`;
  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 256
    });
    const scores = JSON.parse(response.choices[0].message.content || "{}");
    return {
      coherenceScore: Math.max(0, Math.min(100, Math.round(scores.coherenceScore || 50))),
      resonanceScore: Math.max(0, Math.min(100, Math.round(scores.resonanceScore || 50))),
      beautyScore: Math.max(0, Math.min(100, Math.round(scores.beautyScore || 50)))
    };
  } catch (error) {
    return { coherenceScore: 50, resonanceScore: 50, beautyScore: 50 };
  }
}

// server/services/gan-integrations.ts
async function generateSemanticVisuals(semanticLayers) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const movement = semanticLayers.movement || {};
  const space = semanticLayers.space || {};
  return {
    imageUrls: [
      `https://placehold.co/1024x1024/000000/FFFFFF/png?text=Semantic+Visual+1`,
      `https://placehold.co/1024x1024/333333/FFFFFF/png?text=Semantic+Visual+2`
    ],
    styleVectors: [
      [Math.random(), Math.random(), Math.random(), Math.random()],
      [Math.random(), Math.random(), Math.random(), Math.random()]
    ],
    visualMetadata: {
      primaryColors: ["#1a1a2e", "#16213e", "#0f3460", "#533483"],
      composition: "layered-abstract",
      textures: ["granular", "flowing", "crystalline"]
    },
    processingTime: 500
  };
}
async function generateTemporalManifestation(semanticLayers, visualData) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    videoUrl: `https://placehold.co/1920x1080/000000/FFFFFF/png?text=World+Animation`,
    animationUrls: [
      `https://placehold.co/800x600/111111/FFFFFF/png?text=Animation+Frame+1`,
      `https://placehold.co/800x600/222222/FFFFFF/png?text=Animation+Frame+2`,
      `https://placehold.co/800x600/333333/FFFFFF/png?text=Animation+Frame+3`
    ],
    temporalData: {
      duration: 30,
      keyframes: [0, 5, 10, 15, 20, 25, 30],
      transitions: ["fade", "morph", "crystallize", "dissolve"]
    },
    processingTime: 800
  };
}
async function generateWorldVisuals(semanticLayers) {
  const semantic = await generateSemanticVisuals(semanticLayers);
  const video = await generateTemporalManifestation(semanticLayers, semantic);
  return { semantic, video };
}
var LAYER_VOICE_PROFILES = {
  BEING: { pitchShift: -3, speed: 0.85, warmth: 0.9, clarity: 0.7 },
  // Deep, grounded
  MOVEMENT: { pitchShift: 2, speed: 1.2, warmth: 0.6, clarity: 0.9 },
  // Bright, quick
  EVOLUTION: { pitchShift: 0, speed: 0.95, warmth: 0.8, clarity: 0.8 },
  // Balanced, wise
  DESIGN: { pitchShift: 1, speed: 1.05, warmth: 0.7, clarity: 0.95 },
  // Clear, intentional
  SPACE: { pitchShift: -1, speed: 0.9, warmth: 0.85, clarity: 0.6 },
  // Soft, spacious
  TRANSPERSONAL: { pitchShift: 3, speed: 0.8, warmth: 0.5, clarity: 0.5 },
  // Ethereal, distant
  VOID: { pitchShift: -6, speed: 0.7, warmth: 0.3, clarity: 0.4 }
  // Deep void, mysterious
};
async function generateConsciousnessVoice(text, layer, useLayerVoice = true) {
  await new Promise((resolve) => setTimeout(resolve, 1e3));
  const voiceProfile = useLayerVoice ? LAYER_VOICE_PROFILES[layer] || LAYER_VOICE_PROFILES.EVOLUTION : LAYER_VOICE_PROFILES.EVOLUTION;
  const waveformData = Array.from({ length: 100 }, () => Math.random() * 2 - 1);
  return {
    audioUrl: `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=`,
    // Minimal WAV stub
    voiceCharacteristics: {
      pitch: 440 * Math.pow(2, voiceProfile.pitchShift / 12),
      tone: layer,
      resonance: voiceProfile.warmth,
      energyLevel: voiceProfile.speed
    },
    waveformData,
    duration: Math.ceil(text.length / 20),
    // ~20 chars per second
    processingTime: 1e3
  };
}
async function generateLayeredConsciousnessVoice(layerInsights) {
  const voices = {};
  const voicePromises = Object.entries(layerInsights).map(async ([layer, text]) => {
    const voice = await generateConsciousnessVoice(text, layer, true);
    return { layer, voice };
  });
  const results = await Promise.all(voicePromises);
  results.forEach(({ layer, voice }) => {
    voices[layer] = voice;
  });
  return voices;
}

// server/services/world-orchestrator.ts
async function orchestrateWorldGeneration(userId, rawText) {
  const startTime = Date.now();
  console.log("[Orchestrator] Starting world generation for user:", userId);
  console.log("[Orchestrator] Step 1: Parsing symbolic structure...");
  const symbolicStructure = parseSymbolicStructure(rawText);
  const semanticHints = extractSemanticHints(symbolicStructure);
  console.log("[Orchestrator] Symbolic parsing complete. Operators found:", symbolicStructure.operators.length);
  const ideonSeed = await storage.createIdeonSeed({
    userId,
    rawText,
    symbolicStructure,
    status: "processing"
  });
  try {
    console.log("[Orchestrator] Step 3: Calling LLM Observer...");
    const parsedSemantics = await observeIdeon(rawText, {
      symbolicStructure,
      semanticHints
    });
    console.log("[Orchestrator] LLM Observer complete");
    const updatedIdeon = await storage.updateIdeonSeed(ideonSeed.id, {
      movement: parsedSemantics.movement,
      evolution: parsedSemantics.evolution,
      being: parsedSemantics.being,
      design: parsedSemantics.design,
      space: parsedSemantics.space,
      transpersonal: parsedSemantics.transpersonal,
      void: parsedSemantics.void,
      status: "processing"
    });
    const { semantic, video } = await generateWorldVisuals({
      movement: parsedSemantics.movement,
      evolution: parsedSemantics.evolution,
      being: parsedSemantics.being,
      design: parsedSemantics.design,
      space: parsedSemantics.space,
      transpersonal: parsedSemantics.transpersonal,
      void: parsedSemantics.void
    });
    const scores = await evaluateWorld(
      parsedSemantics.narrative,
      parsedSemantics.worldAttributes
    );
    const worldManifestation = await storage.createWorldManifestation({
      ideonSeedId: ideonSeed.id,
      narrative: parsedSemantics.narrative,
      worldAttributes: parsedSemantics.worldAttributes,
      semanticGanResult: semantic,
      videoGanResult: video,
      coherenceScore: scores.coherenceScore,
      resonanceScore: scores.resonanceScore,
      beautyScore: scores.beautyScore,
      reflectionNotes: parsedSemantics.reflectionNotes
    });
    await storage.updateIdeonSeed(ideonSeed.id, {
      status: "completed",
      completedAt: /* @__PURE__ */ new Date()
    });
    const processingTime = Date.now() - startTime;
    return {
      ideonSeed: updatedIdeon || ideonSeed,
      worldManifestation,
      processingTime
    };
  } catch (error) {
    await storage.updateIdeonSeed(ideonSeed.id, {
      status: "failed"
    });
    throw new Error(`World generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function checkTokenAvailability(userId) {
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ledger = await storage.getTokenLedger(userId, month);
  if (!ledger) {
    return {
      available: true,
      tokensRemaining: 5,
      month
    };
  }
  return {
    available: ledger.tokensRemaining > 0,
    tokensRemaining: ledger.tokensRemaining,
    month
  };
}
async function consumeToken(userId) {
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return await storage.decrementToken(userId, month);
}

// server/routes.ts
init_chart_calculators();

// server/services/EphemerisService.ts
import * as Astronomy2 from "astronomy-engine";

// shared/transit-system.ts
var FIELD_CHART_MAPPING = {
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
function longitudeToGate(longitude) {
  const normalized = longitude % 360;
  const gateWidth = 360 / 64;
  const lineWidth = gateWidth / 6;
  const gateIndex = Math.floor(normalized / gateWidth);
  const gate = (gateIndex + 1) % 64 || 64;
  const positionInGate = normalized % gateWidth;
  const line = Math.floor(positionInGate / lineWidth) + 1;
  return { gate, line };
}
var PROJECTION_OFFSETS = {
  Sidereal: -23.4,
  // Ayanamsa (approximate, adjust per year)
  Tropical: 0,
  Draconic: 0
  // Uses Moon's North Node as 0° Aries
};

// server/services/EphemerisService.ts
var EphemerisService = class {
  /**
   * Get current planetary positions for all relevant bodies
   */
  async getCurrentPositions(date = /* @__PURE__ */ new Date()) {
    const planets = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto"
    ];
    const positions = [];
    for (const planet of planets) {
      const position = await this.getPlanetPosition(planet, date);
      positions.push(position);
    }
    const northNode = await this.getNorthNodePosition(date);
    positions.push(northNode);
    return positions;
  }
  /**
   * Get position for a single planet
   */
  async getPlanetPosition(planet, date) {
    const bodyMap = {
      "Sun": Astronomy2.Body.Sun,
      "Moon": Astronomy2.Body.Moon,
      "Mercury": Astronomy2.Body.Mercury,
      "Venus": Astronomy2.Body.Venus,
      "Mars": Astronomy2.Body.Mars,
      "Jupiter": Astronomy2.Body.Jupiter,
      "Saturn": Astronomy2.Body.Saturn,
      "Uranus": Astronomy2.Body.Uranus,
      "Neptune": Astronomy2.Body.Neptune,
      "Pluto": Astronomy2.Body.Pluto
    };
    const body = bodyMap[planet];
    const time = Astronomy2.MakeTime(date);
    const vector = Astronomy2.GeoVector(body, time, true);
    const ecliptic = Astronomy2.Ecliptic(vector);
    const longitude = ecliptic.elon;
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTime = Astronomy2.MakeTime(tomorrow);
    const tomorrowVector = Astronomy2.GeoVector(body, tomorrowTime, true);
    const tomorrowEcliptic = Astronomy2.Ecliptic(tomorrowVector);
    const dailyMotion = tomorrowEcliptic.elon - longitude;
    const retrograde = dailyMotion < 0;
    const speed = Math.abs(dailyMotion);
    const { gate, line } = longitudeToGate(longitude);
    return {
      planet,
      longitude,
      gate,
      line,
      speed,
      retrograde
    };
  }
  /**
   * Get Moon's North Node position (True Node)
   */
  async getNorthNodePosition(date) {
    const epoch = /* @__PURE__ */ new Date("2000-01-01");
    const yearsSinceEpoch = (date.getTime() - epoch.getTime()) / (1e3 * 60 * 60 * 24 * 365.25);
    const nodeAt2000 = 125.04;
    const annualMotion = -19.3;
    const longitude = (nodeAt2000 + annualMotion * yearsSinceEpoch) % 360;
    const { gate, line } = longitudeToGate(longitude);
    return {
      planet: "NorthNode",
      longitude: longitude < 0 ? longitude + 360 : longitude,
      gate,
      line,
      speed: Math.abs(annualMotion / 365.25),
      retrograde: true
    };
  }
  /**
   * Apply chart projection (Sidereal, Tropical, Draconic)
   */
  applyProjection(positions, chartType) {
    const offset = PROJECTION_OFFSETS[chartType];
    if (chartType === "Draconic") {
      const nodePosition = positions.find((p) => p.planet === "NorthNode");
      const nodeOffset = nodePosition ? nodePosition.longitude : 0;
      return positions.map((pos) => {
        const adjustedLongitude = (pos.longitude - nodeOffset + 360) % 360;
        const { gate, line } = longitudeToGate(adjustedLongitude);
        return { ...pos, longitude: adjustedLongitude, gate, line };
      });
    }
    return positions.map((pos) => {
      const adjustedLongitude = (pos.longitude + offset + 360) % 360;
      const { gate, line } = longitudeToGate(adjustedLongitude);
      return { ...pos, longitude: adjustedLongitude, gate, line };
    });
  }
  /**
   * Generate all three projections at once
   */
  async getTripleProjection(date = /* @__PURE__ */ new Date()) {
    const basePositions = await this.getCurrentPositions(date);
    return {
      sidereal: {
        chartType: "Sidereal",
        timestamp: date,
        positions: this.applyProjection(basePositions, "Sidereal")
      },
      tropical: {
        chartType: "Tropical",
        timestamp: date,
        positions: this.applyProjection(basePositions, "Tropical")
      },
      draconic: {
        chartType: "Draconic",
        timestamp: date,
        positions: this.applyProjection(basePositions, "Draconic")
      }
    };
  }
};

// shared/gate-mappings.ts
var GATE_ARCHETYPES = [
  { gate: 1, name: "The Creative", element: "Fire", theme: "Self-expression & creativity", keywords: ["innovation", "leadership", "yang"], planetaryAffinity: ["Sun", "Uranus"] },
  { gate: 2, name: "The Receptive", element: "Earth", theme: "Direction & guidance", keywords: ["receptivity", "direction", "yin"], planetaryAffinity: ["Moon", "Earth"] },
  { gate: 3, name: "Difficulty at the Beginning", element: "Water", theme: "Innovation through chaos", keywords: ["mutation", "ordering", "innovation"], planetaryAffinity: ["Mercury", "Uranus"] },
  { gate: 4, name: "Youthful Folly", element: "Water", theme: "Mental clarity & answers", keywords: ["formulation", "logic", "answers"], planetaryAffinity: ["Mercury", "Jupiter"] },
  { gate: 5, name: "Waiting", element: "Water", theme: "Fixed patterns & timing", keywords: ["rhythm", "patience", "consistency"], planetaryAffinity: ["Saturn", "Moon"] },
  // Focus gates (concentration & mental precision)
  { gate: 47, name: "Oppression", element: "Water", theme: "Realization & mental pressure", keywords: ["insight", "understanding", "epiphany"], planetaryAffinity: ["Mercury", "Neptune"] },
  { gate: 62, name: "Preponderance of the Small", element: "Metal", theme: "Detail & precision", keywords: ["details", "organization", "precision"], planetaryAffinity: ["Mercury", "Saturn"] },
  { gate: 63, name: "After Completion", element: "Water", theme: "Doubt & questioning", keywords: ["logic", "questioning", "pressure"], planetaryAffinity: ["Mercury", "Pluto"] },
  // Expression gates (creative flow)
  { gate: 12, name: "Standstill", element: "Earth", theme: "Caution & articulation", keywords: ["expression", "articulation", "mood"], planetaryAffinity: ["Venus", "Mercury"] },
  { gate: 35, name: "Progress", element: "Fire", theme: "Experience & change", keywords: ["experience", "adventure", "change"], planetaryAffinity: ["Sun", "Jupiter"] },
  { gate: 45, name: "Gathering Together", element: "Earth", theme: "The gatherer & educator", keywords: ["community", "teaching", "leadership"], planetaryAffinity: ["Jupiter", "Venus"] },
  // Collaboration gates
  { gate: 8, name: "Holding Together", element: "Water", theme: "Contribution & leadership", keywords: ["contribution", "leadership", "authenticity"], planetaryAffinity: ["Jupiter", "Sun"] },
  { gate: 31, name: "Influence", element: "Earth", theme: "Leadership & influence", keywords: ["influence", "democracy", "leadership"], planetaryAffinity: ["Sun", "Jupiter"] },
  { gate: 33, name: "Retreat", element: "Fire", theme: "Privacy & retreat", keywords: ["privacy", "reflection", "retreat"], planetaryAffinity: ["Saturn", "Moon"] },
  // Introspection gates
  { gate: 28, name: "Preponderance of the Great", element: "Wood", theme: "The game player & risk", keywords: ["risk", "challenge", "purpose"], planetaryAffinity: ["Pluto", "Mars"] },
  { gate: 44, name: "Coming to Meet", element: "Metal", theme: "Alertness & memory", keywords: ["pattern", "memory", "instinct"], planetaryAffinity: ["Saturn", "Moon"] },
  { gate: 50, name: "The Cauldron", element: "Fire", theme: "Values & responsibility", keywords: ["values", "care", "responsibility"], planetaryAffinity: ["Venus", "Saturn"] },
  // Synthesis gates (integration mode)
  { gate: 10, name: "Treading", element: "Fire", theme: "Self-behavior & love", keywords: ["self-love", "behavior", "embodiment"], planetaryAffinity: ["Venus", "Sun"] },
  { gate: 15, name: "Modesty", element: "Earth", theme: "Extremes & rhythm", keywords: ["rhythm", "flow", "moderation"], planetaryAffinity: ["Moon", "Venus"] },
  { gate: 51, name: "The Arousing", element: "Wood", theme: "Shock & initiation", keywords: ["shock", "competition", "initiation"], planetaryAffinity: ["Mars", "Uranus"] },
  // Additional gates (simplified for MVP)
  ...Array.from({ length: 44 }, (_, i) => ({
    gate: i + 20,
    name: `Gate ${i + 20}`,
    element: ["Fire", "Earth", "Metal", "Water", "Wood"][i % 5],
    theme: "Archetypal pattern",
    keywords: ["pattern", "energy", "flow"],
    planetaryAffinity: ["Sun", "Moon"]
  }))
];
function getGateArchetype(gateNumber) {
  return GATE_ARCHETYPES.find((g) => g.gate === gateNumber);
}

// server/services/TransitCache.ts
var TransitCacheService = class {
  ephemeris;
  cache = null;
  updateInterval = null;
  constructor() {
    this.ephemeris = new EphemerisService();
  }
  /**
   * Start the cache update loop (runs hourly)
   */
  start() {
    this.updateTransits();
    this.updateInterval = setInterval(() => {
      this.updateTransits();
    }, 60 * 60 * 1e3);
    console.log("\u{1F4E1} Transit Cache Service started (updating hourly)");
  }
  /**
   * Stop the cache update loop
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  /**
   * Update the transit cache with current planetary positions
   */
  async updateTransits() {
    try {
      const now = /* @__PURE__ */ new Date();
      const projections = await this.ephemeris.getTripleProjection(now);
      this.cache = {
        timestamp: now,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1e3),
        // 1 hour
        projections
      };
      console.log(`\u2728 Transit cache updated at ${now.toISOString()}`);
    } catch (error) {
      console.error("\u274C Failed to update transit cache:", error);
    }
  }
  /**
   * Get current cached transits
   */
  getCurrentTransits() {
    if (!this.cache) {
      console.warn("\u26A0\uFE0F Transit cache not initialized");
      return null;
    }
    if (/* @__PURE__ */ new Date() > this.cache.expiresAt) {
      console.warn("\u26A0\uFE0F Transit cache expired, updating...");
      this.updateTransits();
    }
    return this.cache;
  }
  /**
   * Compute field vectors for a user based on current transits
   */
  getFieldVectors(userChart) {
    const transits = this.getCurrentTransits();
    if (!transits) {
      return [];
    }
    const fields = [
      "Mind",
      "Ajna",
      "ThroatExpression",
      "SolarIdentity",
      "Will",
      "SacralLife",
      "Emotions",
      "Instinct",
      "Root"
    ];
    return fields.map((field) => this.computeFieldVector(field, userChart, transits));
  }
  /**
   * Compute activation vector for a single field
   */
  computeFieldVector(field, userChart, transits) {
    const chartType = userChart.fieldAssignments[field]?.chartType || FIELD_CHART_MAPPING[field];
    const projection = transits.projections[chartType.toLowerCase()];
    const activeGates = projection.positions.map((p) => p.gate);
    const uniqueGates = Array.from(new Set(activeGates));
    const sensitiveGates = userChart.fieldAssignments[field]?.sensitiveGates || [];
    const activatedSensitiveGates = uniqueGates.filter((g) => sensitiveGates.includes(g));
    const transitPressure = activatedSensitiveGates.length > 0 ? Math.min(1, activatedSensitiveGates.length / 5) : Math.min(0.5, uniqueGates.length / 10);
    const historicalResonance = userChart.resonanceHistory[field] || 0.5;
    const weight = transitPressure * historicalResonance;
    const dominantPlanets = projection.positions.filter((p) => activatedSensitiveGates.includes(p.gate)).map((p) => p.planet);
    return {
      field,
      chartType,
      activeGates: uniqueGates,
      transitPressure,
      historicalResonance,
      weight,
      dominantPlanets
    };
  }
  /**
   * Get a textual summary of current transits
   */
  getTransitSummary() {
    const transits = this.getCurrentTransits();
    if (!transits) {
      return "Transit data unavailable";
    }
    const tropical = transits.projections.tropical;
    const lines = [
      `\u{1F30C} Current Transits (${transits.timestamp.toLocaleString()})`,
      ""
    ];
    tropical.positions.forEach((pos) => {
      const archetype = getGateArchetype(pos.gate);
      const retro = pos.retrograde ? " \u211E" : "";
      lines.push(
        `${pos.planet}: Gate ${pos.gate}.${pos.line}${retro} - ${archetype?.theme || "Unknown"}`
      );
    });
    return lines.join("\n");
  }
};
var transitCache = new TransitCacheService();

// shared/growth-programs.ts
var ARCHETYPAL_PROGRAMS = [
  {
    id: "focus_sprint",
    name: "Focus Sprint",
    archetype: "The Builder",
    description: "High-energy execution mode. Strong willpower and structured momentum. Best for implementation and shipping.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "Will",
          threshold: 0.6,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "Mind",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "planetary_aspect",
          planet: "Mars",
          aspect: "direct"
        }
      ]
    },
    directive: {
      mode: "focus",
      suggestedActions: [
        "Close open loops - finish what you started",
        "Break down large tasks into 25-min sprints",
        "Minimize context switching",
        "Ship small, ship often"
      ],
      toolRecommendations: ["IDE", "Terminal", "File Explorer"],
      ambientSettings: {
        theme: "high-contrast",
        aiAssistantBehavior: "minimal"
      }
    },
    duration: 90,
    // 90-min sprint
    weight: 1
  },
  {
    id: "creative_flow",
    name: "Creative Flow",
    archetype: "The Artist",
    description: "Imaginative exploration mode. High emotional receptivity and innovative thinking. Best for ideation and design.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "Emotions",
          threshold: 0.6,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "ThroatExpression",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "resonance",
          field: "Ajna",
          minAlignment: 0.4
        }
      ]
    },
    directive: {
      mode: "create",
      suggestedActions: [
        "Sketch UI concepts without constraints",
        "Experiment with new libraries or frameworks",
        "Refactor for elegance, not just function",
        "Follow curiosity - explore tangents"
      ],
      toolRecommendations: ["GameCreator", "GANTrainer", "IDE", "UniverseCreator"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "supportive"
      }
    },
    duration: 120,
    weight: 0.9
  },
  {
    id: "collaborative_surge",
    name: "Collaborative Surge",
    archetype: "The Connector",
    description: "Team-oriented mode. High social energy and communication clarity. Best for pair programming and knowledge sharing.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "ThroatExpression",
          threshold: 0.7,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "SacralLife",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "planetary_aspect",
          planet: "Mercury",
          aspect: "direct"
        }
      ]
    },
    directive: {
      mode: "collaborate",
      suggestedActions: [
        "Share your work in Grove Store",
        "Write documentation or tutorials",
        "Ask for code review from Guard Dog",
        "Contribute to open issues or discussions"
      ],
      toolRecommendations: ["GroveStore", "IDE", "AgentPanel"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "proactive"
      }
    },
    duration: 60,
    weight: 0.8
  },
  {
    id: "reflective_depth",
    name: "Reflective Depth",
    archetype: "The Philosopher",
    description: "Introspective mode. High mental clarity and pattern recognition. Best for architecture planning and debugging complex systems.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "Mind",
          threshold: 0.7,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "Ajna",
          threshold: 0.6,
          comparator: ">="
        },
        {
          type: "composite",
          operator: "OR",
          conditions: [
            {
              type: "planetary_aspect",
              planet: "Mercury",
              aspect: "retrograde"
            },
            {
              type: "planetary_aspect",
              planet: "Saturn",
              aspect: "slow"
            }
          ]
        }
      ]
    },
    directive: {
      mode: "reflect",
      suggestedActions: [
        "Review system architecture - identify technical debt",
        "Debug persistent issues methodically",
        "Read documentation deeply",
        "Plan next sprint without coding yet"
      ],
      toolRecommendations: ["IDE", "Dashboard", "SettingsPanel"],
      ambientSettings: {
        theme: "low-stimulation",
        aiAssistantBehavior: "minimal"
      }
    },
    duration: 90,
    weight: 0.85
  },
  {
    id: "integration_mode",
    name: "Integration Mode",
    archetype: "The Synthesizer",
    description: "Holistic consolidation mode. Balanced field activation. Best for merging branches, updating dependencies, and system maintenance.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "SolarIdentity",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "SacralLife",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "resonance",
          field: "Root",
          minAlignment: 0.5
        }
      ]
    },
    directive: {
      mode: "integrate",
      suggestedActions: [
        "Merge feature branches",
        "Update package dependencies",
        "Run full test suite",
        "Clean up workspace - close unused tabs"
      ],
      toolRecommendations: ["IDE", "ModManager", "Dashboard"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "supportive"
      }
    },
    duration: 45,
    weight: 0.7
  }
];
function getAllPrograms() {
  return ARCHETYPAL_PROGRAMS;
}

// server/services/RulesEngine.ts
var RulesEngine = class {
  /**
   * Evaluate all programs against current state
   * Returns programs sorted by match score (highest first)
   */
  evaluatePrograms(programs, analysis, fieldVectors) {
    const activations = [];
    for (const program of programs) {
      const result = this.evaluateProgramTrigger(
        program.trigger,
        analysis,
        fieldVectors
      );
      if (result.matches) {
        activations.push({
          program,
          matchScore: result.score * program.weight,
          activeConditions: result.reasons
        });
      }
    }
    return activations.sort((a, b) => b.matchScore - a.matchScore);
  }
  /**
   * Evaluate a program trigger (top-level condition group)
   */
  evaluateProgramTrigger(trigger, analysis, fieldVectors) {
    const operator = trigger.operator || "AND";
    const results = trigger.conditions.map(
      (condition) => this.evaluateCondition(condition, analysis, fieldVectors)
    );
    return this.combineResults(results, operator);
  }
  /**
   * Evaluate a single condition (dispatches to specific type handlers)
   */
  evaluateCondition(condition, analysis, fieldVectors) {
    switch (condition.type) {
      case "field_pressure":
        return this.evaluateFieldPressure(condition, analysis);
      case "resonance":
        return this.evaluateResonance(condition, analysis);
      case "planetary_aspect":
        return this.evaluatePlanetaryAspect(condition, analysis);
      case "composite":
        return this.evaluateComposite(condition, analysis, fieldVectors);
      default:
        return { matches: false, score: 0, reasons: [] };
    }
  }
  /**
   * Evaluate field pressure condition
   */
  evaluateFieldPressure(condition, analysis) {
    const pressure = analysis.pressureMap[condition.field] || 0;
    let matches = false;
    switch (condition.comparator) {
      case ">":
        matches = pressure > condition.threshold;
        break;
      case "<":
        matches = pressure < condition.threshold;
        break;
      case ">=":
        matches = pressure >= condition.threshold;
        break;
    }
    const score = matches ? pressure : 0;
    const reason = matches ? `${condition.field} pressure (${pressure.toFixed(2)}) ${condition.comparator} ${condition.threshold}` : "";
    return {
      matches,
      score,
      reasons: matches ? [reason] : []
    };
  }
  /**
   * Evaluate resonance condition
   */
  evaluateResonance(condition, analysis) {
    const resonance = analysis.resonanceMap[condition.field] || 0;
    const matches = resonance >= condition.minAlignment;
    const score = matches ? resonance : 0;
    const reason = matches ? `${condition.field} resonance (${resonance.toFixed(2)}) >= ${condition.minAlignment}` : "";
    return {
      matches,
      score,
      reasons: matches ? [reason] : []
    };
  }
  /**
   * Evaluate planetary aspect condition
   */
  evaluatePlanetaryAspect(condition, analysis) {
    const currentAspect = analysis.aspectMap[condition.planet];
    const matches = currentAspect === condition.aspect;
    const score = matches ? 1 : 0;
    const reason = matches ? `${condition.planet} is ${condition.aspect}` : "";
    return {
      matches,
      score,
      reasons: matches ? [reason] : []
    };
  }
  /**
   * Evaluate composite condition (nested logic)
   */
  evaluateComposite(condition, analysis, fieldVectors) {
    const results = condition.conditions.map(
      (c) => this.evaluateCondition(c, analysis, fieldVectors)
    );
    return this.combineResults(results, condition.operator);
  }
  /**
   * Combine multiple evaluation results with AND/OR/NOT logic
   */
  combineResults(results, operator) {
    if (results.length === 0) {
      return { matches: false, score: 0, reasons: [] };
    }
    let matches = false;
    let score = 0;
    const reasons = [];
    switch (operator) {
      case "AND":
        matches = results.every((r) => r.matches);
        score = matches ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;
        break;
      case "OR":
        matches = results.some((r) => r.matches);
        score = Math.max(...results.map((r) => r.score));
        break;
      case "NOT":
        matches = !results[0].matches;
        score = matches ? 1 : 0;
        break;
    }
    if (matches) {
      for (const result of results) {
        if (result.matches) {
          reasons.push(...result.reasons);
        }
      }
    }
    return { matches, score, reasons };
  }
};

// server/services/DirectiveSynthesis.ts
var DirectiveSynthesizer = class {
  /**
   * Synthesize multiple program activations into single directive
   * 
   * Strategy:
   * - Primary mode comes from highest-scoring program
   * - Actions are merged from top N programs (weighted by score)
   * - Tools are union of all recommendations
   * - Ambient settings come from primary program
   */
  synthesize(activations, maxBlend = 3) {
    if (activations.length === 0) {
      return this.getDefaultDirective();
    }
    const sorted = [...activations].sort((a, b) => b.matchScore - a.matchScore);
    const topPrograms = sorted.slice(0, maxBlend);
    const primary = topPrograms[0];
    const blendedActions = this.blendActions(topPrograms);
    const toolRecommendations = this.mergeTools(topPrograms);
    const synthesis = this.generateSynthesis(topPrograms);
    return {
      primaryMode: primary.program.directive.mode,
      blendedActions,
      toolRecommendations,
      ambientSettings: primary.program.directive.ambientSettings,
      activeProgramIds: topPrograms.map((p) => p.program.id),
      synthesis
    };
  }
  /**
   * Blend actions from multiple programs with weighted priority
   */
  blendActions(activations) {
    const actionMap = /* @__PURE__ */ new Map();
    for (const activation of activations) {
      const weight = activation.matchScore;
      for (const action of activation.program.directive.suggestedActions) {
        const currentWeight = actionMap.get(action) || 0;
        actionMap.set(action, currentWeight + weight);
      }
    }
    const sortedActions = Array.from(actionMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([action]) => action);
    return sortedActions;
  }
  /**
   * Merge tool recommendations (union, prioritized by primary program)
   */
  mergeTools(activations) {
    const toolSet = /* @__PURE__ */ new Set();
    const toolScores = /* @__PURE__ */ new Map();
    for (const activation of activations) {
      const weight = activation.matchScore;
      for (const tool of activation.program.directive.toolRecommendations) {
        toolSet.add(tool);
        const currentScore = toolScores.get(tool) || 0;
        toolScores.set(tool, currentScore + weight);
      }
    }
    return Array.from(toolSet).sort((a, b) => (toolScores.get(b) || 0) - (toolScores.get(a) || 0)).slice(0, 5);
  }
  /**
   * Generate human-readable synthesis explanation
   */
  generateSynthesis(activations) {
    if (activations.length === 1) {
      const program = activations[0].program;
      return `**${program.name}** (${program.archetype}): ${program.description}`;
    }
    const primary = activations[0];
    const secondary = activations.slice(1);
    let synthesis = `**Primary: ${primary.program.name}** (${(primary.matchScore * 100).toFixed(0)}% match)
`;
    synthesis += `${primary.program.description}

`;
    if (secondary.length > 0) {
      synthesis += `**Blending with:**
`;
      for (const activation of secondary) {
        const score = (activation.matchScore * 100).toFixed(0);
        synthesis += `\u2022 ${activation.program.name} (${score}%)
`;
      }
      synthesis += `
**Synthesis:** Your current state activates multiple archetypal patterns. `;
      synthesis += `Focus on ${primary.program.directive.mode} while staying open to `;
      synthesis += `${secondary.map((a) => a.program.directive.mode).join(" and ")} energies.`;
    }
    if (primary.activeConditions.length > 0) {
      synthesis += `

**Why this program?**
`;
      for (const condition of primary.activeConditions.slice(0, 3)) {
        synthesis += `\u2022 ${condition}
`;
      }
    }
    return synthesis;
  }
  /**
   * Default directive when no programs match
   */
  getDefaultDirective() {
    return {
      primaryMode: "integrate",
      blendedActions: [
        "Review your current projects",
        "Organize your workspace",
        "Set intentions for your session",
        "Check in with Guard Dog for guidance"
      ],
      toolRecommendations: ["Dashboard", "IDE"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "supportive"
      },
      activeProgramIds: [],
      synthesis: "**Balanced State**: No strong archetypal activation detected. This is a good time for general maintenance and exploration."
    };
  }
};

// server/services/GrowthProgramEngine.ts
var GrowthProgramEngine = class {
  rulesEngine;
  synthesizer;
  constructor() {
    this.rulesEngine = new RulesEngine();
    this.synthesizer = new DirectiveSynthesizer();
  }
  /**
   * Get recommended workspace directive based on current transits and user chart
   */
  getWorkspaceDirective(fieldVectors, projections) {
    const analysis = this.buildFieldAnalysis(fieldVectors, projections);
    const activations = this.rulesEngine.evaluatePrograms(
      ARCHETYPAL_PROGRAMS,
      analysis,
      fieldVectors
    );
    const directive = this.synthesizer.synthesize(activations);
    return directive;
  }
  /**
   * Get detailed program activations (for debugging/UI display)
   */
  getProgramActivations(fieldVectors, projections) {
    const analysis = this.buildFieldAnalysis(fieldVectors, projections);
    return this.rulesEngine.evaluatePrograms(
      ARCHETYPAL_PROGRAMS,
      analysis,
      fieldVectors
    );
  }
  /**
   * Build field vector analysis from current transit data
   */
  buildFieldAnalysis(fieldVectors, projections) {
    const pressureMap = {};
    const resonanceMap = {};
    const dominantFields = [];
    for (const vector of fieldVectors) {
      pressureMap[vector.field] = vector.transitPressure;
      resonanceMap[vector.field] = vector.historicalResonance;
      if (vector.weight > 0.5) {
        dominantFields.push(vector.field);
      }
    }
    const aspectMap = {};
    for (const position of projections.tropical.positions) {
      const planet = position.planet;
      let aspect;
      if (position.retrograde) {
        aspect = "retrograde";
      } else if (position.speed > this.getAverageSpeed(planet)) {
        aspect = "fast";
      } else if (position.speed < this.getAverageSpeed(planet) * 0.7) {
        aspect = "slow";
      } else {
        aspect = "direct";
      }
      aspectMap[planet] = aspect;
    }
    return {
      dominantFields,
      pressureMap,
      resonanceMap,
      aspectMap
    };
  }
  /**
   * Get average daily speed for a planet (for aspect detection)
   */
  getAverageSpeed(planet) {
    const speeds = {
      Sun: 1,
      Moon: 13.2,
      Mercury: 1.6,
      Venus: 1.2,
      Mars: 0.5,
      Jupiter: 0.08,
      Saturn: 0.03,
      Uranus: 0.01,
      Neptune: 6e-3,
      Pluto: 4e-3,
      NorthNode: -0.05,
      // Retrograde
      Chiron: 0.06
    };
    return speeds[planet] || 0.5;
  }
};
var growthProgramEngine = new GrowthProgramEngine();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "YOU-N-I-VERSE Studio API" });
  });
  app2.get("/api/transits/summary", (_req, res) => {
    try {
      const summary = transitCache.getTransitSummary();
      res.json({ summary });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get transit summary"
      });
    }
  });
  app2.get("/api/transits/current", (_req, res) => {
    try {
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }
      res.json(transits);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get transits"
      });
    }
  });
  app2.post("/api/transits/field-vectors", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        birthData: z.object({
          date: z.string().transform((str) => new Date(str)),
          latitude: z.number(),
          longitude: z.number()
        }),
        fieldAssignments: z.record(z.object({
          chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
          sensitiveGates: z.array(z.number())
        })).optional(),
        resonanceHistory: z.record(z.number()).optional()
      });
      const userChart = schema.parse(req.body);
      const fullChart = {
        ...userChart,
        fieldAssignments: userChart.fieldAssignments || {},
        resonanceHistory: userChart.resonanceHistory || {}
      };
      const fieldVectors = transitCache.getFieldVectors(fullChart);
      res.json({ fieldVectors });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to compute field vectors"
      });
    }
  });
  app2.get("/api/programs/all", (_req, res) => {
    try {
      const programs = getAllPrograms();
      res.json({ programs });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get programs"
      });
    }
  });
  app2.get("/api/programs/demo", (_req, res) => {
    try {
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }
      console.log("[DEBUG] Transits fetched successfully");
      const demoFieldVectors = transitCache.getFieldVectors({
        userId: "demo",
        birthData: {
          date: /* @__PURE__ */ new Date("1990-01-01"),
          // Default birth date
          latitude: 0,
          longitude: 0
        },
        fieldAssignments: {
          Mind: { chartType: "Sidereal", sensitiveGates: [] },
          Ajna: { chartType: "Sidereal", sensitiveGates: [] },
          ThroatExpression: { chartType: "Tropical", sensitiveGates: [] },
          SolarIdentity: { chartType: "Draconic", sensitiveGates: [] },
          Will: { chartType: "Tropical", sensitiveGates: [] },
          SacralLife: { chartType: "Tropical", sensitiveGates: [] },
          Emotions: { chartType: "Draconic", sensitiveGates: [] },
          Instinct: { chartType: "Sidereal", sensitiveGates: [] },
          Root: { chartType: "Tropical", sensitiveGates: [] }
        },
        resonanceHistory: {
          Mind: 0.5,
          Ajna: 0.5,
          ThroatExpression: 0.5,
          SolarIdentity: 0.5,
          Will: 0.5,
          SacralLife: 0.5,
          Emotions: 0.5,
          Instinct: 0.5,
          Root: 0.5
        }
      });
      console.log("[DEBUG] Field vectors computed:", demoFieldVectors.length);
      const directive = growthProgramEngine.getWorkspaceDirective(
        demoFieldVectors,
        transits.projections
      );
      console.log("[DEBUG] Directive generated successfully");
      res.json({ directive, note: "Demo mode - using default user profile" });
    } catch (error) {
      console.error("[ERROR] Demo endpoint failed:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get demo suggestion",
        stack: error instanceof Error ? error.stack : void 0
      });
    }
  });
  app2.post("/api/programs/suggest", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        birthData: z.object({
          date: z.string().transform((str) => new Date(str)),
          latitude: z.number(),
          longitude: z.number()
        }),
        fieldAssignments: z.record(z.object({
          chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
          sensitiveGates: z.array(z.number())
        })).optional(),
        resonanceHistory: z.record(z.number()).optional()
      });
      const userChart = schema.parse(req.body);
      const fullChart = {
        ...userChart,
        fieldAssignments: userChart.fieldAssignments || {},
        resonanceHistory: userChart.resonanceHistory || {}
      };
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }
      const fieldVectors = transitCache.getFieldVectors(fullChart);
      const directive = growthProgramEngine.getWorkspaceDirective(
        fieldVectors,
        transits.projections
      );
      res.json({ directive });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get program suggestion"
      });
    }
  });
  app2.post("/api/programs/activations", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        birthData: z.object({
          date: z.string().transform((str) => new Date(str)),
          latitude: z.number(),
          longitude: z.number()
        }),
        fieldAssignments: z.record(z.object({
          chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
          sensitiveGates: z.array(z.number())
        })).optional(),
        resonanceHistory: z.record(z.number()).optional()
      });
      const userChart = schema.parse(req.body);
      const fullChart = {
        ...userChart,
        fieldAssignments: userChart.fieldAssignments || {},
        resonanceHistory: userChart.resonanceHistory || {}
      };
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }
      const fieldVectors = transitCache.getFieldVectors(fullChart);
      const activations = growthProgramEngine.getProgramActivations(
        fieldVectors,
        transits.projections
      );
      res.json({ activations });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get program activations"
      });
    }
  });
  app2.get("/api/tokens/status", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const tokenStatus = await checkTokenAvailability(userId);
      res.json(tokenStatus);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to check token status"
      });
    }
  });
  app2.post("/api/ideons", async (req, res) => {
    try {
      const createSchema = z.object({
        userId: z.string(),
        rawText: z.string().min(1)
      });
      const { userId, rawText } = createSchema.parse(req.body);
      const { available } = await checkTokenAvailability(userId);
      if (!available) {
        return res.status(403).json({
          error: "No tokens available for this month. You receive 5 tokens per month."
        });
      }
      const consumed = await consumeToken(userId);
      if (!consumed) {
        return res.status(403).json({
          error: "Failed to consume token. Please try again."
        });
      }
      const result = await orchestrateWorldGeneration(userId, rawText);
      res.json({
        success: true,
        ideonSeed: result.ideonSeed,
        worldManifestation: result.worldManifestation,
        processingTime: result.processingTime
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to generate world"
      });
    }
  });
  app2.get("/api/ideons", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const ideons = await storage.getIdeonSeedsByUser(userId);
      res.json(ideons);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch ideons"
      });
    }
  });
  app2.get("/api/ideons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ideon = await storage.getIdeonSeed(id);
      if (!ideon) {
        return res.status(404).json({ error: "Ideon not found" });
      }
      res.json(ideon);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch ideon"
      });
    }
  });
  app2.get("/api/worlds/:ideonId", async (req, res) => {
    try {
      const { ideonId } = req.params;
      const world = await storage.getWorldManifestationByIdeonId(ideonId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }
      res.json(world);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch world"
      });
    }
  });
  app2.post("/api/export/google-drive", async (req, res) => {
    try {
      const { projectName, files } = req.body;
      if (!projectName || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const result = await uploadProjectToGoogleDrive(projectName, files);
      res.json({
        success: true,
        folderUrl: result.folder.webViewLink,
        folderName: result.folder.name,
        fileCount: result.files.length
      });
    } catch (error) {
      console.error("Google Drive export error:", error);
      res.status(500).json({
        error: error.message || "Failed to export to Google Drive",
        notConnected: error.message?.includes("not connected")
      });
    }
  });
  app2.post("/api/push/github", async (req, res) => {
    try {
      const { repoName, files, description } = req.body;
      if (!repoName || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const result = await createOrUpdateGitHubRepo(repoName, files, description);
      res.json({
        success: true,
        url: result.url,
        username: result.username,
        repoName: result.repoName
      });
    } catch (error) {
      console.error("GitHub push error:", error);
      res.status(500).json({
        error: error.message || "Failed to push to GitHub",
        notConnected: error.message?.includes("not connected")
      });
    }
  });
  app2.post("/api/import/github", async (req, res) => {
    try {
      const { repoUrl } = req.body;
      if (!repoUrl) {
        return res.status(400).json({ error: "Repository URL is required" });
      }
      const result = await importGitHubRepo(repoUrl);
      res.json({
        success: true,
        repoName: result.repoName,
        owner: result.owner,
        zipData: result.zipData.toString("base64")
      });
    } catch (error) {
      console.error("GitHub import error:", error);
      res.status(500).json({
        message: error.message || "Failed to import from GitHub"
      });
    }
  });
  app2.post("/api/deploy/netlify", async (req, res) => {
    try {
      const { apiKey, files, siteName } = req.body;
      if (!apiKey || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const result = await deployToNetlify(apiKey, files, siteName);
      res.json({
        success: true,
        url: result.url,
        deployId: result.deployId,
        siteId: result.siteId
      });
    } catch (error) {
      console.error("Netlify deployment error:", error);
      res.status(500).json({
        error: error.message || "Failed to deploy to Netlify"
      });
    }
  });
  app2.get("/api/zips", async (_req, res) => {
    try {
      const zips = await storage.getAllZips();
      res.json(zips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ZIP archives" });
    }
  });
  app2.get("/api/zips/:id", async (req, res) => {
    try {
      const zip = await storage.getZip(req.params.id);
      if (!zip) {
        return res.status(404).json({ error: "ZIP not found" });
      }
      res.json(zip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ZIP" });
    }
  });
  app2.post("/api/zips", async (req, res) => {
    try {
      const { filename, objectPath, size } = req.body;
      const zip = await storage.createZip({
        filename,
        originalName: filename,
        uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
        size,
        objectPath,
        structure: {
          entries: [],
          totalSize: size,
          fileCount: 0,
          directoryCount: 0
        },
        analysis: {
          description: "Archive uploaded",
          projectType: "unknown",
          technologies: [],
          confidence: 0.5
        }
      });
      res.json({ id: zip.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create ZIP record" });
    }
  });
  app2.delete("/api/zips/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteZip(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "ZIP not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ZIP" });
    }
  });
  app2.get("/api/zips/:id/entry-file", async (req, res) => {
    try {
      const zip = await storage.getZip(req.params.id);
      if (!zip) {
        return res.status(404).json({ error: "ZIP not found" });
      }
      const htmlFiles = zip.structure.entries.filter((e) => e.type === "file" && (e.name.endsWith(".html") || e.name.endsWith(".htm"))).map((e) => e.path);
      const entryFile = htmlFiles.find((f) => f.includes("index.html")) || htmlFiles[0] || null;
      res.json({ entryFile });
    } catch (error) {
      res.status(500).json({ error: "Failed to detect entry file" });
    }
  });
  app2.get("/api/zips/:id/play/:filePath(*)", async (req, res) => {
    try {
      const zip = await storage.getZip(req.params.id);
      if (!zip) {
        return res.status(404).json({ error: "ZIP not found" });
      }
      const filePath = req.params.filePath;
      const entry = zip.structure.entries.find((e) => e.path === filePath);
      if (!entry || entry.type !== "file") {
        return res.status(404).send("File not found in archive");
      }
      const content = await storage.getZipFileContent(zip.id, filePath);
      const ext = filePath.split(".").pop()?.toLowerCase();
      const contentTypes = {
        "html": "text/html",
        "htm": "text/html",
        "css": "text/css",
        "js": "application/javascript",
        "json": "application/json",
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "svg": "image/svg+xml",
        "txt": "text/plain"
      };
      res.setHeader("Content-Type", contentTypes[ext || ""] || "application/octet-stream");
      res.send(content);
    } catch (error) {
      res.status(500).send("Failed to serve file");
    }
  });
  app2.post("/api/zips/merge", async (req, res) => {
    try {
      const { zipIds, conflictResolutions } = req.body;
      if (!zipIds || !Array.isArray(zipIds) || zipIds.length < 2) {
        return res.status(400).json({ error: "At least 2 ZIP IDs required" });
      }
      const result = await storage.mergeZips(zipIds, conflictResolutions || {});
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to merge ZIPs" });
    }
  });
  app2.post("/api/consciousness/calibrate", async (req, res) => {
    try {
      const calibrateSchema = z.object({
        datetime: z.string().transform((str) => new Date(str)),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        timezone: z.string(),
        withVoice: z.boolean().optional().default(false),
        withLLMInterpretation: z.boolean().optional().default(false)
      });
      const birthData = calibrateSchema.parse(req.body);
      const allSeeds = ConsciousnessCalibrator.calibrateAll(birthData);
      const mergedSeeds = ConsciousnessCalibrator.mergeSeeds(allSeeds);
      let interpretation = null;
      let voiceReadings = null;
      if (req.body.withLLMInterpretation) {
        try {
          interpretation = await ChartInterpreter.interpretCharts(allSeeds, birthData);
          if (req.body.withVoice && interpretation?.layerInsights) {
            voiceReadings = await generateLayeredConsciousnessVoice(interpretation.layerInsights);
          }
        } catch (error) {
          console.error("Interpretation error:", error);
        }
      }
      res.json({
        success: true,
        charts: allSeeds,
        oscillatorSeeds: mergedSeeds,
        interpretation,
        voiceReadings,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid birth data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to calibrate consciousness"
      });
    }
  });
  app2.post("/api/consciousness/natal", async (req, res) => {
    try {
      const birthDataSchema = z.object({
        datetime: z.string().transform((str) => new Date(str)),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        timezone: z.string()
      });
      const birthData = birthDataSchema.parse(req.body);
      const { NatalChartCalculator: NatalChartCalculator2 } = await Promise.resolve().then(() => (init_chart_calculators(), chart_calculators_exports));
      const natalChart = NatalChartCalculator2.calculate(birthData);
      res.json({
        success: true,
        chart: natalChart,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid birth data",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to calculate natal chart"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
transitCache.start();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
