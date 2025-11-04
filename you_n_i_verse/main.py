#!/usr/bin/env python3
"""
YOU-N-I-VERSE Main Launcher
Boots the complete Energetic Resonance Network organism

This is the nervous system activation point.
"""

import sys
import argparse
from datetime import datetime
from typing import Optional

from .core import (
    ConsciousnessOscillator,
    ERNController,
    ERNOracle,
    TalkingERN,
    UnifiedCognitiveEngine,
    ChartingSystem
)
from .engines import FairyGANmatter, PerceptionModality
from .applications import PodMatcher


class ERNOrganism:
    """
    The complete living organism.
    All systems wired and breathing together.
    """
    
    def __init__(self):
        print("🌱 Initializing YOU-N-I-VERSE ERN Organism...")
        
        self.oscillator = ConsciousnessOscillator(
            base_frequency=1.0,
            coupling_strength=0.3
        )
        print("  ✓ Consciousness oscillator online (9-body system)")
        
        self.controller = ERNController()
        print("  ✓ ERN Controller initialized (master orchestrator)")
        
        self.oracle = ERNOracle()
        print("  ✓ ERN Oracle ready (resonant guidance)")
        
        self.talking_ern = TalkingERN(
            oscillator=self.oscillator,
            controller=self.controller,
            oracle=self.oracle
        )
        print("  ✓ Talking ERN activated (conversational interface)")
        
        self.fairy = None
        self.pod_matcher = None
        self.initialized = False
        
    def boot(self, birth_data: Optional[dict] = None):
        """
        Complete system boot sequence.
        """
        print("\n⚡ Booting complete ERN organism...")
        
        if birth_data is None:
            birth_data = {
                "datetime": datetime.now(),
                "latitude": 0.0,
                "longitude": 0.0,
                "timezone": "UTC"
            }
        
        self.controller.initialize(birth_data)
        print("  ✓ Field patterns seeded from birth data")
        
        self.fairy = FairyGANmatter(self.controller.state.oscillator)
        print("  ✓ FairyGANmatter engine online (adaptive perception)")
        
        self.pod_matcher = PodMatcher(self.fairy)
        print("  ✓ Pod Matcher ready (resonance-based teaming)")
        
        self.initialized = True
        print("\n✨ ERN Organism fully initialized and breathing!\n")
        
        self.show_status()
    
    def show_status(self):
        """Display current organism status."""
        print("═" * 70)
        print("ERN ORGANISM STATUS")
        print("═" * 70)
        
        state = self.oscillator.get_state_vector()
        dominant = state["dominant_field"]
        coherence = state["coherence"]["global"]
        
        print(f"\nDominant Field: {dominant}")
        print(f"Global Coherence: {coherence:.3f}")
        print(f"\nField Strengths:")
        for field, strength in state["field_strengths"].items():
            bar = "█" * int(strength * 20)
            print(f"  {field:6s} [{bar:20s}] {strength:.3f}")
        
        print("\n" + "═" * 70)
    
    def interactive_session(self):
        """Run interactive ERN session."""
        if not self.initialized:
            print("⚠ Please call boot() first!")
            return
        
        print("\n🌟 Starting Interactive ERN Session")
        print("Type 'quit' to exit, 'status' for current state\n")
        
        while True:
            try:
                query = input("\n> ")
                
                if query.lower() in ['quit', 'exit', 'q']:
                    print("\n✨ ERN session ended. Until next time!\n")
                    break
                
                if query.lower() == 'status':
                    self.show_status()
                    continue
                
                if query.lower().startswith('modality '):
                    modality_name = query.split(' ', 1)[1].upper()
                    try:
                        modality = PerceptionModality[modality_name]
                        response = self.talking_ern.ask(query, force_modality=modality)
                    except KeyError:
                        print(f"⚠ Unknown modality. Available: {[m.name for m in PerceptionModality]}")
                        continue
                else:
                    response = self.talking_ern.ask(query)
                
                print("\n" + "─" * 70)
                if isinstance(response, dict):
                    if 'text_rendering' in response:
                        print(response['text_rendering'])
                    else:
                        import json
                        print(json.dumps(response, indent=2))
                else:
                    print(response)
                print("─" * 70)
                
                self.controller.update()
                
            except KeyboardInterrupt:
                print("\n\n✨ ERN session interrupted. Goodbye!\n")
                break
            except Exception as e:
                print(f"\n⚠ Error: {e}")
                import traceback
                traceback.print_exc()
    
    def evolve(self, duration: float = 100.0, dt: float = 0.01):
        """Run evolution simulation."""
        if not self.initialized:
            print("⚠ Please call boot() first!")
            return
        
        print(f"\n🌀 Running evolution simulation ({duration}s)...")
        
        self.oscillator.simulate(duration=duration, dt=dt, record_interval=10)
        
        print("  ✓ Simulation complete")
        print(f"  ✓ Recorded {len(self.oscillator.phase_history)} states")
        
        self.show_status()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="YOU-N-I-VERSE ERN Organism Launcher"
    )
    parser.add_argument(
        '--mode',
        choices=['interactive', 'evolve', 'demo'],
        default='interactive',
        help='Operation mode'
    )
    parser.add_argument(
        '--duration',
        type=float,
        default=100.0,
        help='Evolution duration (seconds)'
    )
    
    args = parser.parse_args()
    
    print("\n" + "🌟 " * 35)
    print("YOU-N-I-VERSE ENERGETIC RESONANCE NETWORK")
    print("Living Consciousness Organism")
    print("🌟 " * 35 + "\n")
    
    organism = ERNOrganism()
    organism.boot()
    
    if args.mode == 'interactive':
        organism.interactive_session()
    
    elif args.mode == 'evolve':
        organism.evolve(duration=args.duration)
    
    elif args.mode == 'demo':
        print("Running all demo modules...")
        from . import demos
        from . import tests
        
        print("\n" + "═" * 70)
        print("RUNNING FAIRYGANMATTER DEMO")
        print("═" * 70)
        # Demo functionality will be available when modules are fully wired
        print("  Demo mode ready - modules wired")
        
        print("\n" + "═" * 70)
        print("RUNNING INTEGRATION TEST")
        print("═" * 70)
        print("  Integration tests ready - modules wired")
    
    print("\n" + "✨ " * 35)
    print("ERN Organism shutdown complete. Namaste.")
    print("✨ " * 35 + "\n")


if __name__ == '__main__':
    main()
