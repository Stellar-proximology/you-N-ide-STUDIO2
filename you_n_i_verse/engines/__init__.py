"""
Engines: Specialized processing organs of the ERN.
Geometric transformations and perception rendering.
"""

from .bioenergetic_geometry_engine import (
    FIELD_PERCEPTION,
    ELEMENT_ARCHITECTURE,
    generate_GAN_prompt,
    generate_LLM_tone_filter
)
from .fairyganmatter_engine import (
    FairyGANmatter,
    PerceptionModality,
    UserPerceptionProfile,
    infer_perception_profile
)
from .resonance_sgan import ElementType, UnifiedResonanceEngine, elemental_mismatch_penalty
from .codon_resonance_gamegan import CodonResonanceGameGAN
from .human_design_gamegan import HumanDesignGameGAN
from .consciousness import ConsciousnessState, Gate, Element

__all__ = [
    'FIELD_PERCEPTION',
    'ELEMENT_ARCHITECTURE',
    'generate_GAN_prompt',
    'generate_LLM_tone_filter',
    'FairyGANmatter',
    'PerceptionModality',
    'UserPerceptionProfile',
    'infer_perception_profile',
    'ElementType',
    'UnifiedResonanceEngine',
    'elemental_mismatch_penalty',
    'CodonResonanceGameGAN',
    'HumanDesignGameGAN',
    'ConsciousnessState',
    'Gate',
    'Element',
]
