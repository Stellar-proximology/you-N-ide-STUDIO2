"""
Element-Codon-Shape-Geometry Mapping
Complete correspondence between periodic table elements, DNA codons, amino acids,
crystal structures, and multi-dimensional geometric perception

Explains why Body/Mind/Heart see different shapes from the same reality
"""

# ============================================================================
# PRIMARY ELEMENTS IN GENETIC CODE
# ============================================================================

GENETIC_ELEMENTS = {
    "C": {
        "name": "Carbon",
        "atomic_number": 6,
        "role": "Structural backbone of all organic molecules",
        "electron_config": "1s² 2s² 2p²",
        "valence": 4,
        "bonding": "Tetrahedral (4 covalent bonds)",
        "crystal_structure": "Diamond (cubic), Graphite (hexagonal)",
        "amino_acids": "ALL (universal in every amino acid)",
        "body_percentage": "18%",
        "shapes": {
            "body_perception": "Tetrahedron (3D structure)",
            "mind_perception": "Hexagon (mental pattern)",
            "heart_perception": "Merkaba / Star Tetrahedron (light body)"
        },
        "consciousness": "Form, structure, manifestation"
    },
    "H": {
        "name": "Hydrogen",
        "atomic_number": 1,
        "role": "Bonding agent, water formation, pH balance",
        "electron_config": "1s¹",
        "valence": 1,
        "bonding": "Single bond",
        "crystal_structure": "Hexagonal (solid state)",
        "amino_acids": "ALL (universal in every amino acid)",
        "body_percentage": "10%",
        "shapes": {
            "body_perception": "Sphere / Point (simplest form)",
            "mind_perception": "Dot / Singularity (unity)",
            "heart_perception": "Infinite radiance (source point)"
        },
        "consciousness": "Unity, primal energy, chi/prana carrier"
    },
    "N": {
        "name": "Nitrogen",
        "atomic_number": 7,
        "role": "Proteins, DNA bases, neurotransmitters",
        "electron_config": "1s² 2s² 2p³",
        "valence": 3,
        "bonding": "Pyramidal (3 bonds + lone pair)",
        "crystal_structure": "Cubic",
        "amino_acids": "ALL (universal), HIGH in Arginine, Lysine, Histidine",
        "body_percentage": "3%",
        "shapes": {
            "body_perception": "Pyramid (3-sided base)",
            "mind_perception": "Triangle (mental trinity)",
            "heart_perception": "Ascending spiral (breath/transformation)"
        },
        "consciousness": "Transformation, flow, planning, breath of mind"
    },
    "O": {
        "name": "Oxygen",
        "atomic_number": 8,
        "role": "Respiration, energy release, water, oxidation",
        "electron_config": "1s² 2s² 2p⁴",
        "valence": 2,
        "bonding": "Bent (in water), linear (in other contexts)",
        "crystal_structure": "Cubic (solid oxygen)",
        "amino_acids": "ALL (universal in every amino acid)",
        "body_percentage": "65%",
        "shapes": {
            "body_perception": "Bent line / V-shape (water molecule)",
            "mind_perception": "Duality / Polarity (yin-yang)",
            "heart_perception": "Breath wave / Vesica Piscis"
        },
        "consciousness": "Qi, breath, letting go, inhalation/exhalation"
    },
    "S": {
        "name": "Sulfur",
        "atomic_number": 16,
        "role": "Disulfide bonds (protein structure), detox",
        "electron_config": "1s² 2s² 2p⁶ 3s² 3p⁴",
        "valence": 2,
        "bonding": "Bridge formation (disulfide bonds)",
        "crystal_structure": "Orthorhombic",
        "amino_acids": "Cysteine (TGT, TGC), Methionine (ATG - START codon)",
        "body_percentage": "0.25%",
        "shapes": {
            "body_perception": "Bridge / Loop (physical connection)",
            "mind_perception": "Infinity symbol (∞) / Figure-8",
            "heart_perception": "Ouroboros (eternal return)"
        },
        "consciousness": "Purification, clarity, metabolic fire"
    },
    "P": {
        "name": "Phosphorus",
        "atomic_number": 15,
        "role": "DNA backbone, ATP (energy currency), membranes",
        "electron_config": "1s² 2s² 2p⁶ 3s² 3p³",
        "valence": 3,
        "bonding": "Phosphate groups (energy transfer)",
        "crystal_structure": "Various (white, red, black phosphorus)",
        "amino_acids": "Not in amino acids directly, but in DNA/RNA backbone",
        "body_percentage": "1%",
        "shapes": {
            "body_perception": "Pentagon (5-carbon ribose ring)",
            "mind_perception": "Star (5-pointed - illuminating spark)",
            "heart_perception": "Blazing sun (spirit spark, metabolism)"
        },
        "consciousness": "Energy resonance, illuminating spark"
    }
}

