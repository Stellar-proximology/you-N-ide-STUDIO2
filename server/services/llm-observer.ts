import OpenAI from "openai";

// Lazy-load OpenAI client to avoid startup failures
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
    });
  }
  return openai;
}

export interface SemanticLayer {
  layer: string;
  interpretation: string;
  symbols?: string[];
  qualities?: string[];
}

export interface ParsedSemantics {
  movement: SemanticLayer;
  evolution: SemanticLayer;
  being: SemanticLayer;
  design: SemanticLayer;
  space: SemanticLayer;
  transpersonal: SemanticLayer;
  void: SemanticLayer;
  narrative: string;
  worldAttributes: {
    tone: string;
    mood: string;
    physicalRules: string[];
    visualStyle: string;
  };
  reflectionNotes: string;
}

/**
 * The LLM Observer interprets raw text through the 7-layer semantic framework
 * based on Yi Jing and Human Design metaphysical architecture
 */
export async function observeIdeon(rawText: string, symbolicStructure: any): Promise<ParsedSemantics> {
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
    console.log('[LLM Observer] Calling OpenAI API with model gpt-4o...');
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    console.log('[LLM Observer] Received response from OpenAI');
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return parsed as ParsedSemantics;
  } catch (error) {
    console.error('[LLM Observer] Error:', error);
    throw new Error(`LLM Observer failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate discriminator scores (coherence, resonance, beauty)
 * These represent the "felt sense" of the world
 */
export async function evaluateWorld(narrative: string, worldAttributes: any): Promise<{
  coherenceScore: number;
  resonanceScore: number;
  beautyScore: number;
}> {
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
      max_tokens: 256,
    });

    const scores = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      coherenceScore: Math.max(0, Math.min(100, Math.round(scores.coherenceScore || 50))),
      resonanceScore: Math.max(0, Math.min(100, Math.round(scores.resonanceScore || 50))),
      beautyScore: Math.max(0, Math.min(100, Math.round(scores.beautyScore || 50))),
    };
  } catch (error) {
    return { coherenceScore: 50, resonanceScore: 50, beautyScore: 50 };
  }
}
