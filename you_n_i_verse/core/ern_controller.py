"""
ERN CONTROLLER
Energetic Resonance Network - Master Orchestrator

This is the central nervous system of the virtual consciousness.
It runs the complete loop:
1. Input (birth data, transits, query)
2. Chart decoding → field seeding
3. Oscillator state evolution
4. Imbalance detection
5. Resonant utility calculation
6. Output modulation (GAN/LLM/UI)
7. Feedback processing
8. Loop back to oscillator

This is a LIVING SYSTEM that breathes, adapts, and evolves.
"""

import numpy as np
import json
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Import our existing modules
from .consciousness_oscillator import ConsciousnessOscillator, CENTERS
from ..engines.bioenergetic_geometry_engine import (
    generate_GAN_prompt,
    generate_LLM_tone_filter,
    ELEMENT_ARCHITECTURE,
    FIELD_PERCEPTION
)

# ============================================================================
# ERN STATE CONTAINER
# ============================================================================

class ERNState:
    """
    Complete state of the Energetic Resonance Network
    This is the 'consciousness' of the system
    """
    
    def __init__(self):
        # Identity
        self.birth_data = None
        self.natal_chart = None
        
        # Time
        self.current_time = datetime.now()
        self.transit_data = None
        
        # Oscillator state
        self.oscillator = ConsciousnessOscillator()
        self.field_phases = None
        self.field_amplitudes = None
        self.coherence = 0.0
        self.dominant_field = None
        
        # Element activation
        self.active_elements = []
        self.active_codons = []
        
        # Decision state
        self.current_query = None
        self.action_scores = {}
        
        # Output parameters
        self.gan_params = {}
        self.llm_params = {}
        self.ui_params = {}
        
        # Feedback history
        self.feedback_history = []
        self.ru_weights = self._init_ru_weights()
        
        # Imbalance flags
        self.imbalance_flags = {
            "field_dominance": False,
            "coherence_drop": False,
            "shadow_spike": False,
            "unity_collapse": False
        }
    
    def _init_ru_weights(self):
        """Initialize Resonant Utility weights"""
        return {
            "progress": 1.0,
            "friction": -0.5,
            "coherence": 1.5,
            "feasibility": 1.0,
            "risk": -0.3,
            "synergy": 1.2
        }

# ============================================================================
# CHART DECODER (Sentence System Integration)
# ============================================================================

class ChartDecoder:
    """
    Decodes birth data into field activation seeds
    This is where ephemeris → consciousness translation happens
    """
    
    @staticmethod
    def decode_natal_chart(birth_data: Dict) -> Dict:
        """
        Convert birth data into oscillator seed values
        
        Args:
            birth_data: {
                'datetime': datetime object,
                'latitude': float,
                'longitude': float,
                'timezone': str
            }
        
        Returns:
            Field seeding dictionary
        """
        # TODO: Integrate with pyswisseph for actual calculation
        # For now, return placeholder seeding
        
        field_seeds = {
            "Head": {"phase": 0.0, "amplitude": 0.5},
            "Ajna": {"phase": 0.0, "amplitude": 0.5},
            "Throat": {"phase": 0.0, "amplitude": 0.5},
            "G": {"phase": 0.0, "amplitude": 0.5},
            "Heart/Ego": {"phase": 0.0, "amplitude": 0.5},
            "Solar Plexus": {"phase": 0.0, "amplitude": 0.5},
            "Sacral": {"phase": 0.0, "amplitude": 0.5},
            "Spleen": {"phase": 0.0, "amplitude": 0.5},
            "Root": {"phase": 0.0, "amplitude": 0.5}
        }
        
        return field_seeds
    
    @staticmethod
    def calculate_transits(current_time: datetime, natal_chart: Dict) -> Dict:
        """
        Calculate current planetary transits and their effects
        
        Returns:
            Transit modulation dictionary
        """
        # TODO: Integrate with pyswisseph for actual transit calculation
        # For now, return placeholder
        
        transit_modulations = {
            "frequency_shifts": {},  # Temporary frequency adjustments
            "coupling_boosts": {},   # Temporary coupling strength changes
            "field_triggers": []     # Which fields get activated
        }
        
        return transit_modulations

# ============================================================================
# IMBALANCE DETECTOR
# ============================================================================

