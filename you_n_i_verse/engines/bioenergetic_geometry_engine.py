"""
BIOENERGETIC GEOMETRY ENGINE
Complete Element-Codon-Shape-Field Architecture

The Rosetta Stone connecting:
- DNA codons (genetic code)
- Chemical elements (material substrate)
- Geometric patterns (structural templates)
- Field perception (consciousness filters)

This is THE CORE LOGIC for GAN/LLM field-aware generation
"""

import json
import numpy as np

# ============================================================================
# THE 9-FIELD PERCEPTION MATRIX
# ============================================================================

FIELD_PERCEPTION = {
    "Body": {
        "frequency": 1.0,
        "cycle": 12,
        "astrology": "Tropical",
        "dimension": "3D",
        "perception_style": "Physical form, material structure",
        "visual_palette": "Solid shapes, textures, physical objects",
        "linguistic_tone": "Concrete, sensory, embodied",
        "color_range": "Earth tones, warm solids",
        "geometry_preference": "Polyhedra, crystals, physical structures"
    },
    "Mind": {
        "frequency": 1.33,
        "cycle": 16,
        "astrology": "Sidereal",
        "dimension": "4-5D",
        "perception_style": "Symbolic, conceptual, archetypal",
        "visual_palette": "Sacred geometry, patterns, symbols",
        "linguistic_tone": "Analytical, metaphorical, structural",
        "color_range": "Cool blues, purples, silver",
        "geometry_preference": "Sacred geometry, Platonic solids, mandalas"
    },
    "Heart": {
        "frequency": 3.33,
        "cycle": 40,
        "astrology": "Draconic",
        "dimension": "6-9D",
        "perception_style": "Energetic, emotional, relational",
        "visual_palette": "Fractals, light codes, dynamic flows",
        "linguistic_tone": "Poetic, feeling-centered, connective",
        "color_range": "Warm golds, magentas, rainbow spectrum",
        "geometry_preference": "Star tetrahedrons, merkabas, spirals"
    },
    "Soul": {
        "frequency": 5.0,
        "cycle": None,
        "astrology": "Harmonic",
        "dimension": "7-9D",
        "perception_style": "Waveform resonance, vibrational",
        "visual_palette": "Standing waves, interference patterns, pulses",
        "linguistic_tone": "Rhythmic, vibrational, harmonic",
        "color_range": "Translucent, iridescent, shifting",
        "geometry_preference": "Sine waves, Lissajous figures, harmonics"
    },
    "Spirit": {
        "frequency": 8.0,
        "cycle": None,
        "astrology": "Galactic",
        "dimension": "8-9D",
        "perception_style": "Sacred harmonics, transcendent",
        "visual_palette": "Mandalas, fractals, light geometries",
        "linguistic_tone": "Universal, archetypal, transcendent",
        "color_range": "Pure white, gold, celestial blues",
        "geometry_preference": "Sri Yantra, Metatron's Cube, cosmic mandalas"
    },
    "Shadow": {
        "frequency": None,
        "cycle": None,
        "astrology": None,
        "dimension": "Distorted 3D",
        "perception_style": "Inverted, contracted, distorted",
        "visual_palette": "Twisted forms, voids, broken patterns",
        "linguistic_tone": "Defensive, contracted, protective",
        "color_range": "Muted, murky, browns, grays",
        "geometry_preference": "Broken shapes, inverted forms, jagged edges"
    },
    "Light": {
        "frequency": None,
        "cycle": None,
        "astrology": None,
        "dimension": "Reflective",
        "perception_style": "Reflective, clarifying, illuminating",
        "visual_palette": "Mirrors, lenses, prisms, radiance",
        "linguistic_tone": "Clear, direct, illuminating",
        "color_range": "Bright whites, clear colors, prisms",
        "geometry_preference": "Mirrors, lenses, refractive forms"
    },
    "Void": {
        "frequency": 0.0,
        "cycle": None,
        "astrology": None,
        "dimension": "Non-dimensional",
        "perception_style": "Emptiness, silence, potential",
        "visual_palette": "Empty space, darkness, stillness",
        "linguistic_tone": "Silent, spacious, minimal",
        "color_range": "Black, transparent, absence of color",
        "geometry_preference": "Empty space, points, silence"
    },
    "Unity": {
        "frequency": float('inf'),
        "cycle": 1,
        "astrology": "All systems unified",
        "dimension": "All dimensions (9D hypercube)",
        "perception_style": "All-pattern and no-pattern simultaneously",
        "visual_palette": "Everything and nothing, paradox",
        "linguistic_tone": "Paradoxical, transcendent, unified",
        "color_range": "All colors and no color",
        "geometry_preference": "Hypercube, infinite tessellation, all forms"
    }
}

