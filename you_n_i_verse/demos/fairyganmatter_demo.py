"""
FairyGANmatter Demo: Adaptive Output for Different Users
Shows how the same solution is rendered differently based on user profile
"""

import sys
sys.path.append('/mnt/user-data/uploads')

from unified_cognitive_engine import (
    UnifiedCognitiveEngine,
    UnifiedConsciousnessState,
    ChartingSystem
)
from resonance_sgan import UnifiedResonanceEngine, ElementType
from codon_resonance_gamegan import CodonResonanceGameGAN
from human_design_gamegan import HumanDesignGameGAN
from fairyganmatter_engine import FairyGANmatter, PerceptionModality
import torch


def demo_same_problem_different_users():
    """
    Show how FairyGANmatter adapts the SAME solution for DIFFERENT users
    """
    
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "FAIRYGANMATTER ADAPTIVE DEMO" + " "*24 + "║")
    print("╚" + "="*68 + "╝\n")
    
    # Same problem for all users
    problem = "I feel stuck and don't know what to do next"
    
    print(f"PROBLEM: {problem}\n")
    print("="*70 + "\n")
    
    # Create different user types
    users = [
        {
            'name': 'Technical Developer',
            'element': ElementType.EARTH,
            'description': 'Prefers code, algorithms, step-by-step'
        },
        {
            'name': 'Creative Writer',
            'element': ElementType.WATER,
            'description': 'Prefers stories, metaphors, flow'
        },
        {
            'name': 'Visual Designer',
            'element': ElementType.AIR,
            'description': 'Prefers diagrams, visuals, spatial layouts'
        },
        {
            'name': 'Action Coach',
            'element': ElementType.FIRE,
            'description': 'Prefers games, action, kinesthetic'
        },
        {
            'name': 'Spiritual Teacher',
            'element': ElementType.AETHER,
            'description': 'Prefers poetry, music, transcendence'
        }
    ]
    
    for user in users:
        print(f"\n{'▀'*70}")
        print(f"USER: {user['name']}")
        print(f"Element: {user['element'].name} | {user['description']}")
        print(f"{'▀'*70}\n")
        
        # Initialize cognitive engine for this user
        engine = UnifiedCognitiveEngine(
            resonance_engine=UnifiedResonanceEngine(),
            codon_gan=CodonResonanceGameGAN(),
            hd_gan=HumanDesignGameGAN(),
            charting_system=ChartingSystem.TROPICAL
        )
        
        engine.initialize_state(
            initial_element=user['element'],
            initial_gates=[1],
            initial_archetype=user['name']
        )
        
        # Initialize FairyGANmatter
        fairy = FairyGANmatter(engine)
        
        # Solve problem - FairyGANmatter will adapt output
        solution = fairy.solve(problem)
        
        print(f"OPTIMAL MODALITY: {solution['modality']}")
        print(f"FRICTION SCORE: {solution['friction_score']:.1%}")
        print(f"\nRENDERED SOLUTION:\n")
        print("─"*70)
        
        # Display rendered content
        content = solution['rendered_content']
        
        if isinstance(content, dict):
            # For game, musical, art - show text rendering
            if 'text_rendering' in content:
                print(content['text_rendering'])
            else:
                import json
                print(json.dumps(content, indent=2))
        else:
            # For text-based outputs
            print(content)
        
        print("─"*70)
        
        # Show alternatives
        print(f"\nALTERNATIVE FORMATS (in order of increasing friction):")
        for alt in solution['alternative_formats']:
            print(f"  • {alt['modality']:20s} (friction: {alt['friction']:.1%})")
        
        print("\n" + "="*70)
        input("\nPress Enter for next user...\n")