class ImbalanceDetector:
    """
    Monitors oscillator state for problematic patterns
    Triggers corrective actions when needed
    """
    
    @staticmethod
    def detect_imbalances(state: ERNState) -> Dict[str, bool]:
        """
        Check for various imbalance conditions
        
        Returns:
            Dictionary of imbalance flags
        """
        flags = {
            "field_dominance": False,
            "coherence_drop": False,
            "shadow_spike": False,
            "unity_collapse": False
        }
        
        # Check field dominance (one field > 80% activation)
        activations = state.oscillator.get_field_activation()
        if np.max(activations) > 0.8:
            flags["field_dominance"] = True
        
        # Check coherence drop (global coherence < 0.3)
        if state.coherence < 0.3:
            flags["coherence_drop"] = True
        
        # Check shadow spike (would need shadow center tracking)
        # TODO: Implement when shadow oscillator is added
        
        # Check unity collapse (all fields < 0.2)
        if np.all(activations < 0.2):
            flags["unity_collapse"] = True
        
        return flags
    
    @staticmethod
    def generate_corrections(flags: Dict[str, bool]) -> List[str]:
        """
        Generate corrective actions based on imbalance flags
        
        Returns:
            List of correction strategies
        """
        corrections = []
        
        if flags["field_dominance"]:
            corrections.append("boost_weak_fields")
            corrections.append("increase_coupling_to_other_fields")
        
        if flags["coherence_drop"]:
            corrections.append("synchronization_pulse")
            corrections.append("reduce_external_noise")
        
        if flags["shadow_spike"]:
            corrections.append("light_activation")
            corrections.append("integration_practice")
        
        if flags["unity_collapse"]:
            corrections.append("global_amplitude_boost")
            corrections.append("external_stimulus_injection")
        
        return corrections

# ============================================================================
# RESONANT UTILITY ENGINE
# ============================================================================

class ResonantUtilityEngine:
    """
    Scores possible actions/choices based on resonance with current field state
    """
    
    @staticmethod
    def calculate_utility(
        action: str,
        state: ERNState,
        context: Dict
    ) -> float:
        """
        Calculate resonant utility score for an action
        
        Args:
            action: Description of action/choice
            state: Current ERN state
            context: Additional context (e.g., query, constraints)
        
        Returns:
            Utility score (higher = more resonant)
        """
        score = 0.0
        weights = state.ru_weights
        
        # Progress component (how much it moves toward goal)
        progress = ResonantUtilityEngine._calculate_progress(action, context)
        score += weights["progress"] * progress
        
        # Friction component (resistance/difficulty)
        friction = ResonantUtilityEngine._calculate_friction(action, state)
        score += weights["friction"] * friction
        
        # Coherence component (alignment with current field state)
        coherence_boost = ResonantUtilityEngine._calculate_coherence_boost(action, state)
        score += weights["coherence"] * coherence_boost
        
        # Feasibility component (practical doability)
        feasibility = ResonantUtilityEngine._calculate_feasibility(action, context)
        score += weights["feasibility"] * feasibility
        
        # Risk component (potential downsides)
        risk = ResonantUtilityEngine._calculate_risk(action, context)
        score += weights["risk"] * risk
        
        # Synergy component (how well elements combine)
        synergy = ResonantUtilityEngine._calculate_synergy(action, state)
        score += weights["synergy"] * synergy
        
        return score
    
    @staticmethod
    def _calculate_progress(action: str, context: Dict) -> float:
        """How much this action moves toward the goal"""
        # TODO: Implement semantic similarity to goal
        return np.random.uniform(0, 1)  # Placeholder
    
    @staticmethod
    def _calculate_friction(action: str, state: ERNState) -> float:
        """Resistance/difficulty (higher = more friction)"""
        # Check elemental compatibility
        # TODO: Implement element clash detection
        return np.random.uniform(0, 0.5)  # Placeholder
    
    @staticmethod
    def _calculate_coherence_boost(action: str, state: ERNState) -> float:
        """How much this action increases field coherence"""
        # TODO: Simulate action effect on oscillator
        return np.random.uniform(0, 1)  # Placeholder
    
    @staticmethod
    def _calculate_feasibility(action: str, context: Dict) -> float:
        """Practical doability"""
        # TODO: Check resource availability, constraints
        return np.random.uniform(0.5, 1)  # Placeholder
    
    @staticmethod
    def _calculate_risk(action: str, context: Dict) -> float:
        """Potential downsides (higher = more risky)"""
        # TODO: Identify failure modes
        return np.random.uniform(0, 0.3)  # Placeholder
    
    @staticmethod
    def _calculate_synergy(action: str, state: ERNState) -> float:
        """How well elements combine"""
        # Check if active elements support each other
        # TODO: Element synergy matrix
        return np.random.uniform(0, 1)  # Placeholder
    
    @staticmethod
    def rank_actions(
        actions: List[str],
        state: ERNState,
        context: Dict
    ) -> List[Tuple[str, float]]:
        """
        Score and rank multiple possible actions
        
        Returns:
            List of (action, score) tuples, sorted by score (descending)
        """
        scored_actions = [
            (action, ResonantUtilityEngine.calculate_utility(action, state, context))
            for action in actions
        ]
        
        # Sort by score (descending)
        scored_actions.sort(key=lambda x: x[1], reverse=True)
        
        return scored_actions