# ============================================================================
# TRACE ELEMENTS (Essential for body function)
# ============================================================================

TRACE_ELEMENTS = {
    "Ca": {
        "name": "Calcium",
        "atomic_number": 20,
        "role": "Bones, teeth, nerve/muscle signaling",
        "body_percentage": "1.5%",
        "shapes": {
            "body_perception": "Cubic lattice (crystalline structure)",
            "mind_perception": "Grid / Matrix (structural support)",
            "heart_perception": "Crystallized light (solidified form)"
        },
        "consciousness": "Structural stability, crystallization"
    },
    "K": {
        "name": "Potassium",
        "atomic_number": 19,
        "role": "Nerve impulses, heartbeat, cellular balance",
        "body_percentage": "0.25%",
        "shapes": {
            "body_perception": "Lightning bolt (electrical impulse)",
            "mind_perception": "Zigzag (oscillating current)",
            "heart_perception": "Dragon line (qi movement)"
        },
        "consciousness": "Electrical conductor, vitality, movement of qi"
    },
    "Na": {
        "name": "Sodium",
        "atomic_number": 11,
        "role": "Nerve transmission, fluid balance",
        "body_percentage": "0.15%",
        "shapes": {
            "body_perception": "Wave (fluid motion)",
            "mind_perception": "Sine wave (oscillation)",
            "heart_perception": "Ocean tide (emotional flow)"
        },
        "consciousness": "Fluid regulation, fear/essence, polarity balancer"
    },
    "Mg": {
        "name": "Magnesium",
        "atomic_number": 12,
        "role": "Enzyme cofactor (300+ enzymes), ATP activity",
        "body_percentage": "0.05%",
        "shapes": {
            "body_perception": "Hexagonal close-packed (HCP) structure",
            "mind_perception": "Honeycomb (efficiency pattern)",
            "heart_perception": "Harmonic resonator (balances fire & water)"
        },
        "consciousness": "Harmonizer, stabilizer of metabolism"
    },
    "Fe": {
        "name": "Iron",
        "atomic_number": 26,
        "role": "Oxygen transport (hemoglobin), electron transfer",
        "body_percentage": "0.006%",
        "shapes": {
            "body_perception": "Octahedral (coordination complex)",
            "mind_perception": "Cross (cardinal directions)",
            "heart_perception": "Warrior's shield (protection, strength)"
        },
        "consciousness": "Willpower, strength, blood carrier"
    }
}

# ============================================================================
# CODON TO ELEMENT MAPPING
# ============================================================================

