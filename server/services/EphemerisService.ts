// Ephemeris Service - Astronomical calculations using astronomy-engine
// Computes planetary positions for transit tracking

import * as Astronomy from 'astronomy-engine';
import { Planet, PlanetaryPosition, TransitProjection, ChartType, longitudeToGate, PROJECTION_OFFSETS } from '@shared/transit-system';

export class EphemerisService {
  
  /**
   * Get current planetary positions for all relevant bodies
   */
  async getCurrentPositions(date: Date = new Date()): Promise<PlanetaryPosition[]> {
    const planets: Planet[] = [
      "Sun", "Moon", "Mercury", "Venus", "Mars", 
      "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
    ];
    
    const positions: PlanetaryPosition[] = [];
    
    for (const planet of planets) {
      const position = await this.getPlanetPosition(planet, date);
      positions.push(position);
    }
    
    // Add North Node (calculated from Moon's orbit)
    const northNode = await this.getNorthNodePosition(date);
    positions.push(northNode);
    
    return positions;
  }
  
  /**
   * Get position for a single planet
   */
  private async getPlanetPosition(planet: Planet, date: Date): Promise<PlanetaryPosition> {
    // Map our Planet type to Astronomy.Body enum
    const bodyMap: Record<string, Astronomy.Body> = {
      "Sun": Astronomy.Body.Sun,
      "Moon": Astronomy.Body.Moon,
      "Mercury": Astronomy.Body.Mercury,
      "Venus": Astronomy.Body.Venus,
      "Mars": Astronomy.Body.Mars,
      "Jupiter": Astronomy.Body.Jupiter,
      "Saturn": Astronomy.Body.Saturn,
      "Uranus": Astronomy.Body.Uranus,
      "Neptune": Astronomy.Body.Neptune,
      "Pluto": Astronomy.Body.Pluto,
    };
    
    const body = bodyMap[planet];
    
    // Create AstroTime object
    const time = Astronomy.MakeTime(date);
    
    // Get geocentric position vector
    const vector = Astronomy.GeoVector(body, time, true);
    
    // Convert to ecliptic coordinates
    const ecliptic = Astronomy.Ecliptic(vector);
    const longitude = ecliptic.elon; // Ecliptic longitude in degrees
    
    // Calculate daily motion for retrograde detection
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTime = Astronomy.MakeTime(tomorrow);
    const tomorrowVector = Astronomy.GeoVector(body, tomorrowTime, true);
    const tomorrowEcliptic = Astronomy.Ecliptic(tomorrowVector);
    const dailyMotion = tomorrowEcliptic.elon - longitude;
    
    const retrograde = dailyMotion < 0;
    const speed = Math.abs(dailyMotion);
    
    // Convert to gate/line
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
  private async getNorthNodePosition(date: Date): Promise<PlanetaryPosition> {
    // Simplified calculation - in production use Swiss Ephemeris
    // North Node moves retrograde ~19.3 degrees per year
    const epoch = new Date('2000-01-01');
    const yearsSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const nodeAt2000 = 125.04; // Approximate position at epoch
    const annualMotion = -19.3; // Retrograde motion
    
    const longitude = (nodeAt2000 + (annualMotion * yearsSinceEpoch)) % 360;
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
  applyProjection(positions: PlanetaryPosition[], chartType: ChartType): PlanetaryPosition[] {
    const offset = PROJECTION_OFFSETS[chartType];
    
    if (chartType === "Draconic") {
      // Draconic uses North Node as 0° Aries
      const nodePosition = positions.find(p => p.planet === "NorthNode");
      const nodeOffset = nodePosition ? nodePosition.longitude : 0;
      
      return positions.map(pos => {
        const adjustedLongitude = (pos.longitude - nodeOffset + 360) % 360;
        const { gate, line } = longitudeToGate(adjustedLongitude);
        return { ...pos, longitude: adjustedLongitude, gate, line };
      });
    }
    
    // Sidereal or Tropical
    return positions.map(pos => {
      const adjustedLongitude = (pos.longitude + offset + 360) % 360;
      const { gate, line } = longitudeToGate(adjustedLongitude);
      return { ...pos, longitude: adjustedLongitude, gate, line };
    });
  }
  
  /**
   * Generate all three projections at once
   */
  async getTripleProjection(date: Date = new Date()): Promise<{
    sidereal: TransitProjection;
    tropical: TransitProjection;
    draconic: TransitProjection;
  }> {
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
}