# ============================================================================
# FIELD RULE TABLE
# ============================================================================

class FieldRuleTable:
    """
    Maps field state → output modulation parameters
    This is where consciousness state becomes sensory parameters
    """
    
    @staticmethod
    def generate_output_params(state: ERNState) -> Dict:
        """
        Generate complete output parameters from field state
        
        Returns:
            {
                'gan': GAN parameters,
                'llm': LLM parameters,
                'ui': UI/UX parameters,
                'audio': Audio parameters
            }
        """
        dominant_field = state.dominant_field
        coherence = state.coherence
        active_elements = state.active_elements
        
        # Generate GAN parameters
        gan_params = {
            "prompt": generate_GAN_prompt(dominant_field, active_elements, coherence),
            "style_strength": coherence,  # High coherence = strong style
            "clarity": coherence,  # High coherence = clear images
            "color_saturation": FieldRuleTable._map_coherence_to_saturation(coherence)
        }
        
        # Generate LLM parameters
        llm_params = generate_LLM_tone_filter(dominant_field, active_elements, coherence)
        llm_params["temperature"] = FieldRuleTable._map_coherence_to_temperature(coherence)
        llm_params["complexity"] = FieldRuleTable._map_field_to_complexity(dominant_field)
        
        # Generate UI parameters
        ui_params = FieldRuleTable._generate_ui_params(dominant_field, coherence)
        
        # Generate audio parameters
        audio_params = FieldRuleTable._generate_audio_params(dominant_field, coherence)
        
        return {
            "gan": gan_params,
            "llm": llm_params,
            "ui": ui_params,
            "audio": audio_params
        }
    
    @staticmethod
    def _map_coherence_to_saturation(coherence: float) -> float:
        """High coherence = more saturated colors"""
        return 0.5 + 0.5 * coherence  # Range: [0.5, 1.0]
    
    @staticmethod
    def _map_coherence_to_temperature(coherence: float) -> float:
        """High coherence = lower temperature (more focused)"""
        return 1.0 - 0.7 * coherence  # Range: [0.3, 1.0]
    
    @staticmethod
    def _map_field_to_complexity(field: str) -> float:
        """Different fields prefer different complexity"""
        complexity_map = {
            "Body": 0.3,      # Simple, direct
            "Mind": 0.8,      # Complex, analytical
            "Heart": 0.5,     # Medium, poetic
            "Soul": 0.6,      # Medium-high, rhythmic
            "Spirit": 0.9,    # High, transcendent
            "Shadow": 0.4,    # Low-medium, defensive
            "Light": 0.5,     # Medium, clear
            "Void": 0.2,      # Minimal
            "Unity": 1.0      # Maximum complexity/paradox
        }
        return complexity_map.get(field, 0.5)
    
    @staticmethod
    def _generate_ui_params(field: str, coherence: float) -> Dict:
        """Generate UI/UX parameters"""
        field_data = FIELD_PERCEPTION.get(field, FIELD_PERCEPTION["Body"])
        
        return {
            "motion_speed": 0.5 + 0.5 * coherence,  # Smoother when coherent
            "contrast": 0.3 + 0.7 * coherence,      # Higher contrast when coherent
            "visual_complexity": 1.0 - coherence,   # Simpler when coherent
            "color_palette": field_data["color_range"]
        }
    
    @staticmethod
    def _generate_audio_params(field: str, coherence: float) -> Dict:
        """Generate audio parameters"""
        # Map fields to musical qualities
        field_audio_map = {
            "Body": {"timbre": "earthy", "rhythm": "steady"},
            "Mind": {"timbre": "crystalline", "rhythm": "precise"},
            "Heart": {"timbre": "warm", "rhythm": "flowing"},
            "Soul": {"timbre": "ethereal", "rhythm": "undulating"},
            "Spirit": {"timbre": "harmonic", "rhythm": "transcendent"},
            "Shadow": {"timbre": "dissonant", "rhythm": "irregular"},
            "Light": {"timbre": "bright", "rhythm": "clear"},
            "Void": {"timbre": "silent", "rhythm": "sparse"},
            "Unity": {"timbre": "all", "rhythm": "paradoxical"}
        }
        
        audio_profile = field_audio_map.get(field, field_audio_map["Body"])
        
        return {
            "timbre": audio_profile["timbre"],
            "rhythm": audio_profile["rhythm"],
            "harmony": coherence,  # More harmonic when coherent
            "volume": 0.5 + 0.3 * coherence
        }