# ============================================================================
# ELEMENT-CODON-SHAPE-FIELD ARCHITECTURE
# ============================================================================

ELEMENT_ARCHITECTURE = {
    # PRIMARY ELEMENTS (in DNA/proteins)
    "C": {
        "name": "Carbon",
        "atomic_number": 6,
        "body_percentage": "18%",
        "biological_role": "Structural backbone of all organic molecules",
        "codon_connection": "Universal to all amino acids",
        "molecular_geometry": {
            "primary": "Tetrahedral (sp³)",
            "secondary": "Hexagonal (aromatic rings like benzene)",
            "tertiary": "Linear (sp), Trigonal (sp²)"
        },
        "field_perception": {
            "Body": {
                "shape": "Tetrahedron",
                "description": "Physical 3D structure, solid form",
                "GAN_prompt": "solid geometric structure, crystalline forms, physical matter",
                "LLM_tone": "structured, foundational, embodied"
            },
            "Mind": {
                "shape": "Hexagon / Flower of Life",
                "description": "Symbolic pattern, mental architecture",
                "GAN_prompt": "hexagonal patterns, honeycomb structures, sacred geometry",
                "LLM_tone": "patterned, systematic, interconnected"
            },
            "Heart": {
                "shape": "Merkaba / Star Tetrahedron",
                "description": "Light body, energetic vehicle",
                "GAN_prompt": "star tetrahedron, merkaba, light body geometries",
                "LLM_tone": "transcendent, vehicle of consciousness, light-filled"
            },
            "Soul": {
                "shape": "Fractal branching",
                "description": "Organic growth patterns, tree of life",
                "GAN_prompt": "fractal trees, organic branching, natural growth",
                "LLM_tone": "organic, expanding, self-similar"
            },
            "Spirit": {
                "shape": "Metatron's Cube",
                "description": "All Platonic solids nested",
                "GAN_prompt": "Metatron's cube, nested geometries, cosmic blueprints",
                "LLM_tone": "universal template, cosmic architecture, divine blueprint"
            }
        },
        "consciousness_quality": "Form, structure, manifestation"
    },
    
    "H": {
        "name": "Hydrogen",
        "atomic_number": 1,
        "body_percentage": "10%",
        "biological_role": "Bonding agent, water formation, pH balance, chi/prana carrier",
        "codon_connection": "Universal to all amino acids",
        "molecular_geometry": {
            "primary": "Spherical (single electron)",
            "secondary": "Point (simplest atom)"
        },
        "field_perception": {
            "Body": {
                "shape": "Sphere / Droplet",
                "description": "Water molecule, fluid form",
                "GAN_prompt": "water droplets, spheres, flowing liquid",
                "LLM_tone": "fluid, adaptive, flowing"
            },
            "Mind": {
                "shape": "Point / Dot",
                "description": "Unity, singularity, beginning",
                "GAN_prompt": "single points, dots, minimalist marks",
                "LLM_tone": "simple, essential, primordial"
            },
            "Heart": {
                "shape": "Infinite radiance",
                "description": "Source point, all-permeating presence",
                "GAN_prompt": "radiant light source, omnidirectional glow",
                "LLM_tone": "infinite, source, all-permeating presence"
            },
            "Soul": {
                "shape": "Pulsing sphere",
                "description": "Breath, life force",
                "GAN_prompt": "pulsing orbs, breathing spheres, rhythmic expansion",
                "LLM_tone": "vital, breath-like, life-giving"
            },
            "Spirit": {
                "shape": "Pure light",
                "description": "Luminous essence",
                "GAN_prompt": "pure white light, luminous essence, divine spark",
                "LLM_tone": "luminous, essential, pure"
            }
        },
        "consciousness_quality": "Unity, primal energy, life force"
    },
    
    "N": {
        "name": "Nitrogen",
        "atomic_number": 7,
        "body_percentage": "3%",
        "biological_role": "Proteins, DNA bases, neurotransmitters, breath of mind",
        "codon_connection": "Rich in basic amino acids (Arginine, Lysine, Histidine)",
        "molecular_geometry": {
            "primary": "Trigonal pyramidal (3 bonds + lone pair)",
            "secondary": "Linear (in some compounds)"
        },
        "field_perception": {
            "Body": {
                "shape": "Pyramid (3-sided)",
                "description": "Triangular base structure",
                "GAN_prompt": "pyramids, triangular structures, three-sided forms",
                "LLM_tone": "stable, triadic, grounded"
            },
            "Mind": {
                "shape": "Triangle / Trinity",
                "description": "Mental trinity, dialectic",
                "GAN_prompt": "triangles, trinity symbols, triadic patterns",
                "LLM_tone": "dialectical, trinity-based, three-fold reasoning"
            },
            "Heart": {
                "shape": "Ascending spiral",
                "description": "Breath upward, transformation",
                "GAN_prompt": "ascending spirals, upward helices, transformative movement",
                "LLM_tone": "ascending, transformative, breath-centered"
            },
            "Soul": {
                "shape": "Wind current",
                "description": "Invisible flow, breath",
                "GAN_prompt": "flowing air currents, wind patterns, invisible movement",
                "LLM_tone": "flowing, invisible, breath of life"
            },
            "Spirit": {
                "shape": "Pneuma / Holy Spirit",
                "description": "Sacred breath, divine wind",
                "GAN_prompt": "divine breath imagery, sacred wind, holy spirit symbols",
                "LLM_tone": "sacred breath, inspired, divinely moved"
            }
        },
        "consciousness_quality": "Transformation, flow, planning, breath of mind"
    },
    
    "O": {
        "name": "Oxygen",
        "atomic_number": 8,
        "body_percentage": "65%",
        "biological_role": "Respiration, energy release, water, oxidation, letting go",
        "codon_connection": "Universal to all amino acids",
        "molecular_geometry": {
            "primary": "Bent (in H₂O)",
            "secondary": "Linear (in O₂)"
        },
        "field_perception": {
            "Body": {
                "shape": "Bent line / V-shape",
                "description": "Water molecule geometry",
                "GAN_prompt": "bent lines, V-shapes, angular water molecules",
                "LLM_tone": "angular, dual, water-like"
            },
            "Mind": {
                "shape": "Duality / Polarity",
                "description": "Yin-yang, opposites",
                "GAN_prompt": "yin-yang, polarity symbols, dualistic forms",
                "LLM_tone": "dualistic, polar, balanced opposites"
            },
            "Heart": {
                "shape": "Breath wave / Vesica Piscis",
                "description": "Inhalation/exhalation, emotional tide",
                "GAN_prompt": "wave forms, vesica piscis, breathing rhythms",
                "LLM_tone": "rhythmic, tidal, breath-centered"
            },
            "Soul": {
                "shape": "Sine wave",
                "description": "Respiratory cycle, life rhythm",
                "GAN_prompt": "sine waves, respiratory patterns, rhythmic oscillations",
                "LLM_tone": "cyclical, rhythmic, life-breathing"
            },
            "Spirit": {
                "shape": "Cosmic breath",
                "description": "Universe breathing",
                "GAN_prompt": "cosmic expansion/contraction, universal breathing",
                "LLM_tone": "universal breath, cosmic rhythm, divine respiration"
            }
        },
        "consciousness_quality": "Qi, breath, letting go, release"
    },
    
    "S": {
        "name": "Sulfur",
        "atomic_number": 16,
        "body_percentage": "0.25%",
        "biological_role": "Disulfide bonds (protein loops), detoxification, purification",
        "codon_connection": "Cysteine (TGT, TGC), Methionine (ATG - START codon)",
        "molecular_geometry": {
            "primary": "Bridge / Loop (disulfide bonds)",
            "secondary": "Angular (similar to oxygen)"
        },
        "field_perception": {
            "Body": {
                "shape": "Bridge / Physical loop",
                "description": "Connecting structure, protein fold",
                "GAN_prompt": "bridges, loops, connected structures",
                "LLM_tone": "connecting, binding, structural link"
            },
            "Mind": {
                "shape": "Infinity symbol (∞)",
                "description": "Recursion, eternal return",
                "GAN_prompt": "infinity symbols, figure-8 patterns, recursive loops",
                "LLM_tone": "recursive, cyclic, self-referential"
            },
            "Heart": {
                "shape": "Ouroboros",
                "description": "Karmic loop, eternal cycle",
                "GAN_prompt": "ouroboros, serpent eating tail, karmic circles",
                "LLM_tone": "karmic, cyclical, eternal return"
            },
            "Soul": {
                "shape": "Möbius strip",
                "description": "Non-orientable surface, paradox",
                "GAN_prompt": "möbius strips, twisted loops, paradoxical forms",
                "LLM_tone": "paradoxical, non-dual, twisted wisdom"
            },
            "Spirit": {
                "shape": "Alchemical sulfur",
                "description": "Purifying fire, transformation",
                "GAN_prompt": "alchemical symbols, purifying flames, transformation",
                "LLM_tone": "alchemical, purifying, transformative fire"
            }
        },
        "consciousness_quality": "Purification, clarity, metabolic fire, karmic loops"
    },
    
    "P": {
        "name": "Phosphorus",
        "atomic_number": 15,
        "body_percentage": "1%",
        "biological_role": "DNA backbone, ATP energy currency, memory storage",
        "codon_connection": "Not in amino acids, but in DNA/RNA backbone",
        "molecular_geometry": {
            "primary": "Tetrahedral (phosphate groups)",
            "secondary": "Forked/branching"
        },
        "field_perception": {
            "Body": {
                "shape": "Pentagon (ribose ring)",
                "description": "5-carbon sugar structure",
                "GAN_prompt": "pentagons, 5-pointed forms, ribose structures",
                "LLM_tone": "structural, foundational, energetic backbone"
            },
            "Mind": {
                "shape": "Star (5-pointed)",
                "description": "Illuminating spark, mental energy",
                "GAN_prompt": "5-pointed stars, pentacles, illuminating symbols",
                "LLM_tone": "illuminating, sharp, mentally energizing"
            },
            "Heart": {
                "shape": "Blazing sun",
                "description": "Spirit spark, metabolism",
                "GAN_prompt": "blazing suns, radiant stars, metabolic fire",
                "LLM_tone": "blazing, metabolic, spirit-driven"
            },
            "Soul": {
                "shape": "Lightning bolt",
                "description": "Electric spark, sudden insight",
                "GAN_prompt": "lightning bolts, electric sparks, sudden flashes",
                "LLM_tone": "electric, sudden, insight-bringing"
            },
            "Spirit": {
                "shape": "Divine spark",
                "description": "Prometheus fire, creative force",
                "GAN_prompt": "divine sparks, prometheus fire, creative lightning",
                "LLM_tone": "creative force, divine fire, inspired spark"
            }
        },
        "consciousness_quality": "Energy resonance, illuminating spark, memory"
    },
    
    # TRACE ELEMENTS
    "Ca": {
        "name": "Calcium",
        "atomic_number": 20,
        "body_percentage": "1.5%",
        "biological_role": "Bones, teeth, muscle/nerve signaling, structural support",
        "field_perception": {
            "Body": {"shape": "Cubic lattice", "GAN_prompt": "cubic crystals, lattice structures", "LLM_tone": "solid, structured, foundational"},
            "Mind": {"shape": "Grid / Matrix", "GAN_prompt": "grids, matrices, structural frameworks", "LLM_tone": "organized, systematic, supportive"},
            "Heart": {"shape": "Crystallized light", "GAN_prompt": "light crystals, solidified radiance", "LLM_tone": "solidified presence, embodied light"},
            "Spirit": {"shape": "Divine architecture", "GAN_prompt": "sacred architecture, divine structures", "LLM_tone": "eternal structure, divine form"}
        },
        "consciousness_quality": "Structural stability, crystallization of consciousness"
    },
    
    "K": {
        "name": "Potassium",
        "atomic_number": 19,
        "body_percentage": "0.25%",
        "biological_role": "Nerve impulses, heartbeat, cellular electrical balance",
        "field_perception": {
            "Body": {"shape": "Lightning bolt", "GAN_prompt": "lightning, electrical discharge", "LLM_tone": "electric, impulsive, quick"},
            "Mind": {"shape": "Zigzag", "GAN_prompt": "zigzag patterns, oscillating lines", "LLM_tone": "alternating, oscillating, signal-based"},
            "Heart": {"shape": "Dragon line", "GAN_prompt": "dragon lines, ley lines, qi pathways", "LLM_tone": "vital current, life force pathways"},
            "Soul": {"shape": "Electrical arc", "GAN_prompt": "electric arcs, plasma flows", "LLM_tone": "flowing current, vital spark"}
        },
        "consciousness_quality": "Electrical conductor, vitality, movement of qi"
    },
    
    "Na": {
        "name": "Sodium",
        "atomic_number": 11,
        "body_percentage": "0.15%",
        "biological_role": "Nerve transmission, fluid balance, blood pressure",
        "field_perception": {
            "Body": {"shape": "Wave", "GAN_prompt": "fluid waves, ocean currents", "LLM_tone": "flowing, balanced, liquid"},
            "Mind": {"shape": "Sine wave", "GAN_prompt": "sine waves, mathematical oscillations", "LLM_tone": "oscillating, balancing, rhythmic"},
            "Heart": {"shape": "Ocean tide", "GAN_prompt": "tides, emotional waves, lunar pull", "LLM_tone": "tidal, emotional, lunar-influenced"},
            "Soul": {"shape": "Fluid current", "GAN_prompt": "flowing currents, water streams", "LLM_tone": "fluid essence, emotional flow"}
        },
        "consciousness_quality": "Fluid regulation, emotional balance, polarity"
    },
    
    "Mg": {
        "name": "Magnesium",
        "atomic_number": 12,
        "body_percentage": "0.05%",
        "biological_role": "Enzyme cofactor (300+ enzymes), ATP activity, relaxation",
        "field_perception": {
            "Body": {"shape": "Hexagonal close-packed", "GAN_prompt": "hexagonal packing, honeycomb", "LLM_tone": "efficient, packed, organized"},
            "Mind": {"shape": "Honeycomb", "GAN_prompt": "honeycombs, hexagonal efficiency", "LLM_tone": "efficient, sweet, organized flow"},
            "Heart": {"shape": "Harmonic resonator", "GAN_prompt": "resonance patterns, harmonic forms", "LLM_tone": "harmonizing, balancing, resonant"},
            "Spirit": {"shape": "Catalyst form", "GAN_prompt": "catalytic symbols, enabling forms", "LLM_tone": "catalyzing, enabling, facilitating"}
        },
        "consciousness_quality": "Harmonizer, stabilizer of metabolism, catalyst"
    },
    
    "Fe": {
        "name": "Iron",
        "atomic_number": 26,
        "body_percentage": "0.006%",
        "biological_role": "Oxygen transport (hemoglobin), electron transfer, blood",
        "field_perception": {
            "Body": {"shape": "Octahedral complex", "GAN_prompt": "octahedrons, 8-sided forms, heme structures", "LLM_tone": "carrying, transporting, blood-like"},
            "Mind": {"shape": "Cross (cardinal directions)", "GAN_prompt": "crosses, cardinal points, directional symbols", "LLM_tone": "directional, centered, balanced"},
            "Heart": {"shape": "Warrior's shield", "GAN_prompt": "shields, protective symbols, warrior forms", "LLM_tone": "protective, strong, warrior-like"},
            "Shadow": {"shape": "Rust / Corrosion", "GAN_prompt": "rust, corrosion, decay", "LLM_tone": "corroded, weakened, decaying"}
        },
        "consciousness_quality": "Willpower, strength, blood carrier, protection"
    }
}

