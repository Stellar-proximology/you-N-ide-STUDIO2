// Transit Cache - Hourly caching of planetary positions
// Serves all users from single ephemeris calculation

import { EphemerisService } from './EphemerisService';
import { 
  TransitCache, 
  FieldVector, 
  UserChartSignature,
  FieldName,
  FIELD_CHART_MAPPING,
  ChartType,
  TransitProjection
} from '@shared/transit-system';
import { getGateArchetype } from '@shared/gate-mappings';

export class TransitCacheService {
  private ephemeris: EphemerisService;
  private cache: TransitCache | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.ephemeris = new EphemerisService();
  }
  
  /**
   * Start the cache update loop (runs hourly)
   */
  start() {
    this.updateTransits(); // Initial update
    this.updateInterval = setInterval(() => {
      this.updateTransits();
    }, 60 * 60 * 1000); // Every hour
    
    console.log('📡 Transit Cache Service started (updating hourly)');
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
  private async updateTransits() {
    try {
      const now = new Date();
      const projections = await this.ephemeris.getTripleProjection(now);
      
      this.cache = {
        timestamp: now,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour
        projections
      };
      
      console.log(`✨ Transit cache updated at ${now.toISOString()}`);
    } catch (error) {
      console.error('❌ Failed to update transit cache:', error);
    }
  }
  
  /**
   * Get current cached transits
   */
  getCurrentTransits(): TransitCache | null {
    if (!this.cache) {
      console.warn('⚠️ Transit cache not initialized');
      return null;
    }
    
    // Check if cache is expired
    if (new Date() > this.cache.expiresAt) {
      console.warn('⚠️ Transit cache expired, updating...');
      this.updateTransits();
    }
    
    return this.cache;
  }
  
  /**
   * Compute field vectors for a user based on current transits
   */
  getFieldVectors(userChart: UserChartSignature): FieldVector[] {
    const transits = this.getCurrentTransits();
    if (!transits) {
      return [];
    }
    
    const fields: FieldName[] = [
      "Mind", "Ajna", "ThroatExpression", "SolarIdentity", "Will",
      "SacralLife", "Emotions", "Instinct", "Root"
    ];
    
    return fields.map(field => this.computeFieldVector(field, userChart, transits));
  }
  
  /**
   * Compute activation vector for a single field
   */
  private computeFieldVector(
    field: FieldName, 
    userChart: UserChartSignature,
    transits: TransitCache
  ): FieldVector {
    const chartType = userChart.fieldAssignments[field]?.chartType || FIELD_CHART_MAPPING[field];
    const projection = transits.projections[chartType.toLowerCase() as keyof typeof transits.projections];
    
    // Find which gates are currently activated
    const activeGates = projection.positions.map(p => p.gate);
    const uniqueGates = Array.from(new Set(activeGates));
    
    // Calculate transit pressure (how many planets hitting this field)
    const sensitiveGates = userChart.fieldAssignments[field]?.sensitiveGates || [];
    const activatedSensitiveGates = uniqueGates.filter(g => sensitiveGates.includes(g));
    const transitPressure = activatedSensitiveGates.length > 0 
      ? Math.min(1.0, activatedSensitiveGates.length / 5) // Normalize to 0-1
      : Math.min(0.5, uniqueGates.length / 10); // Default pressure based on total activations
    
    // Get historical resonance (how user responded to this field in the past)
    const historicalResonance = userChart.resonanceHistory[field] || 0.5;
    
    // Compute weight (how much this field should influence decisions)
    const weight = transitPressure * historicalResonance;
    
    // Find dominant planets (those in user's sensitive gates)
    const dominantPlanets = projection.positions
      .filter(p => activatedSensitiveGates.includes(p.gate))
      .map(p => p.planet);
    
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
  getTransitSummary(): string {
    const transits = this.getCurrentTransits();
    if (!transits) {
      return "Transit data unavailable";
    }
    
    const tropical = transits.projections.tropical;
    const lines: string[] = [
      `🌌 Current Transits (${transits.timestamp.toLocaleString()})`,
      ""
    ];
    
    tropical.positions.forEach(pos => {
      const archetype = getGateArchetype(pos.gate);
      const retro = pos.retrograde ? " ℞" : "";
      lines.push(
        `${pos.planet}: Gate ${pos.gate}.${pos.line}${retro} - ${archetype?.theme || "Unknown"}`
      );
    });
    
    return lines.join("\n");
  }
}

// Singleton instance
export const transitCache = new TransitCacheService();