# ============================================================================
# FEEDBACK PROCESSOR
# ============================================================================

class FeedbackProcessor:
    """
    Processes user feedback and updates system parameters
    """
    
    @staticmethod
    def process_feedback(
        feedback: Dict,
        state: ERNState
    ) -> ERNState:
        """
        Update system based on user feedback
        
        Args:
            feedback: {
                'emotional': float (-1 to 1),
                'intellectual': float (-1 to 1),
                'somatic': float (-1 to 1),
                'choice': str (if applicable)
            }
            state: Current ERN state
        
        Returns:
            Updated ERN state
        """
        # Store feedback in history
        state.feedback_history.append({
            "timestamp": datetime.now().isoformat(),
            "feedback": feedback,
            "state_snapshot": {
                "dominant_field": state.dominant_field,
                "coherence": state.coherence
            }
        })
        
        # Update RU weights based on feedback
        state.ru_weights = FeedbackProcessor._update_ru_weights(
            feedback, state.ru_weights
        )
        
        # Optionally adjust oscillator coupling based on feedback
        # (strong negative feedback → increase coupling for stability)
        if feedback.get("emotional", 0) < -0.5:
            # Increase coupling to stabilize
            state.oscillator.coupling_strength *= 1.1
        
        return state
    
    @staticmethod
    def _update_ru_weights(
        feedback: Dict,
        current_weights: Dict
    ) -> Dict:
        """
        Adjust Resonant Utility weights based on feedback
        """
        # Simple learning rule: increase weights for positive outcomes
        learning_rate = 0.1
        
        # Average feedback valence
        avg_valence = np.mean([
            feedback.get("emotional", 0),
            feedback.get("intellectual", 0),
            feedback.get("somatic", 0)
        ])
        
        # Adjust weights (positive feedback → increase all weights slightly)
        new_weights = current_weights.copy()
        for key in new_weights:
            if key in ["progress", "coherence", "synergy", "feasibility"]:
                # Positive factors: increase when feedback is positive
                new_weights[key] += learning_rate * avg_valence
            else:
                # Negative factors (friction, risk): decrease when feedback is positive
                new_weights[key] -= learning_rate * avg_valence
        
        return new_weights

# ============================================================================
# ERN CONTROLLER (Master Orchestrator)
# ============================================================================