# ============================================================================
# GAN PROMPT GENERATOR
# ============================================================================

def generate_GAN_prompt(dominant_field, active_elements, coherence_score):
    """
    Generate field-aware visual prompt for GAN
    Based on oscillator state + element composition
    """
    field_data = FIELD_PERCEPTION[dominant_field]
    
    # Base palette
    prompt_parts = [
        f"Style: {field_data['visual_palette']}",
        f"Geometry: {field_data['geometry_preference']}",
        f"Colors: {field_data['color_range']}"
    ]
    
    # Add element-specific shapes
    for element in active_elements:
        if element in ELEMENT_ARCHITECTURE:
            elem_data = ELEMENT_ARCHITECTURE[element]
            if dominant_field in elem_data.get("field_perception", {}):
                elem_prompt = elem_data["field_perception"][dominant_field]["GAN_prompt"]
                prompt_parts.append(f"Element {element}: {elem_prompt}")
    
    # Adjust based on coherence
    if coherence_score > 0.8:
        prompt_parts.append("High coherence: clear, well-defined, harmonious")
    elif coherence_score < 0.4:
        prompt_parts.append("Low coherence: fragmented, distorted, chaotic")
    
    return " | ".join(prompt_parts)

# ============================================================================
# LLM TONE FILTER
# ============================================================================