def demo_format_comparison():
    """
    Show ALL formats for the same solution side-by-side
    """
    
    print("\n\n╔" + "="*68 + "╗")
    print("║" + " "*20 + "FORMAT COMPARISON" + " "*31 + "║")
    print("╚" + "="*68 + "╝\n")
    
    problem = "How do I overcome procrastination?"
    
    print(f"PROBLEM: {problem}\n")
    print("Showing same solution in ALL formats...\n")
    print("="*70 + "\n")
    
    # Initialize with neutral element
    engine = UnifiedCognitiveEngine(
        resonance_engine=UnifiedResonanceEngine(),
        codon_gan=CodonResonanceGameGAN(),
        hd_gan=HumanDesignGameGAN(),
        charting_system=ChartingSystem.TROPICAL
    )
    
    engine.initialize_state(
        initial_element=ElementType.FIRE,  # Action-oriented for procrastination
        initial_gates=[1, 8],
        initial_archetype="The Mover"
    )
    
    fairy = FairyGANmatter(engine)
    
    # Get solution once
    analysis = fairy.analyze_problem(problem)
    
    # Render in each modality
    modalities_to_show = [
        PerceptionModality.TECHNICAL_DOC,
        PerceptionModality.CONVERSATIONAL,
        PerceptionModality.NARRATIVE_STORY,
        PerceptionModality.VISUAL_DIAGRAM,
        PerceptionModality.POETIC
    ]
    
    for modality in modalities_to_show:
        print(f"\n{'▀'*70}")
        print(f"FORMAT: {modality.value.upper().replace('_', ' ')}")
        print(f"{'▀'*70}\n")
        
        rendered = fairy.render_solution(analysis, force_modality=modality)
        content = rendered['rendered_content']
        
        if isinstance(content, dict) and 'text_rendering' in content:
            print(content['text_rendering'])
        elif isinstance(content, dict):
            import json
            print(json.dumps(content, indent=2))
        else:
            print(content)
        
        print("\n" + "─"*70)
        input("\nPress Enter for next format...\n")


def demo_friction_analysis():
    """
    Show how friction scores vary by modality for different user types
    """
    
    print("\n\n╔" + "="*68 + "╗")
    print("║" + " "*20 + "FRICTION ANALYSIS" + " "*31 + "║")
    print("╚" + "="*68 + "╝\n")
    
    print("Friction scores (0=easy, 1=hard) for each user type:\n")
    
    # Different elements
    elements = [
        ('EARTH - Technical', ElementType.EARTH),
        ('WATER - Creative', ElementType.WATER),
        ('AIR - Visual', ElementType.AIR),
        ('FIRE - Action', ElementType.FIRE),
        ('AETHER - Spiritual', ElementType.AETHER)
    ]
    
    # Modalities to compare
    modalities = [
        'TECHNICAL_DOC',
        'NARRATIVE_STORY',
        'VISUAL_DIAGRAM',
        'INTERACTIVE_GAME',
        'POETIC'
    ]
    
    # Create friction matrix
    print(f"{'User Type':20s} | " + " | ".join([f"{m[:8]:8s}" for m in modalities]))
    print("─" * 70)
    
    for elem_name, element in elements:
        # Initialize
        engine = UnifiedCognitiveEngine(
            resonance_engine=UnifiedResonanceEngine(),
            codon_gan=CodonResonanceGameGAN(),
            hd_gan=HumanDesignGameGAN(),
            charting_system=ChartingSystem.TROPICAL
        )
        
        engine.initialize_state(
            initial_element=element,
            initial_gates=[1],
            initial_archetype=elem_name
        )
        
        fairy = FairyGANmatter(engine)
        
        # Get friction scores
        profile = fairy.user_profile or fairy.analyze_problem("test")['consciousness_state']
        from fairyganmatter_engine import infer_perception_profile
        profile = infer_perception_profile(engine.current_state)
        
        # Build row
        row = f"{elem_name:20s} | "
        for mod_name in modalities:
            mod = PerceptionModality[mod_name]
            friction = profile.friction_scores[mod]
            
            # Color code: low=green, high=red
            if friction < 0.3:
                marker = "✓"
            elif friction < 0.6:
                marker = "○"
            else:
                marker = "✗"
            
            row += f"{marker} {friction:.1f}   | "
        
        print(row)
    
    print("\n✓ = Low friction (0.0-0.3)")
    print("○ = Medium friction (0.3-0.6)")
    print("✗ = High friction (0.6-1.0)")
    print("\n" + "="*70)


