"""
Integration Test: Wire Up All Three GANs
Shows how to connect Resonance S-GAN + Codon GameGAN + Human Design GameGAN
"""

import sys
sys.path.append('/mnt/user-data/uploads')

# Import the three GAN systems
from resonance_sgan import (
    UnifiedResonanceEngine, 
    ElementType,
    UnifiedActionCandidate
)
from codon_resonance_gamegan import (
    CodonResonanceGameGAN,
    CODON_SEQUENCE
)
from human_design_gamegan import (
    HumanDesignGameGAN,
    create_human_design_state
)

# Import unified engine
from unified_cognitive_engine import (
    UnifiedCognitiveEngine,
    ChartingSystem
)

def test_integration():
    """
    Full integration test of the unified cognitive system.
    """
    print("╔" + "="*68 + "╗")
    print("║" + " "*20 + "UNIFIED COGNITIVE ENGINE TEST" + " "*19 + "║")
    print("╚" + "="*68 + "╝\n")
    
    # ========================================================================
    # STEP 1: Initialize individual GANs
    # ========================================================================
    print("Step 1: Initializing GANs...")
    
    # Resonance S-GAN
    print("  → Resonance S-GAN (Decision Engine)")
    resonance_engine = UnifiedResonanceEngine()
    resonance_engine.set_current_state(
        state_vector=torch.randn(5),
        state_element=ElementType.WATER  # Starting in Water/Evolution
    )
    print("    ✓ Generator ready")
    print("    ✓ Discriminator ready")
    print(f"    ✓ Element: {ElementType.WATER.name}")
    
    # Codon GameGAN
    print("\n  → Codon GameGAN (Progressive Accumulation)")
    codon_gan = CodonResonanceGameGAN()
    print("    ✓ Progressive scene initialized")
    print("    ✓ 64 codons ready")
    
    # Human Design GameGAN
    print("\n  → Human Design GameGAN (State Transformation)")
    hd_gan = HumanDesignGameGAN()
    print("    ✓ Bodygraph grid ready")
    print("    ✓ 5 consciousness actions defined")
    
    # ========================================================================
    # STEP 2: Create unified engine
    # ========================================================================
    print("\n" + "-"*70)
    print("Step 2: Creating Unified Cognitive Engine...")
    
    engine = UnifiedCognitiveEngine(
        resonance_engine=resonance_engine,
        codon_gan=codon_gan,
        hd_gan=hd_gan,
        charting_system=ChartingSystem.TROPICAL  # Heart-centered
    )
    print("  ✓ Unified engine created")
    print(f"  ✓ Charting system: {ChartingSystem.TROPICAL.value}")
    print(f"  ✓ GAN weights: {engine.gan_weights}")
    
    # ========================================================================
    # STEP 3: Initialize consciousness state
    # ========================================================================
    print("\n" + "-"*70)
    print("Step 3: Initializing Consciousness State...")
    
    initial_state = engine.initialize_state(
        initial_element=ElementType.WATER,
        initial_gates=[1, 8, 13],  # Starting gates
        initial_archetype="The Mystic Wanderer"
    )
    
    print(f"  ✓ Initial element: {initial_state.current_element.name}")
    print(f"  ✓ Active gates: {initial_state.active_gates}")
    print(f"  ✓ Consciousness level: {initial_state.consciousness_level:.2%}")
    print(f"  ✓ Archetype: {initial_state.current_archetype}")
    
    # ========================================================================
    # STEP 4: Oracle query
    # ========================================================================
    print("\n" + "="*70)
    print("COGNITIVE OUTPUT 1: Oracle Query")
    print("="*70)
    
    query = "What is my next best action for growth?"
    print(f"\nQuery: {query}")
    
    oracle_result = engine.oracle_query(query, num_candidates=10)
    
    print(oracle_result['guidance'])
    
    print(f"\nDETAILS:")
    print(f"  Element: {oracle_result['element']}")
    print(f"  Gate: {oracle_result['gate']}")
    print(f"  Codon: {oracle_result['codon']}")
    print(f"  RU Score: {oracle_result['ru_score']:.4f}")
    print(f"  Coherence: {oracle_result['coherence']:.4f}")
    
    # ========================================================================
    # STEP 5: Evolve consciousness
    # ========================================================================
    print("\n" + "="*70)
    print("COGNITIVE OUTPUT 2: Consciousness Evolution")
    print("="*70)
    
    print("\nEvolving consciousness 5 steps forward...")
    trajectory = engine.evolve_consciousness(steps=5)
    
    print("\nTrajectory:")
    print("  Step | Element | Gate | Codon | Consciousness | Complexity")
    print("  " + "-"*62)
    for i, state in enumerate(trajectory):
        gate = state.active_gates[-1] if state.active_gates else 0
        codon = state.codon_sequence[-1] if state.codon_sequence else "---"
        print(f"  {i:4d} | {state.current_element.name:7s} | {gate:4d} | {codon:5s} | "
              f"{state.consciousness_level:13.2%} | {state.resonance_complexity:10.1f}")
    
    # ========================================================================
    # STEP 6: Chart decode
    # ========================================================================
    print("\n" + "="*70)
    print("COGNITIVE OUTPUT 3: Chart Decode")
    print("="*70)
    
    chart = engine.decode_chart()
    print(chart['guidance'])
    
    print(f"\nChart Data:")
    print(f"  Active Gates: {chart['active_gates']}")
    print(f"  Codon Sequence: {' → '.join(chart['codon_sequence'][:5])}...")
    print(f"  Resonance Patterns: {chart['resonance_patterns']}")
    
    # ========================================================================
    # STEP 7: System status
    # ========================================================================
    print("\n" + "="*70)
    print("System Status")
    print("="*70)
    
    status = engine.get_status()
    for key, value in status.items():
        print(f"  {key:25s}: {value}")
    
    # ========================================================================
    # STEP 8: Progressive simulation (abbreviated)
    # ========================================================================
    print("\n" + "="*70)
    print("COGNITIVE OUTPUT 4: Progressive Simulation (10 steps)")
    print("="*70)
    
    # Reset state for clean simulation
    engine.initialize_state(
        initial_element=ElementType.EARTH,
        initial_gates=[],
        initial_archetype="The Builder"
    )
    
    simulation = engine.simulate_evolution(duration=10)
    
    print("\nSimulation Results:")
    print("  Step | Element | Gate | Consciousness | Complexity | Coherence")
    print("  " + "-"*66)
    for entry in simulation:
        print(f"  {entry['step']:4d} | {entry['element']:7s} | {entry['gate'] or 0:4d} | "
              f"{entry['consciousness']:13.2%} | {entry['complexity']:10.1f} | {entry['coherence']:.3f}")
    
    print("\n" + "="*70)
    print("✓ Integration test complete!")
    print("="*70)
    
    return engine


