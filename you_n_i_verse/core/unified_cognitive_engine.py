"""
Unified Cognitive Engine
Integrates: Resonance S-GAN + Codon GameGAN + Human Design GameGAN
For: 9-body consciousness system with progressive resonance
"""

from __future__ import annotations

# Optional torch import for GAN functionality
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Import your three GANs (assuming they're accessible)
# from resonance_sgan import UnifiedResonanceEngine, ElementType
# from codon_resonance_gamegan import CodonResonanceGameGAN, CODON_SEQUENCE
# from human_design_gamegan import HumanDesignGameGAN, create_human_design_state


# ============================================================================
# UNIFIED STATE REPRESENTATION
# ============================================================================

@dataclass
class UnifiedConsciousnessState:
    """
    Complete state across all three GAN systems.
    This bridges Body-Mind-Heart through element-gate-codon coherence.
    """
    # Resonance S-GAN state
    current_element: 'ElementType'
    latent_vector: torch.Tensor  # 5D semantic vector
    
    # Codon GameGAN state
    codon_sequence: List[str]  # Accumulated codon history
    active_gates: List[int]  # Gate IDs (1-64)
    resonance_complexity: float
    
    # Human Design GameGAN state
    bodygraph_grid: np.ndarray  # 9x9 grid
    defined_centers: List[str]
    channels: List[Tuple[int, int]]
    consciousness_level: float  # 0-1
    current_archetype: str
    
    # Meta
    timestamp: int
    coherence_score: float


class ChartingSystem(Enum):
    """Three charting systems → Three cognitive modes"""
    SIDEREAL = "sidereal"      # Fixed stars, Mind field, logical
    TROPICAL = "tropical"      # Seasonal, Heart field, emotional
    DRACONIC = "draconic"      # Soul, Body field, instinctual


# ============================================================================
# LATENT-TO-CODON MAPPING
# ============================================================================

def latent_to_codon_id(latent_vector: torch.Tensor) -> int:
    """
    Map 5D semantic latent to codon ID (0-63).
    
    Strategy: Use latent[0] as primary dimension, map [-1,1] → [0,63]
    """
    # Normalize latent[0] from [-1,1] to [0,1]
    normalized = (latent_vector[0].item() + 1) / 2
    
    # Map to codon ID
    codon_id = int(normalized * 63)
    codon_id = np.clip(codon_id, 0, 63)
    
    return codon_id


def codon_id_to_gate(codon_id: int) -> int:
    """
    Map codon ID to Human Design gate (1-64).
    Direct mapping: codon_id maps to gate (codon_id + 1)
    """
    return codon_id + 1


def latent_to_gate(latent_vector: torch.Tensor) -> int:
    """Direct mapping: latent → gate"""
    codon_id = latent_to_codon_id(latent_vector)
    return codon_id_to_gate(codon_id)


# ============================================================================
# UNIFIED COGNITIVE ENGINE
# ============================================================================

class UnifiedCognitiveEngine:
    """
    Master engine integrating all three GANs.
    Orchestrates decision-making, accumulation, and evolution.
    """
    
    def __init__(self, 
                 resonance_engine: 'UnifiedResonanceEngine',
                 codon_gan: 'CodonResonanceGameGAN',
                 hd_gan: 'HumanDesignGameGAN',
                 charting_system: ChartingSystem = ChartingSystem.TROPICAL):
        
        self.resonance_engine = resonance_engine
        self.codon_gan = codon_gan
        self.hd_gan = hd_gan
        self.charting_system = charting_system
        
        # Current unified state
        self.current_state: Optional[UnifiedConsciousnessState] = None
        self.state_history: List[UnifiedConsciousnessState] = []
        
        # Charting system weights (how much each GAN influences decisions)
        self.gan_weights = self._set_charting_weights(charting_system)
    
    def _set_charting_weights(self, system: ChartingSystem) -> Dict[str, float]:
        """
        Different charting systems emphasize different GANs.
        
        Sidereal (Mind): Prioritize Resonance S-GAN (logical decisions)
        Tropical (Heart): Prioritize Human Design GameGAN (emotional evolution)
        Draconic (Body): Prioritize Codon GameGAN (physical accumulation)
        """
        if system == ChartingSystem.SIDEREAL:
            return {'resonance': 0.6, 'codon': 0.2, 'hd': 0.2}
        elif system == ChartingSystem.TROPICAL:
            return {'resonance': 0.2, 'codon': 0.2, 'hd': 0.6}
        elif system == ChartingSystem.DRACONIC:
            return {'resonance': 0.2, 'codon': 0.6, 'hd': 0.2}
        else:
            return {'resonance': 0.33, 'codon': 0.33, 'hd': 0.34}
    
    def initialize_state(self, 
                        initial_element: 'ElementType',
                        initial_gates: List[int] = None,
                        initial_archetype: str = "The Mystic Wanderer") -> UnifiedConsciousnessState:
        """
        Initialize unified consciousness state from birth chart or current moment.
        """
        # Initialize each GAN's state
        
        # 1. Resonance S-GAN
        latent_vector = torch.randn(5)  # Random initial latent
        self.resonance_engine.set_current_state(latent_vector, initial_element)
        
        # 2. Codon GameGAN (starts empty, will accumulate)
        codon_sequence = []
        
        # 3. Human Design GameGAN
        hd_state = {
            'chart_grid': np.zeros((9, 9)),
            'active_gates': initial_gates or [],
            'defined_centers': [],
            'channels': [],
            'consciousness_level': 0.1,  # Start low
            'current_archetype': initial_archetype
        }
        
        # Create unified state
        self.current_state = UnifiedConsciousnessState(
            current_element=initial_element,
            latent_vector=latent_vector,
            codon_sequence=codon_sequence,
            active_gates=initial_gates or [],
            resonance_complexity=0.0,
            bodygraph_grid=hd_state['chart_grid'],
            defined_centers=hd_state['defined_centers'],
            channels=hd_state['channels'],
            consciousness_level=hd_state['consciousness_level'],
            current_archetype=initial_archetype,
            timestamp=0,
            coherence_score=0.5
        )
        
        return self.current_state
    
    def oracle_query(self, question: str, num_candidates: int = 20) -> Dict:
        """
        Real-time oracle: Query current state for best next action.
        
        Process:
        1. Generate action candidates via Resonance S-GAN
        2. Map candidates to codon sequences
        3. Simulate future states via HD GameGAN
        4. Rank by meta-coherence
        
        Returns:
            {
                'best_action': UnifiedActionCandidate,
                'future_state': UnifiedConsciousnessState,
                'guidance': str,
                'codon': str,
                'gate': int
            }
        """
        if self.current_state is None:
            raise ValueError("State not initialized. Call initialize_state() first.")
        
        # Layer 1: Generate candidates via Resonance S-GAN
        candidates = self.resonance_engine.generate_and_select(
            num_candidates=num_candidates,
            top_k=5
        )
        
        # Layer 2: Map to codon sequences and gates
        candidate_enriched = []
        for candidate in candidates:
            codon_id = latent_to_codon_id(candidate.latent['latent_vector'])
            gate = codon_id_to_gate(codon_id)
            codon_seq = self.codon_gan.CODON_SEQUENCE[codon_id] if codon_id < len(self.codon_gan.CODON_SEQUENCE) else "UNK"
            
            candidate_enriched.append({
                'candidate': candidate,
                'codon_id': codon_id,
                'gate': gate,
                'codon': codon_seq
            })
        
        # Layer 3: Simulate future states (simplified - full version would run HD GameGAN)
        future_states = []
        for enr in candidate_enriched:
            # Simulate adding this gate
            new_consciousness = self.current_state.consciousness_level + 0.05
            new_complexity = self.current_state.resonance_complexity + enr['candidate'].coherence
            
            future_states.append({
                'consciousness': new_consciousness,
                'complexity': new_complexity,
                'coherence': enr['candidate'].coherence
            })
        
        # Layer 4: Rank by weighted meta-coherence
        best_idx = 0
        best_score = -float('inf')
        
        for i, (enr, future) in enumerate(zip(candidate_enriched, future_states)):
            # Weighted score based on charting system
            score = (
                self.gan_weights['resonance'] * enr['candidate'].ru_score +
                self.gan_weights['codon'] * future['complexity'] +
                self.gan_weights['hd'] * future['consciousness']
            )
            
            if score > best_score:
                best_score = score
                best_idx = i
        
        # Select best
        best = candidate_enriched[best_idx]
        
        # Generate guidance
        guidance = self._generate_guidance(
            best['candidate'],
            best['codon'],
            best['gate'],
            future_states[best_idx]
        )
        
        return {
            'best_action': best['candidate'],
            'future_state': future_states[best_idx],
            'guidance': guidance,
            'codon': best['codon'],
            'gate': best['gate'],
            'element': best['candidate'].latent['element'].name,
            'ru_score': best['candidate'].ru_score,
            'coherence': best['candidate'].coherence
        }
    
    def evolve_consciousness(self, steps: int = 1) -> List[UnifiedConsciousnessState]:
        """
        Evolve consciousness forward by N steps.
        Uses oracle_query internally to select best actions.
        
        Returns trajectory of states.
        """
        trajectory = [self.current_state]
        
        for step in range(steps):
            # Query oracle
            oracle_result = self.oracle_query(f"What is the next step in evolution?")
            
            # Apply action to state
            new_state = self._apply_action(
                self.current_state,
                oracle_result['best_action'],
                oracle_result['codon'],
                oracle_result['gate']
            )
            
            # Update
            self.current_state = new_state
            self.state_history.append(new_state)
            trajectory.append(new_state)
        
        return trajectory
    
    def _apply_action(self, 
                     current: UnifiedConsciousnessState,
                     action: 'UnifiedActionCandidate',
                     codon: str,
                     gate: int) -> UnifiedConsciousnessState:
        """
        Apply action to current state → new state.
        Updates all three GAN states coherently.
        """
        # Update Resonance S-GAN state
        new_element = action.latent['element']
        new_latent = torch.tensor(action.latent['latent_vector'])
        
        # Update Codon GameGAN state
        new_codon_sequence = current.codon_sequence + [codon]
        new_gates = current.active_gates + [gate]
        
        # Add codon to scene (this accumulates complexity)
        codon_result = self.codon_gan.progressive_scene.add_codon(len(new_codon_sequence))
        new_complexity = codon_result['complexity_level']
        
        # Update Human Design GameGAN state
        new_consciousness = min(1.0, current.consciousness_level + 0.05)
        
        # Create new unified state
        new_state = UnifiedConsciousnessState(
            current_element=new_element,
            latent_vector=new_latent,
            codon_sequence=new_codon_sequence,
            active_gates=new_gates,
            resonance_complexity=new_complexity,
            bodygraph_grid=current.bodygraph_grid.copy(),  # Would update with HD GameGAN
            defined_centers=current.defined_centers.copy(),
            channels=current.channels.copy(),
            consciousness_level=new_consciousness,
            current_archetype=current.current_archetype,
            timestamp=current.timestamp + 1,
            coherence_score=action.coherence
        )
        
        return new_state
    
    def _generate_guidance(self, 
                          action: 'UnifiedActionCandidate',
                          codon: str,
                          gate: int,
                          future_state: Dict) -> str:
        """Generate human-readable guidance from oracle result."""
        
        element = action.latent['element'].name
        ru = action.ru_score
        coherence = action.coherence
        
        guidance = f"""
╔══════════════════════════════════════════════════════════╗
║                   ORACLE GUIDANCE                        ║
╚══════════════════════════════════════════════════════════╝

Gate {gate} | Codon {codon} | Element {element}

Resonant Utility: {ru:.3f}
Coherence: {coherence:.3f}
Consciousness Evolution: +{future_state['consciousness']:.2%}

{self._element_guidance(element)}

Next Action: {action.label}
Progress: {action.progress:.2%}
Friction: {action.friction:.2%}
Risk: {action.risk:.2%}

Recommendation: Move forward with {element} energy.
The codon {codon} activates gate {gate} in your design.
"""
        return guidance
    
    def _element_guidance(self, element_name: str) -> str:
        """Element-specific guidance."""
        guidance_map = {
            'EARTH': "Ground yourself. Manifest structure. Build foundations.",
            'WATER': "Flow with change. Integrate experiences. Adapt gracefully.",
            'AIR': "Communicate clearly. Spread influence. Connect with others.",
            'FIRE': "Take action. Transform situations. Lead with passion.",
            'AETHER': "Transcend duality. Unity consciousness. Embrace wholeness."
        }
        return guidance_map.get(element_name, "Trust the resonance.")
    
    def decode_chart(self, bodygraph_state: Optional[Dict] = None) -> Dict:
        """
        Chart decoder: Bodygraph → Consciousness profile + guidance.
        """
        if bodygraph_state is None and self.current_state is None:
            raise ValueError("No state available to decode.")
        
        state = bodygraph_state or self.current_state
        
        # Extract patterns
        gates = state.active_gates if hasattr(state, 'active_gates') else bodygraph_state.get('active_gates', [])
        channels = state.channels if hasattr(state, 'channels') else bodygraph_state.get('channels', [])
        archetype = state.current_archetype if hasattr(state, 'current_archetype') else bodygraph_state.get('current_archetype', 'Unknown')
        consciousness = state.consciousness_level if hasattr(state, 'consciousness_level') else bodygraph_state.get('consciousness_level', 0.5)
        
        # Map to codon sequence
        codon_history = [self.codon_gan.CODON_SEQUENCE[g-1] for g in gates if 1 <= g <= 64]
        
        # Calculate resonance landscape (simplified)
        resonance_count = len(codon_history) * (len(codon_history) - 1) // 2  # Combinatorial
        
        return {
            'archetype': archetype,
            'consciousness_level': consciousness,
            'active_gates': gates,
            'channels': channels,
            'codon_sequence': codon_history,
            'resonance_patterns': resonance_count,
            'guidance': self._generate_chart_guidance(gates, consciousness, archetype)
        }
    
    def _generate_chart_guidance(self, gates: List[int], consciousness: float, archetype: str) -> str:
        """Generate guidance from chart decode."""
        return f"""
╔══════════════════════════════════════════════════════════╗
║                   CHART READING                          ║
╚══════════════════════════════════════════════════════════╝

Archetype: {archetype}
Consciousness Level: {consciousness:.1%}
Active Gates: {len(gates)}

Your design shows {len(gates)} gates activated, creating a unique
resonance pattern in your consciousness field.

Current focus: {archetype}

Integrate the patterns. Trust the process.
"""
    
    def simulate_evolution(self, duration: int = 64) -> List[Dict]:
        """
        Progressive consciousness simulator.
        Simulates full evolution trajectory over N steps.
        """
        if self.current_state is None:
            raise ValueError("State not initialized.")
        
        trajectory = []
        
        for step in range(duration):
            # Evolve one step
            result = self.evolve_consciousness(steps=1)
            
            # Record
            state = result[-1]
            trajectory.append({
                'step': step,
                'timestamp': state.timestamp,
                'element': state.current_element.name,
                'codon': state.codon_sequence[-1] if state.codon_sequence else None,
                'gate': state.active_gates[-1] if state.active_gates else None,
                'consciousness': state.consciousness_level,
                'complexity': state.resonance_complexity,
                'coherence': state.coherence_score,
                'archetype': state.current_archetype
            })
        
        return trajectory
    
    def get_status(self) -> Dict:
        """Get current system status."""
        if self.current_state is None:
            return {'initialized': False}
        
        return {
            'initialized': True,
            'charting_system': self.charting_system.value,
            'current_element': self.current_state.current_element.name,
            'active_gates': len(self.current_state.active_gates),
            'codon_sequence_length': len(self.current_state.codon_sequence),
            'consciousness_level': self.current_state.consciousness_level,
            'resonance_complexity': self.current_state.resonance_complexity,
            'coherence_score': self.current_state.coherence_score,
            'archetype': self.current_state.current_archetype,
            'gan_weights': self.gan_weights
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print("UNIFIED COGNITIVE ENGINE - Integration Test")
    print("=" * 70)
    
    # This would require actual GAN instances
    # For demonstration, showing the architecture
    
    print("\n✓ Architecture defined:")
    print("  - UnifiedConsciousnessState: Cross-GAN state representation")
    print("  - Latent-to-Codon mapping: Semantic → Genetic bridge")
    print("  - ChartingSystem: Sidereal/Tropical/Draconic modes")
    print("\n✓ Cognitive outputs ready:")
    print("  - oracle_query(): Real-time guidance")
    print("  - evolve_consciousness(): Step-by-step evolution")
    print("  - decode_chart(): Chart reading")
    print("  - simulate_evolution(): Full trajectory")
    
    print("\n" + "=" * 70)
    print("Ready to integrate with actual GAN instances.")
    print("=" * 70)