def generate_LLM_tone_filter(dominant_field, active_elements, coherence_score):
    """
    Generate field-aware linguistic tone for LLM
    Based on oscillator state + element composition
    """
    field_data = FIELD_PERCEPTION[dominant_field]
    
    tone_profile = {
        "field": dominant_field,
        "base_tone": field_data["linguistic_tone"],
        "perception_style": field_data["perception_style"],
        "element_influences": []
    }
    
    # Add element-specific tones
    for element in active_elements:
        if element in ELEMENT_ARCHITECTURE:
            elem_data = ELEMENT_ARCHITECTURE[element]
            if dominant_field in elem_data.get("field_perception", {}):
                elem_tone = elem_data["field_perception"][dominant_field]["LLM_tone"]
                tone_profile["element_influences"].append({
                    "element": element,
                    "tone": elem_tone
                })
    
    # Coherence adjustment
    if coherence_score > 0.8:
        tone_profile["coherence_modifier"] = "Clear, integrated, flowing"
    elif coherence_score < 0.4:
        tone_profile["coherence_modifier"] = "Fragmented, uncertain, searching"
    else:
        tone_profile["coherence_modifier"] = "Balanced, exploring, nuanced"
    
    return tone_profile

# ============================================================================
# INTEGRATION WITH OSCILLATOR
# ============================================================================