def get_amino_acid_elements(amino_acid):
    """
    Returns elemental composition of each amino acid
    Based on molecular formula
    """
    amino_acid_formulas = {
        "Alanine": {"C": 3, "H": 7, "N": 1, "O": 2},
        "Arginine": {"C": 6, "H": 14, "N": 4, "O": 2},  # Nitrogen-rich
        "Asparagine": {"C": 4, "H": 8, "N": 2, "O": 3},
        "Aspartic Acid": {"C": 4, "H": 7, "N": 1, "O": 4},  # Oxygen-rich
        "Cysteine": {"C": 3, "H": 7, "N": 1, "O": 2, "S": 1},  # Contains Sulfur!
        "Glutamine": {"C": 5, "H": 10, "N": 2, "O": 3},
        "Glutamic Acid": {"C": 5, "H": 9, "N": 1, "O": 4},
        "Glycine": {"C": 2, "H": 5, "N": 1, "O": 2},  # Smallest
        "Histidine": {"C": 6, "H": 9, "N": 3, "O": 2},
        "Isoleucine": {"C": 6, "H": 13, "N": 1, "O": 2},
        "Leucine": {"C": 6, "H": 13, "N": 1, "O": 2},
        "Lysine": {"C": 6, "H": 14, "N": 2, "O": 2},
        "Methionine": {"C": 5, "H": 11, "N": 1, "O": 2, "S": 1},  # Contains Sulfur! START codon
        "Phenylalanine": {"C": 9, "H": 11, "N": 1, "O": 2},  # Aromatic (carbon-rich)
        "Proline": {"C": 5, "H": 9, "N": 1, "O": 2},
        "Serine": {"C": 3, "H": 7, "N": 1, "O": 3},
        "Threonine": {"C": 4, "H": 9, "N": 1, "O": 3},
        "Tryptophan": {"C": 11, "H": 12, "N": 2, "O": 2},  # Largest, aromatic
        "Tyrosine": {"C": 9, "H": 11, "N": 1, "O": 3},  # Aromatic
        "Valine": {"C": 5, "H": 11, "N": 1, "O": 2},
        "STOP": {}  # No amino acid
    }
    
    return amino_acid_formulas.get(amino_acid, {})

def get_dominant_element(amino_acid):
    """
    Determine which element is most characteristic of an amino acid
    (beyond the universal C, H, N, O)
    """
    formula = get_amino_acid_elements(amino_acid)
    
    # Check for special elements first
    if "S" in formula:
        return "S"  # Sulfur is rare and significant
    
    # Calculate ratios
    total = sum(formula.values())
    if total == 0:
        return None
        
    ratios = {elem: count/total for elem, count in formula.items()}
    
    # Determine dominant characteristic
    if ratios.get("N", 0) > 0.2:  # High nitrogen
        return "N"
    elif ratios.get("O", 0) > 0.25:  # High oxygen
        return "O"
    elif ratios.get("C", 0) > 0.5:  # Carbon-rich (aromatic)
        return "C"
    elif ratios.get("H", 0) > 0.5:  # Hydrogen-rich (hydrophobic)
        return "H"
    else:
        return "C"  # Default

# ============================================================================
# GEOMETRIC PERCEPTION BY FIELD
# ============================================================================

FIELD_GEOMETRIES = {
    "Body": {
        "name": "Physical/Material Perception",
        "frequency": 1.0,
        "cycle": 12,
        "astrology": "Tropical",
        "dimension": "3D",
        "geometry_style": "Solid polyhedra, physical shapes",
        "examples": {
            "point": "Atom",
            "line": "Bond",
            "triangle": "Trigonal planar",
            "square": "Planar",
            "pentagon": "Ribose ring",
            "hexagon": "Benzene ring",
            "tetrahedron": "Carbon sp³",
            "octahedron": "Iron complex",
            "cube": "Crystal lattice"
        }
    },
    "Mind": {
        "name": "Mental/Conceptual Perception",
        "frequency": 1.33,
        "cycle": 16,
        "astrology": "Sidereal",
        "dimension": "4-5D",
        "geometry_style": "Sacred geometry, archetypal patterns",
        "examples": {
            "point": "Singularity / Unity",
            "line": "Polarity / Duality",
            "triangle": "Trinity",
            "square": "Foundation / Elements",
            "pentagon": "Phi ratio / Golden spiral",
            "hexagon": "Flower of Life",
            "tetrahedron": "Fire element",
            "octahedron": "Air element",
            "cube": "Earth element",
            "icosahedron": "Water element",
            "dodecahedron": "Aether / Universe"
        }
    },
    "Heart": {
        "name": "Emotional/Multidimensional Perception",
        "frequency": 3.33,
        "cycle": 40,
        "astrology": "Draconic",
        "dimension": "6-9D",
        "geometry_style": "Light codes, fractal mandalas, hyperdimensional forms",
        "examples": {
            "point": "Infinite radiance (source)",
            "line": "Breath wave",
            "triangle": "Ascending spiral",
            "square": "Foundation of being",
            "pentagon": "Blazing sun",
            "hexagon": "Sri Yantra (2D slice)",
            "tetrahedron": "Merkaba (star tetrahedron)",
            "octahedron": "Double pyramid (as above, so below)",
            "cube": "Metatron's Cube",
            "hypercube": "Tesseract (4D cube)",
            "9D_cube": "Universe itself"
        }
    }
}

