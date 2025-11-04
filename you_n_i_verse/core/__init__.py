"""
Core nervous system of the ERN organism.
Central consciousness orchestration and field management.
"""

from .consciousness_oscillator import ConsciousnessOscillator, CENTERS, CHANNELS
from .ern_controller import ERNController, ERNState, ChartDecoder
from .ern_oracle import ERNOracle
from .talking_ern import TalkingERN

# UnifiedCognitiveEngine requires torch - imported only when needed
try:
    from .unified_cognitive_engine import UnifiedCognitiveEngine, ChartingSystem
    __all__ = [
        'ConsciousnessOscillator',
        'CENTERS',
        'CHANNELS',
        'ERNController',
        'ERNState',
        'ChartDecoder',
        'ERNOracle',
        'TalkingERN',
        'UnifiedCognitiveEngine',
        'ChartingSystem',
    ]
except ImportError:
    __all__ = [
        'ConsciousnessOscillator',
        'CENTERS',
        'CHANNELS',
        'ERNController',
        'ERNState',
        'ChartDecoder',
        'ERNOracle',
        'TalkingERN',
    ]