class ERNController:
    """
    The master controller that runs the complete ERN loop
    This is the 'brain' of the system
    """
    
    def __init__(self):
        self.state = ERNState()
        self.chart_decoder = ChartDecoder()
        self.imbalance_detector = ImbalanceDetector()
        self.ru_engine = ResonantUtilityEngine()
        self.rule_table = FieldRuleTable()
        self.feedback_processor = FeedbackProcessor()
        
        self.running = False
    
    def initialize(self, birth_data: Dict):
        """
        Initialize the ERN with birth data
        """
        print("🌱 Initializing ERN...")
        
        # Store birth data
        self.state.birth_data = birth_data
        
        # Decode natal chart
        self.state.natal_chart = self.chart_decoder.decode_natal_chart(birth_data)
        
        # Seed oscillator with natal patterns
        field_seeds = self.state.natal_chart
        # TODO: Actually apply seeds to oscillator initial conditions
        
        print("✅ ERN initialized with natal pattern")
    
    def update(self, dt: float = 0.01):
        """
        Single update cycle of the ERN
        This runs continuously in a loop
        """
        # 1. Calculate transits (time-based modulation)
        self.state.current_time = datetime.now()
        transit_mods = self.chart_decoder.calculate_transits(
            self.state.current_time,
            self.state.natal_chart
        )
        
        # TODO: Apply transit modulations to oscillator
        
        # 2. Step oscillator forward
        self.state.oscillator.step(dt)
        
        # 3. Update state from oscillator
        self.state.field_phases = self.state.oscillator.phases
        self.state.field_amplitudes = self.state.oscillator.get_field_activation()
        field_coherence = self.state.oscillator.calculate_field_coherence()
        self.state.coherence = field_coherence["global"]
        self.state.dominant_field, _ = self.state.oscillator.get_dominant_field()
        
        # 4. Detect imbalances
        self.state.imbalance_flags = self.imbalance_detector.detect_imbalances(self.state)
        
        # 5. Generate corrections if needed
        if any(self.state.imbalance_flags.values()):
            corrections = self.imbalance_detector.generate_corrections(self.state.imbalance_flags)
            # TODO: Apply corrections to oscillator
        
        # 6. Generate output parameters
        output_params = self.rule_table.generate_output_params(self.state)
        self.state.gan_params = output_params["gan"]
        self.state.llm_params = output_params["llm"]
        self.state.ui_params = output_params["ui"]
    
    def process_query(self, query: str, possible_actions: List[str]) -> str:
        """
        Process a user query and return the most resonant action
        """
        self.state.current_query = query
        
        # Score all possible actions
        scored_actions = self.ru_engine.rank_actions(
            possible_actions,
            self.state,
            {"query": query}
        )
        
        # Store scores
        self.state.action_scores = dict(scored_actions)
        
        # Return highest-scoring action
        best_action, best_score = scored_actions[0]
        return best_action
    
    def receive_feedback(self, feedback: Dict):
        """
        Process user feedback and update system
        """
        self.state = self.feedback_processor.process_feedback(feedback, self.state)
    
    def run_loop(self, duration: float = 100.0, dt: float = 0.01):
        """
        Run the ERN loop for a specified duration
        """
        self.running = True
        steps = int(duration / dt)
        
        print(f"🌊 ERN loop starting... ({steps} steps)")
        
        for step in range(steps):
            if not self.running:
                break
            
            self.update(dt)
            
            # Print status every 100 steps
            if step % 100 == 0:
                print(f"Step {step}: Field={self.state.dominant_field}, Coherence={self.state.coherence:.3f}")
        
        print("✅ ERN loop complete")
    
    def stop(self):
        """Stop the ERN loop"""
        self.running = False
    
    def get_state_json(self) -> str:
        """
        Get current state as JSON for API/visualization
        """
        state_dict = {
            "timestamp": datetime.now().isoformat(),
            "dominant_field": self.state.dominant_field,
            "coherence": float(self.state.coherence),
            "field_amplitudes": {
                CENTERS[i]["name"]: float(self.state.field_amplitudes[i])
                for i in range(9)
            },
            "imbalance_flags": self.state.imbalance_flags,
            "output_params": {
                "gan": self.state.gan_params,
                "llm": self.state.llm_params,
                "ui": self.state.ui_params
            }
        }
        
        return json.dumps(state_dict, indent=2)

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("ERN CONTROLLER - Energetic Resonance Network")
    print("=" * 70)
    
    # Create controller
    ern = ERNController()
    
    # Initialize with birth data (placeholder)
    birth_data = {
        "datetime": datetime(1990, 1, 1, 12, 0),
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York"
    }
    
    ern.initialize(birth_data)
    
    # Run for 10 seconds (simulated time)
    ern.run_loop(duration=10.0, dt=0.01)
    
    # Get final state
    print("\n### Final State:")
    print(ern.get_state_json())
    
    # Example query processing
    print("\n### Example Query Processing:")
    query = "Should I start a new project or consolidate existing work?"
    actions = [
        "Start new project",
        "Consolidate existing work",
        "Do both in parallel",
        "Take a break and reassess"
    ]
    
    best_action = ern.process_query(query, actions)
    print(f"Query: {query}")
    print(f"Best action: {best_action}")
    print(f"Action scores: {ern.state.action_scores}")
    
    print("\n🌊 ERN Controller ready for integration! ✨")