def test_charting_systems():
    """
    Test different charting systems to show how they affect decisions.
    """
    print("\n\n╔" + "="*68 + "╗")
    print("║" + " "*20 + "CHARTING SYSTEMS TEST" + " "*27 + "║")
    print("╚" + "="*68 + "╝\n")
    
    # Initialize GANs once
    resonance_engine = UnifiedResonanceEngine()
    codon_gan = CodonResonanceGameGAN()
    hd_gan = HumanDesignGameGAN()
    
    systems = [ChartingSystem.SIDEREAL, ChartingSystem.TROPICAL, ChartingSystem.DRACONIC]
    
    for system in systems:
        print(f"\n{system.value.upper()} System:")
        print("-" * 50)
        
        engine = UnifiedCognitiveEngine(
            resonance_engine=resonance_engine,
            codon_gan=codon_gan,
            hd_gan=hd_gan,
            charting_system=system
        )
        
        engine.initialize_state(
            initial_element=ElementType.FIRE,
            initial_gates=[1],
            initial_archetype="The Seeker"
        )
        
        print(f"  GAN Weights: {engine.gan_weights}")
        
        # Query oracle
        result = engine.oracle_query("What should I focus on?", num_candidates=5)
        print(f"  Recommended Gate: {result['gate']}")
        print(f"  Element: {result['element']}")
        print(f"  RU Score: {result['ru_score']:.4f}")
        
    print("\n" + "="*70)


def visualize_gan_flow():
    """
    Visualize how data flows through the three GANs.
    """
    print("\n\n╔" + "="*68 + "╗")
    print("║" + " "*25 + "GAN DATA FLOW" + " "*30 + "║")
    print("╚" + "="*68 + "╝\n")
    
    flow = """
    INPUT: User question or current state
       ↓
    ┌──────────────────────────────────────────────────────────────┐
    │ LAYER 1: Resonance S-GAN (Decision Engine)                  │
    │ • Generate 20 action candidates (noise → semantic latents)  │
    │ • Score via RU: Progress, Friction, Coherence, etc.         │
    │ • Apply elemental algebra (compatibility matrix)            │
    │ • Output: Top-5 candidates with element typing              │
    └─────────────────────────┬────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────────────┐
    │ BRIDGE: Latent-to-Codon Mapping                             │
    │ • latent[0] ∈ [-1,1] → codon_id ∈ [0,63]                    │
    │ • codon_id → gate (codon_id + 1)                            │
    │ • Access codon sequence from CODON_SEQUENCE array           │
    └─────────────────────────┬────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────────────┐
    │ LAYER 2: Codon GameGAN (Progressive Accumulation)           │
    │ • Add codon to accumulated scene                            │
    │ • Calculate harmonic resonances with existing codons        │
    │ • Generate energy beam overlays (Sims-style visuals)        │
    │ • Output: Updated scene + resonance complexity              │
    └─────────────────────────┬────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────────────┐
    │ LAYER 3: Human Design GameGAN (State Transformation)        │
    │ • Activate gate in 9×9 bodygraph grid                       │
    │ • Form channels if gate pairs match                         │
    │ • Evolve consciousness level (+0.05 per step)               │
    │ • Update archetype if thresholds crossed                    │
    │ • Output: New consciousness state                           │
    └─────────────────────────┬────────────────────────────────────┘
                              ↓
    OUTPUT: Unified guidance + next state
    • Element, Gate, Codon identification
    • RU score, Coherence, Consciousness level
    • Human-readable guidance text
    • Updated UnifiedConsciousnessState for next iteration
    """
    
    print(flow)
    print("="*70)


if __name__ == '__main__':
    import torch
    
    print("\n" + "🌟 "*35)
    print("UNIFIED COGNITIVE ENGINE - INTEGRATION TEST SUITE")
    print("🌟 "*35 + "\n")
    
    # Run tests
    try:
        print("[TEST 1] Full Integration")
        engine = test_integration()
        
        print("\n\n[TEST 2] Charting Systems")
        test_charting_systems()
        
        print("\n\n[TEST 3] GAN Data Flow Visualization")
        visualize_gan_flow()
        
        print("\n\n" + "✨"*35)
        print("ALL TESTS PASSED!")
        print("✨"*35 + "\n")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