def demo_interactive_choice():
    """
    Let user choose their preferred format
    """
    
    print("\n\n╔" + "="*68 + "╗")
    print("║" + " "*18 + "INTERACTIVE DEMO" + " "*33 + "║")
    print("╚" + "="*68 + "╝\n")
    
    # Get user input
    problem = input("What problem are you facing? ")
    print()
    
    # Select element
    print("What resonates with you most?")
    print("1. EARTH - Structure, systems, step-by-step")
    print("2. WATER - Flow, stories, intuition")
    print("3. AIR - Ideas, communication, visuals")
    print("4. FIRE - Action, transformation, energy")
    print("5. AETHER - Transcendence, unity, spirituality")
    
    choice = input("\nYour choice (1-5): ")
    
    element_map = {
        '1': ElementType.EARTH,
        '2': ElementType.WATER,
        '3': ElementType.AIR,
        '4': ElementType.FIRE,
        '5': ElementType.AETHER
    }
    
    element = element_map.get(choice, ElementType.WATER)
    
    print(f"\n{'='*70}")
    print(f"Element: {element.name}")
    print(f"{'='*70}\n")
    
    # Initialize
    engine = UnifiedCognitiveEngine(
        resonance_engine=UnifiedResonanceEngine(),
        codon_gan=CodonResonanceGameGAN(),
        hd_gan=HumanDesignGameGAN(),
        charting_system=ChartingSystem.TROPICAL
    )
    
    engine.initialize_state(
        initial_element=element,
        initial_gates=[1],
        initial_archetype="The Seeker"
    )
    
    # Solve with FairyGANmatter
    fairy = FairyGANmatter(engine)
    solution = fairy.solve(problem)
    
    print(f"OPTIMAL FORMAT: {solution['modality']}")
    print(f"FRICTION: {solution['friction_score']:.1%}\n")
    print("─"*70)
    print(solution['rendered_content'])
    print("─"*70)
    
    # Offer alternatives
    print(f"\nWant to see it differently? Available formats:")
    for i, alt in enumerate(solution['alternative_formats'], 1):
        print(f"{i}. {alt['modality']} (friction: {alt['friction']:.1%})")
    
    alt_choice = input("\nChoose format (1-3) or press Enter to finish: ")
    
    if alt_choice.strip() and alt_choice.isdigit():
        idx = int(alt_choice) - 1
        if 0 <= idx < len(solution['alternative_formats']):
            alt_mod = solution['alternative_formats'][idx]['modality']
            
            # Re-render
            analysis = fairy.analyze_problem(problem)
            rendered = fairy.render_solution(
                analysis,
                force_modality=PerceptionModality[alt_mod.upper()]
            )
            
            print(f"\n{'='*70}")
            print(f"ALTERNATIVE FORMAT: {alt_mod}")
            print(f"{'='*70}\n")
            print(rendered['rendered_content'])


if __name__ == '__main__':
    import torch  # Need for imports
    
    print("\n" + "🌟 "*35)
    print("FAIRYGANMATTER - Adaptive Consciousness Interface Demo")
    print("🌟 "*35 + "\n")
    
    print("Choose demo:")
    print("1. Same problem, different users (shows adaptation)")
    print("2. Format comparison (all formats for one solution)")
    print("3. Friction analysis (see friction matrix)")
    print("4. Interactive (your own problem)")
    
    choice = input("\nYour choice (1-4): ")
    
    demos = {
        '1': demo_same_problem_different_users,
        '2': demo_format_comparison,
        '3': demo_friction_analysis,
        '4': demo_interactive_choice
    }
    
    demo_func = demos.get(choice)
    
    if demo_func:
        demo_func()
    else:
        print("Invalid choice. Running demo 1...")
        demo_same_problem_different_users()
    
    print("\n\n" + "✨"*35)
    print("FAIRYGANMATTER adapts to how YOU perceive best!")
    print("✨"*35 + "\n")
