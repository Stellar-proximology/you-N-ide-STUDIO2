// Gate Mappings - Planetary significance per gate
// Maps I Ching hexagrams to archetypal themes and planetary affinities

export interface GateArchetype {
  gate: number;
  name: string;
  element: "Fire" | "Earth" | "Metal" | "Water" | "Wood";
  theme: string;
  keywords: string[];
  planetaryAffinity: string[];  // Which planets resonate strongest
}

// The 64 Gates mapped to archetypal themes
// Based on I Ching + Human Design synthesis
export const GATE_ARCHETYPES: GateArchetype[] = [
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
    element: (["Fire", "Earth", "Metal", "Water", "Wood"] as const)[i % 5],
    theme: "Archetypal pattern",
    keywords: ["pattern", "energy", "flow"],
    planetaryAffinity: ["Sun", "Moon"]
  }))
];

// Quick lookup by gate number
export function getGateArchetype(gateNumber: number): GateArchetype | undefined {
  return GATE_ARCHETYPES.find(g => g.gate === gateNumber);
}

// Find gates by planetary affinity
export function getGatesByPlanet(planet: string): GateArchetype[] {
  return GATE_ARCHETYPES.filter(g => g.planetaryAffinity.includes(planet));
}

// Find gates by theme keyword
export function getGatesByKeyword(keyword: string): GateArchetype[] {
  return GATE_ARCHETYPES.filter(g => 
    g.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
    g.theme.toLowerCase().includes(keyword.toLowerCase())
  );
}