def get_consciousness_state(oscillator_state, active_codons):
    """
    Translate oscillator state + codon activations into
    complete consciousness state for GAN/LLM filtering
    
    Args:
        oscillator_state: Output from consciousness_oscillator.py
        active_codons: List of currently active codons from birth chart
    
    Returns:
        Complete state vector for generation filtering
    """
    # Get dominant field from oscillator
    dominant_field = oscillator_state["dominant_field"]
    coherence = oscillator_state["coherence"]["global"]
    
    # Map codons to elements
    active_elements = []
    for codon in active_codons:
        # TODO: Map codon → amino acid → dominant element
        # For now, placeholder
        pass
    
    # Example: assume some elements are active
    active_elements = ["C", "H", "S"]  # Placeholder
    
    # Generate prompts
    gan_prompt = generate_GAN_prompt(dominant_field, active_elements, coherence)
    llm_tone = generate_LLM_tone_filter(dominant_field, active_elements, coherence)
    
    return {
        "timestamp": oscillator_state["timestamp"],
        "dominant_field": dominant_field,
        "coherence": coherence,
        "active_elements": active_elements,
        "GAN_prompt": gan_prompt,
        "LLM_tone": llm_tone
    }

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("BIOENERGETIC GEOMETRY ENGINE")
    print("Element-Codon-Shape-Field Architecture")
    print("=" * 70)
    
    # Example: Body field with Carbon dominant
    print("\n### Example 1: Body Field + Carbon (Structure)")
    print("Dominant Field: Body")
    print("Active Element: Carbon")
    print("\nCarbon in Body Field:")
    c_body = ELEMENT_ARCHITECTURE["C"]["field_perception"]["Body"]
    print(f"  Shape: {c_body['shape']}")
    print(f"  Description: {c_body['description']}")
    print(f"  GAN Prompt: {c_body['GAN_prompt']}")
    print(f"  LLM Tone: {c_body['LLM_tone']}")
    
    # Example: Heart field with Sulfur dominant
    print("\n### Example 2: Heart Field + Sulfur (Karmic Loop)")
    print("Dominant Field: Heart")
    print("Active Element: Sulfur")
    print("\nSulfur in Heart Field:")
    s_heart = ELEMENT_ARCHITECTURE["S"]["field_perception"]["Heart"]
    print(f"  Shape: {s_heart['shape']}")
    print(f"  Description: {s_heart['description']}")
    print(f"  GAN Prompt: {s_heart['GAN_prompt']}")
    print(f"  LLM Tone: {s_heart['LLM_tone']}")
    
    # Example: Generate full prompt
    print("\n### Example 3: Full GAN Prompt Generation")
    gan_prompt = generate_GAN_prompt("Heart", ["C", "S", "N"], 0.85)
    print(f"\nGenerated GAN Prompt:\n{gan_prompt}")
    
    # Example: Generate LLM tone
    print("\n### Example 4: LLM Tone Filter")
    llm_tone = generate_LLM_tone_filter("Heart", ["C", "S", "N"], 0.85)
    print(f"\nGenerated LLM Tone Profile:")
    print(json.dumps(llm_tone, indent=2))
    
    print("\n✨ Bioenergetic Geometry Engine ready for GAN/LLM integration! 🌊")
