/**
 * Symbolic Grammar Parser for Ideogenesis
 * 
 * Parses text using punctuation marks as semantic operators based on
 * Yi Jing and Human Design symbolic system:
 * 
 * • (bullet) - Individuality/Movement marker
 * . (period) - Completion, Being
 * ° (degree) - Elevation, Transpersonal
 * : (colon) - Relationship, Design
 * ; (semicolon) - Evolution, Connection
 * , (comma) - Space, Separation
 * ... (ellipsis) - Void, Potential
 * 
 * This is a foundational parser that can be extended with more
 * sophisticated symbolic grammar rules as the system evolves.
 */

export interface SymbolicStructure {
  operators: Array<{
    symbol: string;
    position: number;
    context: string;
    semanticHint: string;
  }>;
  sentences: string[];
  phrases: string[];
  rhythm: {
    complexity: number; // 0-1
    density: number; // operators per 100 chars
    pattern: string;
  };
}

const SYMBOLIC_MEANINGS: Record<string, string> = {
  '•': 'individuality/movement',
  '.': 'completion/being',
  '°': 'elevation/transpersonal',
  ':': 'relationship/design',
  ';': 'evolution/connection',
  ',': 'space/separation',
  '...': 'void/potential',
  '…': 'void/potential',
  '!': 'assertion/energy',
  '?': 'inquiry/unknown',
  '-': 'transition/bridge',
  '—': 'transition/bridge',
};

/**
 * Parse text into symbolic structure
 */
export function parseSymbolicStructure(text: string): SymbolicStructure {
  const operators: SymbolicStructure['operators'] = [];
  
  // Find all symbolic operators and their positions
  for (const [symbol, semanticHint] of Object.entries(SYMBOLIC_MEANINGS)) {
    let index = 0;
    while ((index = text.indexOf(symbol, index)) !== -1) {
      // Extract context (20 chars before and after)
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + symbol.length + 20);
      const context = text.slice(start, end).trim();
      
      operators.push({
        symbol,
        position: index,
        context,
        semanticHint,
      });
      
      index += symbol.length;
    }
  }
  
  // Sort by position
  operators.sort((a, b) => a.position - b.position);
  
  // Split into sentences (naive approach)
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Split into phrases (by major punctuation)
  const phrases = text
    .split(/[,;:—\-]+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // Calculate rhythm metrics
  const complexity = calculateComplexity(text, operators);
  const density = (operators.length / text.length) * 100;
  const pattern = operators.map(op => op.symbol).join('');
  
  return {
    operators,
    sentences,
    phrases,
    rhythm: {
      complexity,
      density,
      pattern,
    },
  };
}

/**
 * Calculate symbolic complexity (0-1 scale)
 * Based on variety and distribution of operators
 */
function calculateComplexity(text: string, operators: SymbolicStructure['operators']): number {
  if (operators.length === 0) return 0;
  
  // Unique operator types
  const uniqueSymbols = new Set(operators.map(op => op.symbol));
  const varietyScore = Math.min(uniqueSymbols.size / 7, 1); // Normalized to 7 operator types
  
  // Distribution score (how evenly distributed)
  const textLength = text.length;
  const positions = operators.map(op => op.position / textLength);
  const avgGap = positions.length > 1 
    ? positions.slice(1).reduce((sum, pos, i) => sum + Math.abs(pos - positions[i]), 0) / (positions.length - 1)
    : 0.5;
  const distributionScore = avgGap; // Higher gap = more distributed
  
  // Combine scores
  return (varietyScore * 0.6 + distributionScore * 0.4);
}

/**
 * Extract semantic hints for LLM Observer
 * Maps symbolic structure to suggested semantic layer emphasis
 */
export function extractSemanticHints(structure: SymbolicStructure): {
  primaryLayers: string[];
  suggestions: string;
} {
  const layerCounts: Record<string, number> = {
    movement: 0,
    evolution: 0,
    being: 0,
    design: 0,
    space: 0,
    transpersonal: 0,
    void: 0,
  };
  
  // Count operator hints
  for (const op of structure.operators) {
    if (op.semanticHint.includes('individuality/movement')) layerCounts.movement++;
    if (op.semanticHint.includes('evolution/connection')) layerCounts.evolution++;
    if (op.semanticHint.includes('completion/being')) layerCounts.being++;
    if (op.semanticHint.includes('relationship/design')) layerCounts.design++;
    if (op.semanticHint.includes('space/separation')) layerCounts.space++;
    if (op.semanticHint.includes('elevation/transpersonal')) layerCounts.transpersonal++;
    if (op.semanticHint.includes('void/potential')) layerCounts.void++;
  }
  
  // Get top 3 layers
  const primaryLayers = Object.entries(layerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([layer]) => layer);
  
  // Generate suggestions
  const suggestions = `Text shows ${structure.rhythm.complexity > 0.5 ? 'high' : 'moderate'} symbolic complexity. ` +
    `Emphasis on: ${primaryLayers.join(', ')}. ` +
    `Pattern: ${structure.rhythm.pattern.slice(0, 20)}${structure.rhythm.pattern.length > 20 ? '...' : ''}`;
  
  return {
    primaryLayers,
    suggestions,
  };
}
