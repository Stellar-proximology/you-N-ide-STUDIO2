/**
 * ╔═══════════════════════════════════════╗
 * ║  ▲ GLYPH GENERATOR                    ║
 * ║ ╱ ╲    ⟡-DEFINE-000                   ║
 * ║╱───╲   Movement · Spirit · Monopole   ║
 * ║│ ⟡ │   Energy → Creation → Seeing     ║
 * ║╲───╱   I Define                       ║
 * ║  ▼     YOU-N-I-VERSE Core Tool        ║
 * ╠═══════════════════════════════════════╣
 * ║ Purpose: Generate dimensional glyphs  ║
 * ║          for all system modules       ║
 * ║ State:   GENESIS | Coherence: 100%   ║
 * ╚═══════════════════════════════════════╝
 */

export interface Dimension {
  symbol: string;
  code: string;
  nature: string;
  component: string;
  keynote: string;
  field: string;
}

export const DIMENSIONS: Record<string, Dimension> = {
  Movement: {
    symbol: '⟡',
    code: '3',
    nature: 'Energy → Creation → Seeing → Landscape → Environment',
    component: 'Magnetic Monopole',
    keynote: 'I Define',
    field: 'Spirit'
  },
  Evolution: {
    symbol: '⟁',
    code: 'E',
    nature: 'Gravity → Memory → Taste → Love → Light',
    component: 'Personality Crystal',
    keynote: 'I Remember',
    field: 'Mind'
  },
  Being: {
    symbol: '⬢',
    code: 'M',
    nature: 'Matter → Touch → Sex → Survival',
    component: 'The Atom',
    keynote: 'I Am',
    field: 'Body'
  },
  Design: {
    symbol: '◇',
    code: 'A',
    nature: 'Structure → Progress → Smell → Life → Art',
    component: 'Design Crystal',
    keynote: 'I Design',
    field: 'Soul'
  },
  Space: {
    symbol: '◉',
    code: 'S',
    nature: 'Form → Illusion → Hearing → Music → Freedom',
    component: 'Personality Crystal',
    keynote: 'I Think',
    field: 'Heart'
  }
};

export interface CrystalAlignment {
  personality: boolean;
  design: boolean;
  monopole: boolean;
}

export interface FieldResonance {
  mind: number;
  body: number;
  heart: number;
  spirit: number;
  soul: number;
}

export interface GlyphConfig {
  name: string;
  dimension: keyof typeof DIMENSIONS;
  crystalAlignment?: CrystalAlignment;
  fieldResonance?: FieldResonance;
  connections?: string[];
  coherence?: number;
  state?: 'active' | 'prototype' | 'deprecated' | 'broken';
  repo?: string;
  path?: string;
  id?: string;
}

export interface GlyphData {
  glyph_id: string;
  name: string;
  symbol: string;
  dimension: {
    name: string;
    symbol: string;
    keynote: string;
    nature_chain: string[];
    component: string;
    field: string;
  };
  crystal_alignment: CrystalAlignment;
  field_resonance: FieldResonance;
  connections: string[];
  coherence: number;
  state: string;
  repo: string;
  path: string;
  generated_at: string;
}

export class GlyphGenerator {
  name: string;
  dimension: Dimension;
  crystalAlignment: CrystalAlignment;
  fieldResonance: FieldResonance;
  connections: string[];
  coherence: number;
  state: string;
  repo: string;
  path: string;
  id: string;

  constructor(config: GlyphConfig) {
    this.name = config.name;
    this.dimension = DIMENSIONS[config.dimension];
    this.crystalAlignment = config.crystalAlignment || {
      personality: false,
      design: false,
      monopole: false
    };
    this.fieldResonance = config.fieldResonance || {
      mind: 0.5,
      body: 0.5,
      heart: 0.5,
      spirit: 0.5,
      soul: 0.5
    };
    this.connections = config.connections || [];
    this.coherence = config.coherence || 1.0;
    this.state = config.state || 'prototype';
    this.repo = config.repo || 'YOU-N-I-VERSE Studio';
    this.path = config.path || '/';
    this.id = config.id || this.generateID();
  }

  generateID(): string {
    const dimCode = this.dimension.symbol;
    const keynoteWord = this.dimension.keynote.split(' ')[1].toUpperCase();
    const counter = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    return `${dimCode}-${keynoteWord}-${counter}`;
  }

  generateFileHeader(): string {
    const topCrystal = this.crystalAlignment.personality ? '▲' : '△';
    const bottomCrystal = this.crystalAlignment.design ? '▼' : '▽';

    return `/**
 * ╔═══════════════════════════════════════╗
 * ║  ${topCrystal} ${this.name.toUpperCase().padEnd(33, ' ')} ║
 * ║ ╱ ╲    ${this.id.padEnd(30, ' ')} ║
 * ║╱───╲   ${(this.dimension.field + ' · ' + this.dimension.component).padEnd(30, ' ')} ║
 * ║│ ${this.dimension.symbol} │   ${this.dimension.nature.split('→').slice(0, 2).join(' → ').padEnd(30, ' ')} ║
 * ║╲───╱   ${this.dimension.keynote.padEnd(30, ' ')} ║
 * ║  ${bottomCrystal}                                   ║
 * ╠═══════════════════════════════════════╣
 * ║ Repository: ${this.repo.padEnd(26, ' ')} ║
 * ║ Path: ${this.path.padEnd(32, ' ')} ║
 * ║ State: ${this.state.toUpperCase().padEnd(31, ' ')} ║
 * ║ Coherence: ${Math.floor(this.coherence * 100)}%${' '.repeat(27)} ║
 * ╚═══════════════════════════════════════╝
 */`;
  }

  generateJSON(): GlyphData {
    return {
      glyph_id: this.id,
      name: this.name,
      symbol: this.dimension.symbol,
      dimension: {
        name: Object.keys(DIMENSIONS).find(k => DIMENSIONS[k] === this.dimension) || 'Evolution',
        symbol: this.dimension.symbol,
        keynote: this.dimension.keynote,
        nature_chain: this.dimension.nature.split(' → '),
        component: this.dimension.component,
        field: this.dimension.field
      },
      crystal_alignment: this.crystalAlignment,
      field_resonance: this.fieldResonance,
      connections: this.connections,
      coherence: this.coherence,
      state: this.state,
      repo: this.repo,
      path: this.path,
      generated_at: new Date().toISOString()
    };
  }

  generate() {
    return {
      header: this.generateFileHeader(),
      json: this.generateJSON()
    };
  }
}

// Auto-detect dimension based on file type/content
export function detectDimension(name: string, type: string): keyof typeof DIMENSIONS {
  const lowerName = name.toLowerCase();
  const lowerType = type.toLowerCase();

  if (lowerName.includes('ai') || lowerName.includes('gan') || lowerType === 'gan') {
    return 'Movement'; // Energy/Creation
  }
  if (lowerName.includes('data') || lowerName.includes('parse') || lowerName.includes('memory')) {
    return 'Evolution'; // Memory/Taste
  }
  if (lowerName.includes('api') || lowerName.includes('server') || lowerType === 'zip') {
    return 'Being'; // Matter/Touch
  }
  if (lowerName.includes('design') || lowerName.includes('schema') || lowerName.includes('structure')) {
    return 'Design'; // Structure/Progress
  }
  if (lowerName.includes('ui') || lowerName.includes('component') || lowerType === 'project') {
    return 'Space'; // Form/Illusion
  }

  return 'Evolution'; // Default
}