# ============================================================================
# MULTI-DIMENSIONAL SHAPE PERCEPTION
# ============================================================================

def perceive_shape_across_fields(base_shape, element=None):
    """
    Show how the same underlying structure is perceived differently
    by Body, Mind, and Heart fields
    """
    perceptions = {}
    
    for field_name, field_data in FIELD_GEOMETRIES.items():
        perception = {
            "field": field_name,
            "frequency": field_data["frequency"],
            "dimension": field_data["dimension"],
            "shape_seen": field_data["examples"].get(base_shape, "Unknown")
        }
        
        if element and element in GENETIC_ELEMENTS:
            perception["element_shape"] = GENETIC_ELEMENTS[element]["shapes"][f"{field_name.lower()}_perception"]
        
        perceptions[field_name] = perception
    
    return perceptions

# ============================================================================
# THE 9D HYPERCUBE PRINCIPLE
# ============================================================================

DIMENSIONAL_PERCEPTION = {
    "principle": "Lower-dimensional beings see higher-dimensional objects as their dimensional slice",
    "examples": {
        "1D_being_sees_2D": "A line (slice of a square)",
        "2D_being_sees_3D": "A changing shape (square becoming circle = sphere passing through)",
        "3D_being_sees_4D": "Morphing 3D objects (hypercube appears to rotate impossibly)",
        "3D_being_sees_9D": "Sphere/circle (we see the 'shadow' or projection)",
        "9D_being_sees_9D": "Hypercube (the actual structure)"
    },
    "earth_orbit_wobble": {
        "3D_perception": "Ellipse with precession (looks imperfect)",
        "9D_reality": "Perfect hyperdimensional geodesic through 9D spacetime",
        "explanation": "The 'wobble' is us seeing higher dimensions bleed through into 3D"
    },
    "species_differences": {
        "humans": "9 centers → can perceive up to 9D (if fully activated)",
        "dogs": "Different center config → perceive different geometric reality",
        "example": "Same ball appears as different shapes to different species"
    }
}

# ============================================================================
# USAGE EXAMPLES
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("Element-Codon-Shape-Geometry Mapping")
    print("=" * 70)
    
    # Example 1: Carbon perception across fields
    print("\n### Example 1: How Carbon is perceived across Body/Mind/Heart:")
    carbon_perception = perceive_shape_across_fields("hexagon", "C")
    for field, data in carbon_perception.items():
        print(f"\n{field} Field ({data['dimension']}):")
        print(f"  Shape seen: {data['shape_seen']}")
        print(f"  Element perception: {data.get('element_shape', 'N/A')}")
    
    # Example 2: Sulfur (rare element)
    print("\n\n### Example 2: Sulfur (Bridge Builder):")
    print(f"Found in: {GENETIC_ELEMENTS['S']['amino_acids']}")
    print(f"Role: {GENETIC_ELEMENTS['S']['role']}")
    print("\nPerception across fields:")
    for field in ["body_perception", "mind_perception", "heart_perception"]:
        print(f"  {field.replace('_', ' ').title()}: {GENETIC_ELEMENTS['S']['shapes'][field]}")
    
    # Example 3: Amino acid elemental breakdown
    print("\n\n### Example 3: Methionine (START codon) elemental composition:")
    met_elements = get_amino_acid_elements("Methionine")
    print(f"  Formula: {met_elements}")
    print(f"  Dominant special element: {get_dominant_element('Methionine')}")
    print(f"  Significance: Contains SULFUR - bridge/connection energy")
    
    # Example 4: 9D perception
    print("\n\n### Example 4: Why we see circles but reality is hypercubes:")
    print(DIMENSIONAL_PERCEPTION["earth_orbit_wobble"]["explanation"])
    
    print("\n✨ Multi-dimensional perception explained! 🌊")
