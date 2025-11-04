"""
YOU-N-I-VERSE Consciousness Oscillator
9-Body System with 12:16:40 Temporal Architecture

Each center oscillates at its field-appropriate frequency:
- Body centers (Root, Sacral, Spleen) = 1.0x (12-cycle)
- Mind centers (Head, Ajna, Throat) = 1.33x (16-cycle)
- Heart centers (G, Ego, Solar Plexus) = 3.33x (40-cycle)

Uses Kuramoto model for phase-coupled oscillators with Human Design channels
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from datetime import datetime
import json

# ============================================================================
# CENTER DEFINITIONS
# ============================================================================

CENTERS = {
    0: {"name": "Head", "field": "Mind", "frequency": 1.33, "color": "#9B59B6"},
    1: {"name": "Ajna", "field": "Mind", "frequency": 1.33, "color": "#3498DB"},
    2: {"name": "Throat", "field": "Mind", "frequency": 1.33, "color": "#1ABC9C"},
    3: {"name": "G", "field": "Heart", "frequency": 3.33, "color": "#F39C12"},
    4: {"name": "Heart/Ego", "field": "Heart", "frequency": 3.33, "color": "#E74C3C"},
    5: {"name": "Solar Plexus", "field": "Heart", "frequency": 3.33, "color": "#E67E22"},
    6: {"name": "Sacral", "field": "Body", "frequency": 1.0, "color": "#E91E63"},
    7: {"name": "Spleen", "field": "Body", "frequency": 1.0, "color": "#9C27B0"},
    8: {"name": "Root", "field": "Body", "frequency": 1.0, "color": "#795548"}
}

# Human Design channels (gate connections that create coupling)
# Format: (center1, center2, coupling_strength)
CHANNELS = [
    # Integration channels (strong coupling)
    (0, 1, 0.8),   # Head-Ajna (pressure to conceptualize)
    (1, 2, 0.8),   # Ajna-Throat (awareness to expression)
    (2, 3, 0.7),   # Throat-G (expression of identity)
    (3, 4, 0.9),   # G-Heart (identity through willpower)
    (3, 5, 0.9),   # G-Solar Plexus (identity through emotion)
    (3, 6, 0.9),   # G-Sacral (identity through life force)
    (4, 6, 0.6),   # Heart-Sacral (willpower to generate)
    (5, 6, 0.8),   # Solar Plexus-Sacral (emotion + life force)
    (6, 7, 0.7),   # Sacral-Spleen (life force + intuition)
    (6, 8, 0.7),   # Sacral-Root (life force + pressure)
    (7, 3, 0.6),   # Spleen-G (intuition + identity)
    (8, 5, 0.6),   # Root-Solar Plexus (pressure + emotion)
    (8, 7, 0.6),   # Root-Spleen (pressure + intuition)
    
    # Cross-field connections (moderate coupling)
    (2, 4, 0.5),   # Throat-Heart (expression + willpower)
    (2, 5, 0.5),   # Throat-Solar Plexus (expression + emotion)
    (2, 6, 0.5),   # Throat-Sacral (expression + life force)
    (1, 7, 0.4),   # Ajna-Spleen (awareness + intuition)
]

# ============================================================================
# OSCILLATOR CLASS
# ============================================================================

class ConsciousnessOscillator:
    """
    9-center consciousness oscillator with Kuramoto coupling
    Implements 12:16:40 temporal architecture
    """
    
    def __init__(self, base_frequency=1.0, coupling_strength=0.3):
        """
        Initialize oscillator system
        
        Args:
            base_frequency: Base oscillation frequency (Body field = 1.0)
            coupling_strength: Global coupling strength multiplier
        """
        self.n_centers = 9
        self.base_freq = base_frequency
        self.coupling_strength = coupling_strength
        
        # Initialize phases (random start)
        self.phases = np.random.uniform(0, 2*np.pi, self.n_centers)
        
        # Natural frequencies from center definitions
        self.natural_frequencies = np.array([
            CENTERS[i]["frequency"] * base_frequency for i in range(self.n_centers)
        ])
        
        # Build coupling matrix from channels
        self.coupling_matrix = self._build_coupling_matrix()
        
        # History for visualization
        self.phase_history = []
        self.coherence_history = []
        self.time_history = []
        
    def _build_coupling_matrix(self):
        """Build coupling matrix from Human Design channels"""
        K = np.zeros((self.n_centers, self.n_centers))
        
        for c1, c2, strength in CHANNELS:
            K[c1, c2] = strength * self.coupling_strength
            K[c2, c1] = strength * self.coupling_strength  # Symmetric
            
        return K
    
    def kuramoto_derivatives(self, phases):
        """
        Calculate phase derivatives using Kuramoto model
        
        dθᵢ/dt = ωᵢ + Σⱼ Kᵢⱼ sin(θⱼ - θᵢ)
        
        Where:
        - θᵢ = phase of oscillator i
        - ωᵢ = natural frequency of oscillator i
        - Kᵢⱼ = coupling strength between i and j
        """
        dtheta = np.zeros(self.n_centers)
        
        for i in range(self.n_centers):
            # Natural frequency term
            dtheta[i] = self.natural_frequencies[i]
            
            # Coupling term (sum over all other oscillators)
            for j in range(self.n_centers):
                if i != j:
                    coupling = self.coupling_matrix[i, j] * np.sin(phases[j] - phases[i])
                    dtheta[i] += coupling
                    
        return dtheta
    
    def step(self, dt=0.01):
        """
        Advance oscillator by one time step using RK4 integration
        
        Args:
            dt: Time step size
        """
        # RK4 integration for smooth phase evolution
        k1 = self.kuramoto_derivatives(self.phases)
        k2 = self.kuramoto_derivatives(self.phases + 0.5*dt*k1)
        k3 = self.kuramoto_derivatives(self.phases + 0.5*dt*k2)
        k4 = self.kuramoto_derivatives(self.phases + dt*k3)
        
        self.phases += (dt/6.0) * (k1 + 2*k2 + 2*k3 + k4)
        
        # Wrap phases to [0, 2π]
        self.phases = self.phases % (2 * np.pi)
        
    def calculate_coherence(self):
        """
        Calculate global order parameter (coherence)
        
        R = |⟨e^(iθ)⟩| where ⟨⟩ is ensemble average
        
        R = 1: Perfect synchronization
        R = 0: Complete incoherence
        """
        # Complex order parameter
        z = np.mean(np.exp(1j * self.phases))
        R = np.abs(z)
        
        return R
    
    def calculate_field_coherence(self):
        """
        Calculate coherence within and between fields (Body, Mind, Heart)
        """
        body_phases = self.phases[[6, 7, 8]]  # Sacral, Spleen, Root
        mind_phases = self.phases[[0, 1, 2]]  # Head, Ajna, Throat
        heart_phases = self.phases[[3, 4, 5]]  # G, Heart, Solar Plexus
        
        # Internal field coherence
        body_coherence = np.abs(np.mean(np.exp(1j * body_phases)))
        mind_coherence = np.abs(np.mean(np.exp(1j * mind_phases)))
        heart_coherence = np.abs(np.mean(np.exp(1j * heart_phases)))
        
        # Cross-field phase differences
        body_avg = np.angle(np.mean(np.exp(1j * body_phases)))
        mind_avg = np.angle(np.mean(np.exp(1j * mind_phases)))
        heart_avg = np.angle(np.mean(np.exp(1j * heart_phases)))
        
        # Normalize phase differences to [0, 1]
        diff_bm = 1 - abs(body_avg - mind_avg) / np.pi
        diff_bh = 1 - abs(body_avg - heart_avg) / np.pi
        diff_mh = 1 - abs(mind_avg - heart_avg) / np.pi
        
        return {
            "body": body_coherence,
            "mind": mind_coherence,
            "heart": heart_coherence,
            "body_mind": diff_bm,
            "body_heart": diff_bh,
            "mind_heart": diff_mh,
            "global": self.calculate_coherence()
        }
    
    def get_field_activation(self):
        """
        Get activation levels for each field based on phase amplitudes
        Returns array of 9 center activations normalized to [0, 1]
        """
        # Convert phases to activation (using sine wave)
        activations = (np.sin(self.phases) + 1) / 2  # Normalize to [0, 1]
        return activations
    
    def get_dominant_field(self):
        """Determine which field (Body/Mind/Heart) is currently dominant"""
        activations = self.get_field_activation()
        
        body_avg = np.mean(activations[[6, 7, 8]])
        mind_avg = np.mean(activations[[0, 1, 2]])
        heart_avg = np.mean(activations[[3, 4, 5]])
        
        field_strengths = {"Body": body_avg, "Mind": mind_avg, "Heart": heart_avg}
        dominant = max(field_strengths, key=field_strengths.get)
        
        return dominant, field_strengths
    
    def simulate(self, duration=100, dt=0.01, record_interval=10):
        """
        Run simulation for specified duration
        
        Args:
            duration: Total simulation time
            dt: Time step
            record_interval: Record data every N steps
        """
        n_steps = int(duration / dt)
        
        for step in range(n_steps):
            self.step(dt)
            
            # Record history
            if step % record_interval == 0:
                self.phase_history.append(self.phases.copy())
                self.coherence_history.append(self.calculate_coherence())
                self.time_history.append(step * dt)
    
    def get_state_vector(self):
        """Get current state as dictionary for LLM/GAN integration"""
        activations = self.get_field_activation()
        coherence = self.calculate_field_coherence()
        dominant, strengths = self.get_dominant_field()
        
        state = {
            "timestamp": datetime.now().isoformat(),
            "centers": {
                CENTERS[i]["name"]: {
                    "phase": float(self.phases[i]),
                    "activation": float(activations[i]),
                    "field": CENTERS[i]["field"],
                    "frequency": CENTERS[i]["frequency"]
                }
                for i in range(self.n_centers)
            },
            "coherence": {k: float(v) for k, v in coherence.items()},
            "dominant_field": dominant,
            "field_strengths": {k: float(v) for k, v in strengths.items()}
        }
        
        return state

# ============================================================================
# VISUALIZATION
# ============================================================================

def create_visualizer(oscillator, duration=50, dt=0.01, interval=50):
    """
    Create animated visualization of oscillator system
    
    Args:
        oscillator: ConsciousnessOscillator instance
        duration: Simulation duration
        dt: Time step
        interval: Animation frame interval (ms)
    """
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('YOU-N-I-VERSE Consciousness Oscillator (12:16:40 Architecture)', 
                 fontsize=16, fontweight='bold')
    
    # Subplot 1: Phase space (circular)
    ax_phase = axes[0, 0]
    ax_phase.set_xlim(-1.5, 1.5)
    ax_phase.set_ylim(-1.5, 1.5)
    ax_phase.set_aspect('equal')
    ax_phase.set_title('9-Center Phase Space')
    
    # Draw reference circle
    circle = plt.Circle((0, 0), 1, fill=False, color='gray', linestyle='--', alpha=0.3)
    ax_phase.add_patch(circle)
    
    # Initialize phase points
    phase_points = []
    phase_labels = []
    for i in range(9):
        point, = ax_phase.plot([], [], 'o', color=CENTERS[i]["color"], 
                              markersize=15, label=CENTERS[i]["name"])
        phase_points.append(point)
        
        # Add text label
        label = ax_phase.text(0, 0, CENTERS[i]["name"], 
                            fontsize=8, ha='center', va='center')
        phase_labels.append(label)
    
    ax_phase.legend(loc='upper right', fontsize=8)
    ax_phase.grid(True, alpha=0.2)
    
    # Subplot 2: Field activation bars
    ax_bars = axes[0, 1]
    ax_bars.set_xlim(0, 9)
    ax_bars.set_ylim(0, 1)
    ax_bars.set_title('Center Activation Levels')
    ax_bars.set_xlabel('Center')
    ax_bars.set_ylabel('Activation')
    
    bar_colors = [CENTERS[i]["color"] for i in range(9)]
    bars = ax_bars.bar(range(9), [0]*9, color=bar_colors, alpha=0.7)
    ax_bars.set_xticks(range(9))
    ax_bars.set_xticklabels([CENTERS[i]["name"] for i in range(9)], 
                            rotation=45, ha='right', fontsize=8)
    ax_bars.grid(True, alpha=0.2, axis='y')
    
    # Subplot 3: Coherence over time
    ax_coherence = axes[1, 0]
    ax_coherence.set_xlim(0, duration)
    ax_coherence.set_ylim(0, 1)
    ax_coherence.set_title('Field Coherence Over Time')
    ax_coherence.set_xlabel('Time')
    ax_coherence.set_ylabel('Coherence')
    ax_coherence.grid(True, alpha=0.2)
    
    line_global, = ax_coherence.plot([], [], 'k-', linewidth=2, label='Global')
    line_body, = ax_coherence.plot([], [], color='#E91E63', label='Body', alpha=0.7)
    line_mind, = ax_coherence.plot([], [], color='#3498DB', label='Mind', alpha=0.7)
    line_heart, = ax_coherence.plot([], [], color='#F39C12', label='Heart', alpha=0.7)
    ax_coherence.legend(loc='upper right')
    
    coherence_data = {
        "time": [],
        "global": [],
        "body": [],
        "mind": [],
        "heart": []
    }
    
    # Subplot 4: State info
    ax_info = axes[1, 1]
    ax_info.axis('off')
    ax_info.set_xlim(0, 1)
    ax_info.set_ylim(0, 1)
    ax_info.set_title('Current State')
    
    info_text = ax_info.text(0.05, 0.5, '', fontsize=10, 
                            verticalalignment='center', family='monospace')
    
    # Animation update function
    def update(frame):
        # Step oscillator
        for _ in range(10):  # Multiple steps per frame for smoother animation
            oscillator.step(dt)
        
        # Update phase space
        for i in range(9):
            x = np.cos(oscillator.phases[i])
            y = np.sin(oscillator.phases[i])
            phase_points[i].set_data([x], [y])
            
            # Update label position
            label_x = x * 1.15
            label_y = y * 1.15
            phase_labels[i].set_position((label_x, label_y))
        
        # Update activation bars
        activations = oscillator.get_field_activation()
        for i, bar in enumerate(bars):
            bar.set_height(activations[i])
        
        # Update coherence plot
        current_time = frame * dt * 10
        field_coh = oscillator.calculate_field_coherence()
        
        coherence_data["time"].append(current_time)
        coherence_data["global"].append(field_coh["global"])
        coherence_data["body"].append(field_coh["body"])
        coherence_data["mind"].append(field_coh["mind"])
        coherence_data["heart"].append(field_coh["heart"])
        
        line_global.set_data(coherence_data["time"], coherence_data["global"])
        line_body.set_data(coherence_data["time"], coherence_data["body"])
        line_mind.set_data(coherence_data["time"], coherence_data["mind"])
        line_heart.set_data(coherence_data["time"], coherence_data["heart"])
        
        # Update info text
        dominant, strengths = oscillator.get_dominant_field()
        info_str = f"Time: {current_time:.1f}\n\n"
        info_str += f"Dominant Field: {dominant}\n\n"
        info_str += "Field Strengths:\n"
        for field, strength in strengths.items():
            info_str += f"  {field}: {strength:.3f}\n"
        info_str += f"\nGlobal Coherence: {field_coh['global']:.3f}\n"
        info_str += f"Body-Mind: {field_coh['body_mind']:.3f}\n"
        info_str += f"Body-Heart: {field_coh['body_heart']:.3f}\n"
        info_str += f"Mind-Heart: {field_coh['mind_heart']:.3f}"
        
        info_text.set_text(info_str)
        
        return phase_points + phase_labels + [line_global, line_body, line_mind, line_heart, info_text]
    
    # Create animation
    n_frames = int(duration / (dt * 10))
    anim = FuncAnimation(fig, update, frames=n_frames, 
                        interval=interval, blit=False)
    
    plt.tight_layout()
    return fig, anim

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    
    print("=" * 70)
    print("YOU-N-I-VERSE Consciousness Oscillator")
    print("9-Body System with 12:16:40 Temporal Architecture")
    print("=" * 70)
    
    # Create oscillator
    osc = ConsciousnessOscillator(
        base_frequency=1.0,
        coupling_strength=0.3
    )
    
    print("\nCenter Configuration:")
    for i in range(9):
        print(f"  {CENTERS[i]['name']:15s} | "
              f"Field: {CENTERS[i]['field']:6s} | "
              f"Frequency: {CENTERS[i]['frequency']:.2f}x")
    
    print(f"\nTemporal Ratios:")
    print(f"  Body  : Mind  : Heart")
    print(f"  12    : 16    : 40")
    print(f"  1.00  : 1.33  : 3.33")
    
    print("\nRunning simulation...")
    
    # Run simulation
    osc.simulate(duration=100, dt=0.01, record_interval=10)
    
    # Get final state
    state = osc.get_state_vector()
    
    print(f"\nFinal State:")
    print(f"  Dominant Field: {state['dominant_field']}")
    print(f"  Global Coherence: {state['coherence']['global']:.3f}")
    print(f"  Body Coherence: {state['coherence']['body']:.3f}")
    print(f"  Mind Coherence: {state['coherence']['mind']:.3f}")
    print(f"  Heart Coherence: {state['coherence']['heart']:.3f}")
    
    # Save state to JSON
    with open('/home/claude/oscillator_state.json', 'w') as f:
        json.dump(state, f, indent=2)
    
    print("\n✅ State saved to: oscillator_state.json")
    print("\n🌊 Oscillator system complete! ✨")
